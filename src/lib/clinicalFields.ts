import type { ClinicalField } from '@/components/dashboard/ClinicalForm';

export const pregnancyFields: ClinicalField[] = [
  { name: 'patientId', label: 'Patient', type: 'select', options: [], required: true },
  { name: 'status', label: 'Status', type: 'select', required: true, options: [
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Lost to follow-up', value: 'LOST_TO_FOLLOW_UP' },
    { label: 'Miscarriage', value: 'MISCARRIAGE' },
    { label: 'Referred', value: 'REFERRED' },
  ] },
  { name: 'estimatedDueDate', label: 'Estimated due date', type: 'date' },
  { name: 'lastMenstrualPeriod', label: 'Last menstrual period', type: 'date' },
  { name: 'gravida', label: 'Gravida', type: 'number' },
  { name: 'para', label: 'Para', type: 'number' },
  { name: 'riskLevel', label: 'Risk level', type: 'number' },
  { name: 'highRiskFlags', label: 'High-risk flags', type: 'tags' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

export const antenatalFields: ClinicalField[] = [
  { name: 'pregnancyEpisodeId', label: 'Pregnancy episode', type: 'select', options: [], required: true },
  { name: 'visitDate', label: 'Visit date', type: 'date', required: true },
  { name: 'gestationalAgeWeeks', label: 'Gestational age weeks', type: 'number' },
  { name: 'bloodPressure', label: 'Blood pressure' },
  { name: 'weight', label: 'Weight', type: 'number' },
  { name: 'fundalHeight', label: 'Fundal height', type: 'number' },
  { name: 'fetalHeartRate', label: 'Fetal heart rate', type: 'number' },
  { name: 'dangerSigns', label: 'Danger signs', type: 'tags' },
  { name: 'interventions', label: 'Interventions', type: 'tags' },
  { name: 'nextVisitDate', label: 'Next visit date', type: 'date' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

export const newbornFields: ClinicalField[] = [
  { name: 'motherPatientId', label: 'Mother patient', type: 'select', options: [] },
  { name: 'pregnancyEpisodeId', label: 'Pregnancy episode', type: 'select', options: [] },
  { name: 'name', label: 'Newborn name' },
  { name: 'dateOfBirth', label: 'Date of birth', type: 'date', required: true },
  { name: 'sex', label: 'Sex', type: 'select', options: [{ label: 'Female', value: 'FEMALE' }, { label: 'Male', value: 'MALE' }] },
  { name: 'birthWeight', label: 'Birth weight', type: 'number' },
  { name: 'apgarOneMinute', label: 'APGAR one minute', type: 'number' },
  { name: 'apgarFiveMinutes', label: 'APGAR five minutes', type: 'number' },
  { name: 'deliveryFacility', label: 'Delivery facility' },
  { name: 'complications', label: 'Complications', type: 'tags' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

export const immunizationFields: ClinicalField[] = [
  { name: 'newbornRecordId', label: 'Newborn record', type: 'select', options: [], required: true },
  { name: 'vaccineName', label: 'Vaccine name', required: true },
  { name: 'doseLabel', label: 'Dose label' },
  { name: 'administeredAt', label: 'Administered date', type: 'date', required: true },
  { name: 'nextDueAt', label: 'Next due date', type: 'date' },
  { name: 'facility', label: 'Facility' },
  { name: 'batchNumber', label: 'Batch number' },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];
