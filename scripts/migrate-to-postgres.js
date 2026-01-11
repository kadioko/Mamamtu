#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// Configuration
const SQLITE_DB_PATH = './prisma/dev.db';
const POSTGRES_URL = process.env.POSTGRES_DATABASE_URL || 'postgresql://user:password@localhost:5432/mamamtu';

async function migrateData() {
  console.log('🚀 Starting migration from SQLite to PostgreSQL...');

  // Initialize clients
  const sqliteClient = new PrismaClient({
    datasources: {
      db: {
        provider: 'sqlite',
        url: `file:${SQLITE_DB_PATH}`,
      },
    },
  });

  const postgresClient = new PrismaClient({
    datasources: {
      db: {
        provider: 'postgresql',
        url: POSTGRES_URL,
      },
    },
  });

  try {
    // Test connections
    console.log('📡 Testing database connections...');
    await sqliteClient.$queryRaw`SELECT 1`;
    await postgresClient.$queryRaw`SELECT 1`;
    console.log('✅ Both databases connected successfully');

    // Migration data structure
    const migrationData = {
      users: [],
      accounts: [],
      sessions: [],
      contentCategories: [],
      content: [],
      patients: [],
      appointments: [],
      medicalRecords: [],
      notifications: [],
      notificationPreferences: [],
      userContentProgress: [],
      contentComments: [],
    };

    // Step 1: Extract data from SQLite
    console.log('📥 Extracting data from SQLite...');
    
    // Users
    const users = await sqliteClient.user.findMany();
    migrationData.users = users.map(user => ({
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
      lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
      accountLockedUntil: user.accountLockedUntil ? new Date(user.accountLockedUntil) : null,
      emailVerificationExpires: user.emailVerificationExpires ? new Date(user.emailVerificationExpires) : null,
      passwordResetExpires: user.passwordResetExpires ? new Date(user.passwordResetExpires) : null,
    }));

    // Accounts
    const accounts = await sqliteClient.account.findMany();
    migrationData.accounts = accounts;

    // Sessions
    const sessions = await sqliteClient.session.findMany();
    migrationData.sessions = sessions.map(session => ({
      ...session,
      expires: new Date(session.expires),
    }));

    // Content Categories
    const contentCategories = await sqliteClient.contentCategory.findMany();
    migrationData.contentCategories = contentCategories.map(cat => ({
      ...cat,
      createdAt: new Date(cat.createdAt),
      updatedAt: new Date(cat.updatedAt),
    }));

    // Content
    const content = await sqliteClient.content.findMany();
    migrationData.content = content.map(item => {
      const data = {
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : null,
        tags: item.tags ? (Array.isArray(item.tags) ? item.tags : JSON.parse(item.tags || '[]')) : [],
      };
      return data;
    });

    // Patients
    const patients = await sqliteClient.patient.findMany();
    migrationData.patients = patients.map(patient => ({
      ...patient,
      dateOfBirth: new Date(patient.dateOfBirth),
      createdAt: new Date(patient.createdAt),
      updatedAt: new Date(patient.updatedAt),
      allergies: patient.allergies ? (Array.isArray(patient.allergies) ? patient.allergies : JSON.parse(patient.allergies || '[]')) : [],
    }));

    // Appointments
    const appointments = await sqliteClient.appointment.findMany();
    migrationData.appointments = appointments.map(apt => ({
      ...apt,
      startTime: new Date(apt.startTime),
      endTime: new Date(apt.endTime),
      createdAt: new Date(apt.createdAt),
      updatedAt: new Date(apt.updatedAt),
    }));

    // Medical Records
    const medicalRecords = await sqliteClient.medicalRecord.findMany();
    migrationData.medicalRecords = medicalRecords.map(record => {
      const data = {
        ...record,
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
        symptoms: record.symptoms ? (Array.isArray(record.symptoms) ? record.symptoms : JSON.parse(record.symptoms || '[]')) : [],
        medications: record.medications ? (Array.isArray(record.medications) ? record.medications : JSON.parse(record.medications || '[]')) : [],
        labResults: record.labResults ? (Array.isArray(record.labResults) ? record.labResults : JSON.parse(record.labResults || '[]')) : [],
        attachments: record.attachments ? (Array.isArray(record.attachments) ? record.attachments : JSON.parse(record.attachments || '[]')) : [],
        vitals: record.vitals ? JSON.parse(record.vitals) : null,
      };
      return data;
    });

    // Notifications
    const notifications = await sqliteClient.notification.findMany();
    migrationData.notifications = notifications.map(notif => ({
      ...notif,
      createdAt: new Date(notif.createdAt),
      updatedAt: new Date(notif.updatedAt),
      scheduledFor: notif.scheduledFor ? new Date(notif.scheduledFor) : null,
      sentAt: notif.sentAt ? new Date(notif.sentAt) : null,
      readAt: notif.readAt ? new Date(notif.readAt) : null,
      metadata: notif.metadata ? JSON.parse(notif.metadata) : null,
    }));

    // Notification Preferences
    const notificationPreferences = await sqliteClient.notificationPreference.findMany();
    migrationData.notificationPreferences = notificationPreferences.map(pref => ({
      ...pref,
      createdAt: new Date(pref.createdAt),
      updatedAt: new Date(pref.updatedAt),
    }));

    // User Content Progress
    const userContentProgress = await sqliteClient.userContentProgress.findMany();
    migrationData.userContentProgress = userContentProgress.map(progress => ({
      ...progress,
      completedAt: progress.completedAt ? new Date(progress.completedAt) : null,
      lastAccessedAt: new Date(progress.lastAccessedAt),
      createdAt: new Date(progress.createdAt),
      updatedAt: new Date(progress.updatedAt),
    }));

    // Content Comments
    const contentComments = await sqliteClient.contentComment.findMany();
    migrationData.contentComments = contentComments.map(comment => ({
      ...comment,
      createdAt: new Date(comment.createdAt),
      updatedAt: new Date(comment.updatedAt),
    }));

    // Step 2: Insert data into PostgreSQL
    console.log('📤 Inserting data into PostgreSQL...');

    await postgresClient.$transaction(async (tx) => {
      // Insert in order of dependencies
      for (const user of migrationData.users) {
        await tx.user.create({ data: user });
      }
      console.log(`✅ Users: ${migrationData.users.length} records`);

      for (const account of migrationData.accounts) {
        await tx.account.create({ data: account });
      }
      console.log(`✅ Accounts: ${migrationData.accounts.length} records`);

      for (const session of migrationData.sessions) {
        await tx.session.create({ data: session });
      }
      console.log(`✅ Sessions: ${migrationData.sessions.length} records`);

      for (const category of migrationData.contentCategories) {
        await tx.contentCategory.create({ data: category });
      }
      console.log(`✅ Content Categories: ${migrationData.contentCategories.length} records`);

      for (const contentItem of migrationData.content) {
        await tx.content.create({ data: contentItem });
      }
      console.log(`✅ Content: ${migrationData.content.length} records`);

      for (const patient of migrationData.patients) {
        await tx.patient.create({ data: patient });
      }
      console.log(`✅ Patients: ${migrationData.patients.length} records`);

      for (const appointment of migrationData.appointments) {
        await tx.appointment.create({ data: appointment });
      }
      console.log(`✅ Appointments: ${migrationData.appointments.length} records`);

      for (const record of migrationData.medicalRecords) {
        await tx.medicalRecord.create({ data: record });
      }
      console.log(`✅ Medical Records: ${migrationData.medicalRecords.length} records`);

      for (const notification of migrationData.notifications) {
        await tx.notification.create({ data: notification });
      }
      console.log(`✅ Notifications: ${migrationData.notifications.length} records`);

      for (const preference of migrationData.notificationPreferences) {
        await tx.notificationPreference.create({ data: preference });
      }
      console.log(`✅ Notification Preferences: ${migrationData.notificationPreferences.length} records`);

      for (const progress of migrationData.userContentProgress) {
        await tx.userContentProgress.create({ data: progress });
      }
      console.log(`✅ User Content Progress: ${migrationData.userContentProgress.length} records`);

      for (const comment of migrationData.contentComments) {
        await tx.contentComment.create({ data: comment });
      }
      console.log(`✅ Content Comments: ${migrationData.contentComments.length} records`);
    });

    console.log('🎉 Migration completed successfully!');
    
    // Summary
    console.log('\n📊 Migration Summary:');
    Object.entries(migrationData).forEach(([key, value]) => {
      console.log(`  ${key}: ${value.length} records`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }
}

// Backup current schema
function backupCurrentSchema() {
  const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
  const backupPath = path.join(__dirname, '../prisma/schema-sqlite-backup.prisma');
  
  if (fs.existsSync(schemaPath)) {
    fs.copyFileSync(schemaPath, backupPath);
    console.log('📋 Current SQLite schema backed up');
  }
}

// Main execution
async function main() {
  try {
    // Backup current schema
    backupCurrentSchema();
    
    // Run migration
    await migrateData();
    
    console.log('\n🔄 Next steps:');
    console.log('1. Update your .env file to use POSTGRES_DATABASE_URL');
    console.log('2. Replace schema.prisma with schema-postgres.prisma');
    console.log('3. Run: npx prisma migrate dev --name init-postgres');
    console.log('4. Run: npx prisma generate');
    console.log('5. Test the application');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { migrateData };
