require('dotenv/config');

const { PrismaClient, ContentType, DifficultyLevel, UserRole } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

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

const categories = [
  { name: 'Pregnancy Basics', description: 'Foundational guidance for pregnancy care and healthy routines.', slug: 'pregnancy-basics' },
  { name: 'Newborn Care', description: 'Practical newborn health, feeding, and safety education.', slug: 'newborn-care' },
  { name: 'Warning Signs', description: 'When to seek urgent care during pregnancy and after birth.', slug: 'warning-signs' },
  { name: 'Nutrition', description: 'Nutrition guidance for pregnancy, breastfeeding, and recovery.', slug: 'nutrition' },
];

const resources = [
  { title: 'Your First Antenatal Visit', slug: 'your-first-antenatal-visit', description: 'What to expect during the first clinic visit, including screening and care planning.', content: 'Your first antenatal visit helps the care team understand your health, estimate pregnancy dates, screen for risks, and plan follow-up visits. Bring current medicines, previous clinic records, and questions you want answered.', type: ContentType.ARTICLE, difficulty: DifficultyLevel.BEGINNER, duration: 6, categorySlug: 'pregnancy-basics', tags: ['antenatal', 'pregnancy', 'clinic visit'], isFeatured: true },
  { title: 'Danger Signs During Pregnancy', slug: 'danger-signs-during-pregnancy', description: 'Symptoms that need urgent medical attention.', content: 'Seek urgent care if you notice heavy bleeding, severe headache, blurred vision, swelling of the face or hands, fever, severe abdominal pain, convulsions, or reduced baby movements. Quick care can protect both mother and baby.', type: ContentType.ARTICLE, difficulty: DifficultyLevel.BEGINNER, duration: 5, categorySlug: 'warning-signs', tags: ['danger signs', 'emergency', 'pregnancy'], isFeatured: true },
  { title: 'Eating Well During Pregnancy', slug: 'eating-well-during-pregnancy', description: 'Simple food choices that support maternal health and fetal growth.', content: 'Aim for regular meals with vegetables, fruits, whole grains, beans, eggs, fish, lean meats, milk, and safe drinking water. Take prescribed iron and folic acid, and ask your clinician before using supplements or herbal medicines.', type: ContentType.ARTICLE, difficulty: DifficultyLevel.BEGINNER, duration: 7, categorySlug: 'nutrition', tags: ['nutrition', 'iron', 'folic acid'], isFeatured: false },
  { title: 'Breastfeeding in the First Hour', slug: 'breastfeeding-in-the-first-hour', description: 'Why early breastfeeding matters and how caregivers can support it.', content: 'Starting breastfeeding within the first hour helps keep the baby warm, supports bonding, and gives the baby colostrum. Colostrum is the first milk and is rich in protection for the newborn.', type: ContentType.ARTICLE, difficulty: DifficultyLevel.BEGINNER, duration: 4, categorySlug: 'newborn-care', tags: ['breastfeeding', 'newborn', 'colostrum'], isFeatured: true },
  { title: 'Newborn Warning Signs', slug: 'newborn-warning-signs', description: 'Signs in a newborn that should prompt immediate clinic or hospital care.', content: 'Get urgent care if a newborn has trouble breathing, fever or low temperature, poor feeding, yellow palms or soles, convulsions, severe weakness, repeated vomiting, or pus around the cord or eyes.', type: ContentType.ARTICLE, difficulty: DifficultyLevel.BEGINNER, duration: 5, categorySlug: 'warning-signs', tags: ['newborn', 'danger signs', 'urgent care'], isFeatured: true },
  { title: 'Postnatal Recovery Checklist', slug: 'postnatal-recovery-checklist', description: 'A simple checklist for rest, bleeding, mood, feeding, and follow-up after birth.', content: 'After birth, monitor bleeding, pain, fever, mood, feeding, and wound healing. Attend postnatal visits even when you feel well. Ask for help early if you feel overwhelmed, very sad, or unsafe.', type: ContentType.ARTICLE, difficulty: DifficultyLevel.INTERMEDIATE, duration: 6, categorySlug: 'pregnancy-basics', tags: ['postnatal', 'recovery', 'mental health'], isFeatured: false },
];

const longResources = [
  {
    title: 'Understanding High-Risk Pregnancy Care',
    slug: 'understanding-high-risk-pregnancy-care',
    description: 'A practical guide to risk factors, extra clinic visits, referral planning, and home monitoring.',
    content: `A high-risk pregnancy does not mean something bad will happen. It means the care team has identified one or more factors that need closer follow-up. Examples include high blood pressure, diabetes, severe anemia, previous cesarean birth, previous heavy bleeding after birth, twins, teenage pregnancy, pregnancy after age 35, or a baby that is not growing as expected.

The most important step is to keep every scheduled visit. At each visit, the clinician may check blood pressure, urine protein, weight, fetal growth, fetal heartbeat, medicines, symptoms, and the birth plan. Some mothers need more frequent visits, laboratory tests, ultrasound scans, or referral to a higher-level facility.

At home, pay attention to danger signs. Seek urgent care for severe headache, blurred vision, swelling of the face or hands, convulsions, heavy bleeding, fever, severe abdominal pain, leaking fluid before labor, or reduced baby movements. Do not wait for the next appointment if these signs appear.

A strong plan makes high-risk care safer. Keep emergency transport contacts ready, identify a birth companion, save clinic phone numbers, and know which facility can handle emergencies. If medicine is prescribed, take it exactly as directed and ask before stopping it. Good communication with the care team can prevent small changes from becoming emergencies.`,
    type: ContentType.ARTICLE,
    difficulty: DifficultyLevel.INTERMEDIATE,
    duration: 12,
    categorySlug: 'pregnancy-basics',
    tags: ['high risk', 'blood pressure', 'referral', 'birth plan'],
    isFeatured: true,
  },
  {
    title: 'Antenatal Visit Schedule and What Each Visit Checks',
    slug: 'antenatal-visit-schedule-and-what-each-visit-checks',
    description: 'A longer walk-through of ANC timing, routine checks, counseling, and follow-up planning.',
    content: `Antenatal care is not only for checking the baby. It is a series of planned contacts that help prevent illness, detect problems early, and prepare the family for birth and newborn care. Even when pregnancy feels normal, ANC visits are useful because some risks, such as high blood pressure or anemia, can develop quietly.

During early visits, the care team confirms pregnancy dates, reviews previous pregnancies, checks medicines, screens for infections, and starts iron and folic acid when appropriate. The mother also receives counseling on nutrition, rest, safe physical activity, danger signs, and when to return.

In the middle of pregnancy, visits often focus on fetal growth, maternal weight, blood pressure, anemia symptoms, urine testing, fetal heartbeat, and movement counseling. This is also a good time to discuss birth preparedness: transport, savings, blood donor plans where relevant, the preferred facility, and who will support the mother.

Later visits prepare for labor and newborn care. The clinician checks position of the baby, swelling, blood pressure, warning signs, and any conditions that may require referral. Families should review what to pack, when to go to the facility, how to start breastfeeding early, and why postnatal visits matter.

If a visit is missed, the safest action is to reschedule quickly. Missed visits are common when transport, work, childcare, or fear gets in the way. The goal is not blame. The goal is to reconnect the mother with care and solve the barrier before it causes risk.`,
    type: ContentType.ARTICLE,
    difficulty: DifficultyLevel.BEGINNER,
    duration: 10,
    categorySlug: 'pregnancy-basics',
    tags: ['ANC', 'clinic visit', 'birth preparedness', 'follow-up'],
    isFeatured: true,
  },
  {
    title: 'Newborn Immunizations: Why Timing Matters',
    slug: 'newborn-immunizations-why-timing-matters',
    description: 'How vaccines protect babies, why missed doses should be caught up, and what caregivers should track.',
    content: `Newborn and infant vaccines protect babies before they are strong enough to fight serious infections on their own. Some vaccines are given at birth, while others are given at later clinic visits. The exact schedule depends on national guidance, but the principle is the same: timely doses give protection when the baby needs it most.

Caregivers should keep the clinic card safe and bring it to every visit. The card helps the nurse know which vaccines have already been given, which dose is next, and whether any dose was missed. If a dose is missed, do not restart the whole schedule unless a clinician says so. Most babies can continue with catch-up doses.

After vaccination, mild fever, fussiness, or swelling at the injection site can happen. These usually improve with comfort, feeding, and advice from the clinic. Seek care urgently if the baby has trouble breathing, convulsions, very high fever, persistent crying that cannot be soothed, poor feeding, or weakness.

Immunization visits are also opportunities to check weight, feeding, jaundice, cord healing, and caregiver concerns. A short vaccine visit can prevent disease and also catch early newborn problems.`,
    type: ContentType.ARTICLE,
    difficulty: DifficultyLevel.BEGINNER,
    duration: 9,
    categorySlug: 'newborn-care',
    tags: ['immunization', 'vaccines', 'newborn', 'clinic card'],
    isFeatured: true,
  },
  {
    title: 'Postpartum Mental Health: When Sadness Needs Support',
    slug: 'postpartum-mental-health-when-sadness-needs-support',
    description: 'How to recognize postpartum mood concerns and build a supportive care plan.',
    content: `Many mothers feel emotional after birth. Tiredness, pain, feeding difficulties, family pressure, and lack of sleep can make recovery feel heavy. Short periods of crying or worry can happen, but symptoms that continue, worsen, or make daily care difficult deserve support.

Warning signs include feeling sad most of the day, losing interest in usual activities, feeling worthless, panic, severe anxiety, sleeping very little even when the baby sleeps, feeling disconnected from the baby, or thoughts of self-harm. These symptoms are health concerns, not personal failure.

Support starts with listening without blame. A trusted person can help with meals, cleaning, baby care, clinic visits, and rest. The mother should be encouraged to speak with a clinician, especially if symptoms last more than two weeks or include thoughts of harm. Emergency help is needed immediately if the mother may hurt herself or someone else.

Clinic teams can screen mood, check anemia or thyroid symptoms where appropriate, review pain and sleep, and connect the family to counseling or treatment. Recovery is possible, and early support protects both mother and baby.`,
    type: ContentType.ARTICLE,
    difficulty: DifficultyLevel.INTERMEDIATE,
    duration: 11,
    categorySlug: 'warning-signs',
    tags: ['postpartum', 'mental health', 'support', 'danger signs'],
    isFeatured: false,
  },
];

async function main() {
  const author = await prisma.user.findFirst({
    where: { role: { in: [UserRole.ADMIN, UserRole.HEALTHCARE_PROVIDER] } },
    select: { id: true },
  });

  if (!author) {
    throw new Error('Run seed:staff before seeding education content.');
  }

  const categoryIds = new Map();
  for (const category of categories) {
    const saved = await prisma.contentCategory.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description },
      create: category,
      select: { id: true, slug: true },
    });
    categoryIds.set(saved.slug, saved.id);
  }

  for (const resource of [...resources, ...longResources]) {
    const categoryId = categoryIds.get(resource.categorySlug);
    await prisma.content.upsert({
      where: { slug: resource.slug },
      update: { title: resource.title, description: resource.description, content: resource.content, type: resource.type, difficulty: resource.difficulty, duration: resource.duration, categoryId, tags: resource.tags, isPublished: true, publishedAt: new Date(), isFeatured: resource.isFeatured },
      create: { title: resource.title, slug: resource.slug, description: resource.description, content: resource.content, type: resource.type, difficulty: resource.difficulty, duration: resource.duration, authorId: author.id, categoryId, tags: resource.tags, isPublished: true, publishedAt: new Date(), isFeatured: resource.isFeatured },
    });
  }

  const count = await prisma.content.count({ where: { isPublished: true } });
  console.log(`Education resources are ready. Published resources: ${count}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
