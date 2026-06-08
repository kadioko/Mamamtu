try {
  require('dotenv/config');
} catch {
  // Vercel provides environment variables at runtime; dotenv is only needed locally.
}

const {
  AppointmentStatus,
  AppointmentType,
  AuditAction,
  PregnancyStatus,
  PrismaClient,
  RecordType,
  UserRole,
} = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const TARGETS = {
  mothersRegistered: 48,
  ancVisitsRecorded: 124,
  followUpsScheduled: 31,
  activePregnancies: 22,
};

const DECK_PATIENT_PREFIX = 'DECK-DEMO-';
const DECK_APPOINTMENT_MARKER = '[deck-demo-follow-up]';
const DECK_PREGNANCY_NOTE = '[deck-demo-active-pregnancy]';
const DECK_RECORD_MARKER = '[deck-demo-clinical-record]';
const DECK_EXPORT_MARKER = '[deck-demo-export]';

function getDatabaseUrlForPgAdapter() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required');

  const url = new URL(databaseUrl);
  if (url.searchParams.get('sslmode') === 'require' && !url.searchParams.has('uselibpqcompat')) {
    url.searchParams.set('uselibpqcompat', 'true');
  }
  return url.toString();
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: getDatabaseUrlForPgAdapter(), max: 1 }),
});

const firstNames = [
  'Amina', 'Neema', 'Rehema', 'Zawadi', 'Upendo', 'Mariam', 'Halima', 'Grace',
  'Agnes', 'Joyce', 'Sophia', 'Fatuma', 'Rose', 'Monica', 'Ester', 'Janeth',
  'Hadija', 'Lilian', 'Nuru', 'Salma', 'Veronica', 'Pendo', 'Anna', 'Lucy',
  'Elizabeth', 'Naomi', 'Farida', 'Tunu', 'Clara', 'Beatrice', 'Diana', 'Martha',
  'Hawa', 'Saumu', 'Irene', 'Flora', 'Magdalena', 'Christina', 'Ruth', 'Mercy',
  'Prisca', 'Editha', 'Stella', 'Tumaini', 'Mwanaidi', 'Zainabu', 'Sara', 'Leah',
];

const lastNames = [
  'Mosha', 'Msuya', 'Mtei', 'Mwakalinga', 'Mbise', 'Mfinanga', 'Mrope', 'Kimaro',
  'Mwakasege', 'Nyoni', 'Kileo', 'Mushi', 'Massawe', 'Swai', 'Shayo', 'Mrema',
  'Mwakyusa', 'Mhando', 'Nnko', 'Mwakitalu', 'Ngowi', 'Macha', 'Mwakalinga',
  'Sanga', 'Mabula', 'Ngalawa', 'Chuwa', 'Lema', 'Mziray', 'Mollel',
];

function yearsAgo(years, month, day) {
  const date = new Date();
  date.setFullYear(date.getFullYear() - years, month, day);
  date.setHours(0, 0, 0, 0);
  return date;
}

function daysFromNow(days, hour = 9) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

function deckPatientId(index) {
  return `${DECK_PATIENT_PREFIX}${String(index).padStart(3, '0')}`;
}

async function removeExistingDeckDemoRecords() {
  const deckPatients = await prisma.patient.findMany({
    where: { patientId: { startsWith: DECK_PATIENT_PREFIX } },
    select: { id: true },
  });
  const deckPatientIds = deckPatients.map((patient) => patient.id);

  if (deckPatientIds.length > 0) {
    await prisma.auditLog.deleteMany({ where: { patientId: { in: deckPatientIds } } });
    await prisma.notification.deleteMany({ where: { patientId: { in: deckPatientIds } } });
    await prisma.medicalRecord.deleteMany({ where: { patientId: { in: deckPatientIds } } });
    await prisma.appointment.deleteMany({ where: { patientId: { in: deckPatientIds } } });
    await prisma.antenatalVisit.deleteMany({
      where: { pregnancyEpisode: { patientId: { in: deckPatientIds } } },
    });
    await prisma.newbornRecord.deleteMany({ where: { motherPatientId: { in: deckPatientIds } } });
    await prisma.pregnancyEpisode.deleteMany({ where: { patientId: { in: deckPatientIds } } });
    await prisma.patient.deleteMany({ where: { id: { in: deckPatientIds } } });
  }

  await prisma.auditLog.deleteMany({
    where: {
      resource: 'Export',
      metadata: { path: ['seedBatch'], equals: 'deck-demo' },
    },
  });
}

async function getCurrentDeckCounts() {
  const now = new Date();

  const [
    mothersRegistered,
    ancVisitsRecorded,
    followUpsScheduled,
    activePregnancies,
  ] = await Promise.all([
    prisma.patient.count({ where: { isActive: true, gender: 'FEMALE' } }),
    prisma.antenatalVisit.count(),
    prisma.appointment.count({
      where: {
        type: AppointmentType.FOLLOW_UP,
        status: { in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] },
        startTime: { gte: now },
      },
    }),
    prisma.pregnancyEpisode.count({ where: { status: PregnancyStatus.ACTIVE } }),
  ]);

  return {
    mothersRegistered,
    ancVisitsRecorded,
    followUpsScheduled,
    activePregnancies,
  };
}

function requireTargetCanBeReached(baseCounts) {
  const blockers = Object.entries(TARGETS)
    .filter(([key, target]) => baseCounts[key] > target)
    .map(([key, target]) => `${key}: current ${baseCounts[key]} is above target ${target}`);

  if (blockers.length > 0) {
    throw new Error(`Cannot seed exact deck metrics without deleting non-deck data:\n${blockers.join('\n')}`);
  }
}

async function findProvider() {
  const provider =
    await prisma.user.findFirst({ where: { role: UserRole.HEALTHCARE_PROVIDER, isActive: true } }) ||
    await prisma.user.findFirst({ where: { role: UserRole.ADMIN, isActive: true } });

  if (!provider) {
    throw new Error('Seed a provider or admin user before creating deck demo appointments.');
  }

  return provider;
}

async function createDeckPatients(count) {
  const patients = [];

  for (let index = 1; index <= count; index += 1) {
    const firstName = firstNames[(index - 1) % firstNames.length];
    const lastName = lastNames[(index - 1) % lastNames.length];
    const patient = await prisma.patient.create({
      data: {
        patientId: deckPatientId(index),
        firstName,
        lastName,
        dateOfBirth: yearsAgo(19 + (index % 21), index % 12, (index % 24) + 1),
        gender: 'FEMALE',
        phone: `+25575${String(1000000 + index).slice(-7)}`,
        city: ['Dar es Salaam', 'Dodoma', 'Mwanza', 'Arusha', 'Morogoro'][index % 5],
        country: 'Tanzania',
        bloodType: ['O+', 'A+', 'B+', 'AB+'][index % 4],
        allergies: [],
        medicalHistory: 'Deck demo maternal health record for pilot environment metrics.',
        emergencyContactName: `${lastName} Family Contact`,
        emergencyContactPhone: `+25576${String(2000000 + index).slice(-7)}`,
        notes: 'Created by seed-deck-demo-metrics for pitch deck metric alignment.',
        isActive: true,
      },
    });

    patients.push(patient);
  }

  return patients;
}

async function createActivePregnancies(patients, count) {
  const episodes = [];

  for (let index = 0; index < count; index += 1) {
    const patient = patients[index % patients.length];
    const episode = await prisma.pregnancyEpisode.create({
      data: {
        patientId: patient.id,
        status: PregnancyStatus.ACTIVE,
        estimatedDueDate: daysFromNow(80 + (index * 9) % 150),
        lastMenstrualPeriod: daysFromNow(-120 - (index * 3) % 90),
        gravida: 1 + (index % 4),
        para: index % 3,
        riskLevel: index % 5 === 0 ? 2 : index % 3 === 0 ? 1 : 0,
        highRiskFlags: index % 5 === 0 ? ['Deck demo: high-risk follow-up'] : [],
        notes: DECK_PREGNANCY_NOTE,
      },
    });

    episodes.push(episode);
  }

  return episodes;
}

async function createAncVisits(episodes, count, provider) {
  for (let index = 0; index < count; index += 1) {
    const episode = episodes[index % episodes.length];
    await prisma.antenatalVisit.create({
      data: {
        pregnancyEpisodeId: episode.id,
        visitDate: daysFromNow(-90 + (index % 90), 8 + (index % 6)),
        gestationalAgeWeeks: 12 + (index % 25),
        bloodPressure: index % 6 === 0 ? '138/88' : '116/74',
        weight: 54 + (index % 18),
        fundalHeight: 18 + (index % 18),
        fetalHeartRate: 132 + (index % 18),
        dangerSigns: index % 17 === 0 ? ['Headache'] : [],
        interventions: ['Routine ANC package', index % 4 === 0 ? 'Iron and folate counseling' : 'Danger sign counseling'],
        nextVisitDate: daysFromNow(14 + (index % 21), 9),
        notes: 'Deck demo ANC visit used for pitch environment metrics.',
        recordedBy: provider.name || provider.email,
      },
    });
  }
}

async function createFollowUps(patients, count, provider) {
  for (let index = 0; index < count; index += 1) {
    const patient = patients[index % patients.length];
    const startTime = daysFromNow(1 + index, 9 + (index % 7));
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 30);

    await prisma.appointment.create({
      data: {
        title: `Deck demo follow-up ${index + 1}`,
        description: `${DECK_APPOINTMENT_MARKER} Scheduled maternal follow-up for pitch demo metrics.`,
        startTime,
        endTime,
        status: index % 4 === 0 ? AppointmentStatus.CONFIRMED : AppointmentStatus.SCHEDULED,
        type: AppointmentType.FOLLOW_UP,
        location: ['ANC Room 1', 'ANC Room 2', 'Community Follow-up Desk'][index % 3],
        notes: DECK_APPOINTMENT_MARKER,
        patientId: patient.id,
        createdById: provider.id,
      },
    });
  }
}

async function createMedicalRecords(patients, provider) {
  const recordTemplates = [
    {
      recordType: RecordType.PRENATAL_VISIT,
      title: 'ANC risk review',
      diagnosis: 'Routine pregnancy follow-up',
      treatment: 'Continue iron, folate, nutrition counseling, and scheduled ANC follow-up.',
    },
    {
      recordType: RecordType.CONSULTATION,
      title: 'Maternal consultation',
      diagnosis: 'Stable maternal presentation',
      treatment: 'Reviewed danger signs and birth preparedness plan.',
    },
    {
      recordType: RecordType.LAB_RESULT,
      title: 'Hemoglobin and urinalysis review',
      diagnosis: 'Mild anemia surveillance',
      treatment: 'Diet counseling and repeat hemoglobin at next visit.',
    },
  ];

  for (let index = 0; index < patients.length; index += 1) {
    const patient = patients[index];
    const template = recordTemplates[index % recordTemplates.length];
    const createdAt = daysFromNow(-14 + (index % 14), 10);

    await prisma.medicalRecord.create({
      data: {
        patientId: patient.id,
        recordType: template.recordType,
        title: template.title,
        description: `${DECK_RECORD_MARKER} Linked clinical record for deck demo continuity.`,
        diagnosis: template.diagnosis,
        symptoms: index % 7 === 0 ? ['Headache', 'Dizziness'] : [],
        treatment: template.treatment,
        medications: ['Iron and folic acid'],
        labResults: index % 3 === 0
          ? { hemoglobin: `${10 + (index % 3)}.${index % 9} g/dL`, urineProtein: index % 6 === 0 ? 'Trace' : 'Negative' }
          : undefined,
        vitals: {
          bloodPressure: index % 6 === 0 ? '138/88' : '116/74',
          pulse: 76 + (index % 12),
          temperature: '36.8 C',
          oxygenSaturation: '98%',
          weight: `${55 + (index % 16)} kg`,
        },
        healthcareProvider: provider.name || provider.email,
        facility: ['Muhimbili ANC Clinic', 'Amana Regional Clinic', 'Mwananyamala Maternal Unit'][index % 3],
        notes: 'Deck demo record links patient registration, pregnancy tracking, vitals, and reports.',
        attachments: index % 4 === 0 ? JSON.stringify([{ name: 'ANC card scan', url: '/demo/anc-card.pdf' }]) : null,
        recordedBy: provider.id,
        createdAt,
        updatedAt: createdAt,
      },
    });
  }
}

async function createNewbornsAndImmunizations(episodes) {
  const newbornCount = Math.min(10, episodes.length);
  const vaccineSchedule = [
    { vaccineName: 'BCG', doseLabel: 'Birth dose', nextOffset: 14 },
    { vaccineName: 'OPV', doseLabel: 'OPV-0', nextOffset: 20 },
    { vaccineName: 'Hepatitis B', doseLabel: 'Birth dose', nextOffset: 42 },
  ];

  for (let index = 0; index < newbornCount; index += 1) {
    const episode = episodes[index % episodes.length];
    const dateOfBirth = daysFromNow(-28 + (index % 21), 6);

    const newborn = await prisma.newbornRecord.create({
      data: {
        motherPatientId: episode.patientId,
        pregnancyEpisodeId: episode.id,
        name: ['Baraka', 'Tumaini', 'Neema', 'Imani', 'Zuri'][index % 5],
        dateOfBirth,
        sex: index % 2 === 0 ? 'FEMALE' : 'MALE',
        birthWeight: 2.7 + (index % 6) * 0.15,
        apgarOneMinute: 7 + (index % 3),
        apgarFiveMinutes: 8 + (index % 2),
        deliveryFacility: ['Muhimbili ANC Clinic', 'Amana Regional Clinic', 'Mwananyamala Maternal Unit'][index % 3],
        complications: index % 5 === 0 ? ['Low birth weight monitoring'] : [],
        notes: 'Deck demo newborn linked to maternal patient, pregnancy episode, and immunizations.',
      },
    });

    const vaccinesForBaby = vaccineSchedule.slice(0, index % 3 === 0 ? 3 : 2);
    for (const vaccine of vaccinesForBaby) {
      await prisma.immunization.create({
        data: {
          newbornRecordId: newborn.id,
          vaccineName: vaccine.vaccineName,
          doseLabel: vaccine.doseLabel,
          administeredAt: dateOfBirth,
          nextDueAt: daysFromNow(vaccine.nextOffset + index, 9),
          facility: newborn.deliveryFacility,
          batchNumber: `TZ-DEMO-${String(index + 1).padStart(3, '0')}`,
          notes: 'Deck demo immunization connected to newborn record.',
        },
      });
    }
  }
}

async function createExportHistory(provider) {
  const exports = [
    { type: 'patients', format: 'csv', rowCount: TARGETS.mothersRegistered },
    { type: 'antenatal-visits', format: 'csv', rowCount: TARGETS.ancVisitsRecorded },
    { type: 'pregnancies', format: 'pdf', rowCount: TARGETS.activePregnancies },
  ];

  for (let index = 0; index < exports.length; index += 1) {
    const item = exports[index];
    await prisma.auditLog.create({
      data: {
        userId: provider.id,
        action: AuditAction.MEDICAL_RECORD_VIEWED,
        resource: 'Export',
        resourceId: `deck-demo-export-${index + 1}`,
        metadata: {
          ...item,
          seedBatch: 'deck-demo',
          marker: DECK_EXPORT_MARKER,
        },
        createdAt: daysFromNow(-index, 15),
      },
    });
  }
}

async function main() {
  await removeExistingDeckDemoRecords();

  const baseCounts = await getCurrentDeckCounts();
  requireTargetCanBeReached(baseCounts);

  const provider = await findProvider();
  const patientsToCreate = TARGETS.mothersRegistered - baseCounts.mothersRegistered;
  const pregnanciesToCreate = TARGETS.activePregnancies - baseCounts.activePregnancies;
  const ancVisitsToCreate = TARGETS.ancVisitsRecorded - baseCounts.ancVisitsRecorded;
  const followUpsToCreate = TARGETS.followUpsScheduled - baseCounts.followUpsScheduled;

  const deckPatients = await createDeckPatients(patientsToCreate);
  const pregnancyPatients = deckPatients.length > 0
    ? deckPatients
    : await prisma.patient.findMany({ where: { isActive: true, gender: 'FEMALE' }, take: 1 });

  if (pregnancyPatients.length === 0 && (pregnanciesToCreate > 0 || followUpsToCreate > 0)) {
    throw new Error('No mother records are available for deck pregnancies or follow-ups.');
  }

  const deckEpisodes = pregnanciesToCreate > 0
    ? await createActivePregnancies(pregnancyPatients, pregnanciesToCreate)
    : await prisma.pregnancyEpisode.findMany({ where: { status: PregnancyStatus.ACTIVE }, take: 1 });

  if (deckEpisodes.length === 0 && ancVisitsToCreate > 0) {
    throw new Error('No pregnancy episodes are available for deck ANC visits.');
  }

  await createAncVisits(deckEpisodes, ancVisitsToCreate, provider);
  await createFollowUps(pregnancyPatients, followUpsToCreate, provider);
  await createMedicalRecords(pregnancyPatients, provider);
  await createNewbornsAndImmunizations(deckEpisodes);
  await createExportHistory(provider);

  const finalCounts = await getCurrentDeckCounts();
  console.table([
    { metric: 'Mothers Registered', value: finalCounts.mothersRegistered, target: TARGETS.mothersRegistered },
    { metric: 'ANC Visits Recorded', value: finalCounts.ancVisitsRecorded, target: TARGETS.ancVisitsRecorded },
    { metric: 'Follow-Ups Scheduled', value: finalCounts.followUpsScheduled, target: TARGETS.followUpsScheduled },
    { metric: 'Active Pregnancies', value: finalCounts.activePregnancies, target: TARGETS.activePregnancies },
  ]);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
