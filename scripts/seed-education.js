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
  adapter: new PrismaPg({ connectionString: getDatabaseUrlForPgAdapter() }),
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

  for (const resource of resources) {
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
