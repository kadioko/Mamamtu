#!/usr/bin/env node
require('dotenv/config');

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const fs = require('fs');
const path = require('path');

function getDatabaseUrlForPgAdapter() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required');

  const url = new URL(databaseUrl);
  if (url.searchParams.get('sslmode') === 'require' && !url.searchParams.has('uselibpqcompat')) {
    url.searchParams.set('uselibpqcompat', 'true');
  }
  return url.toString();
}

async function backupDatabase() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '../backups');
  
  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString: getDatabaseUrlForPgAdapter() }),
  });
  
  try {
    console.log('🔄 Creating database backup...');
    
    // Get all data
    const data = {
      users: await client.user.findMany(),
      accounts: await client.account.findMany(),
      sessions: await client.session.findMany(),
      contentCategories: await client.contentCategory.findMany(),
      content: await client.content.findMany(),
      patients: await client.patient.findMany(),
      appointments: await client.appointment.findMany(),
      medicalRecords: await client.medicalRecord.findMany(),
      notifications: await client.notification.findMany(),
      notificationPreferences: await client.notificationPreference.findMany(),
      userContentProgress: await client.userContentProgress.findMany(),
      contentComments: await client.contentComment.findMany(),
    };

    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(data, null, 2));
    
    console.log(`✅ Backup created: ${backupFile}`);
    console.log(`📊 Total records: ${Object.values(data).reduce((sum, arr) => sum + arr.length, 0)}`);
    
  } catch (error) {
    console.error('❌ Backup failed:', error);
    process.exit(1);
  } finally {
    await client.$disconnect();
  }
}

if (require.main === module) {
  backupDatabase();
}

module.exports = { backupDatabase };
