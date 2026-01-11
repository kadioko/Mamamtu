#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function restoreDatabase(backupFile) {
  if (!backupFile) {
    console.error('❌ Please specify a backup file');
    console.log('Usage: node scripts/restore-database.js <backup-file>');
    process.exit(1);
  }

  const backupPath = path.resolve(backupFile);
  
  if (!fs.existsSync(backupPath)) {
    console.error(`❌ Backup file not found: ${backupPath}`);
    process.exit(1);
  }

  const client = new PrismaClient();
  
  try {
    console.log(`🔄 Restoring from backup: ${backupPath}`);
    
    // Load backup data
    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    // Clear existing data (in reverse order of dependencies)
    console.log('🗑️  Clearing existing data...');
    await client.$transaction(async (tx) => {
      await tx.contentComment.deleteMany();
      await tx.userContentProgress.deleteMany();
      await tx.notificationPreference.deleteMany();
      await tx.notification.deleteMany();
      await tx.medicalRecord.deleteMany();
      await tx.appointment.deleteMany();
      await tx.patient.deleteMany();
      await tx.content.deleteMany();
      await tx.contentCategory.deleteMany();
      await tx.session.deleteMany();
      await tx.account.deleteMany();
      await tx.user.deleteMany();
    });

    console.log('📤 Restoring data...');
    
    // Restore data in order of dependencies
    await client.$transaction(async (tx) => {
      // Users
      if (backupData.users?.length) {
        for (const user of backupData.users) {
          await tx.user.create({ data: user });
        }
        console.log(`✅ Users: ${backupData.users.length} records`);
      }

      // Accounts
      if (backupData.accounts?.length) {
        for (const account of backupData.accounts) {
          await tx.account.create({ data: account });
        }
        console.log(`✅ Accounts: ${backupData.accounts.length} records`);
      }

      // Sessions
      if (backupData.sessions?.length) {
        for (const session of backupData.sessions) {
          await tx.session.create({ data: session });
        }
        console.log(`✅ Sessions: ${backupData.sessions.length} records`);
      }

      // Content Categories
      if (backupData.contentCategories?.length) {
        for (const category of backupData.contentCategories) {
          await tx.contentCategory.create({ data: category });
        }
        console.log(`✅ Content Categories: ${backupData.contentCategories.length} records`);
      }

      // Content
      if (backupData.content?.length) {
        for (const contentItem of backupData.content) {
          await tx.content.create({ data: contentItem });
        }
        console.log(`✅ Content: ${backupData.content.length} records`);
      }

      // Patients
      if (backupData.patients?.length) {
        for (const patient of backupData.patients) {
          await tx.patient.create({ data: patient });
        }
        console.log(`✅ Patients: ${backupData.patients.length} records`);
      }

      // Appointments
      if (backupData.appointments?.length) {
        for (const appointment of backupData.appointments) {
          await tx.appointment.create({ data: appointment });
        }
        console.log(`✅ Appointments: ${backupData.appointments.length} records`);
      }

      // Medical Records
      if (backupData.medicalRecords?.length) {
        for (const record of backupData.medicalRecords) {
          await tx.medicalRecord.create({ data: record });
        }
        console.log(`✅ Medical Records: ${backupData.medicalRecords.length} records`);
      }

      // Notifications
      if (backupData.notifications?.length) {
        for (const notification of backupData.notifications) {
          await tx.notification.create({ data: notification });
        }
        console.log(`✅ Notifications: ${backupData.notifications.length} records`);
      }

      // Notification Preferences
      if (backupData.notificationPreferences?.length) {
        for (const preference of backupData.notificationPreferences) {
          await tx.notificationPreference.create({ data: preference });
        }
        console.log(`✅ Notification Preferences: ${backupData.notificationPreferences.length} records`);
      }

      // User Content Progress
      if (backupData.userContentProgress?.length) {
        for (const progress of backupData.userContentProgress) {
          await tx.userContentProgress.create({ data: progress });
        }
        console.log(`✅ User Content Progress: ${backupData.userContentProgress.length} records`);
      }

      // Content Comments
      if (backupData.contentComments?.length) {
        for (const comment of backupData.contentComments) {
          await tx.contentComment.create({ data: comment });
        }
        console.log(`✅ Content Comments: ${backupData.contentComments.length} records`);
      }
    });

    console.log('🎉 Database restored successfully!');
    
  } catch (error) {
    console.error('❌ Restore failed:', error);
    process.exit(1);
  } finally {
    await client.$disconnect();
  }
}

// List available backups
function listBackups() {
  const backupDir = path.join(__dirname, '../backups');
  
  if (!fs.existsSync(backupDir)) {
    console.log('No backups found');
    return;
  }

  const backups = fs.readdirSync(backupDir)
    .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
    .sort()
    .reverse();

  console.log('Available backups:');
  backups.forEach((backup, index) => {
    const stats = fs.statSync(path.join(backupDir, backup));
    console.log(`${index + 1}. ${backup} (${stats.size} bytes, ${stats.mtime.toLocaleDateString()})`);
  });
}

if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    listBackups();
  } else if (args[0] === '--list') {
    listBackups();
  } else {
    restoreDatabase(args[0]);
  }
}

module.exports = { restoreDatabase, listBackups };
