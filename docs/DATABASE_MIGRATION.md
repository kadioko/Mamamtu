# Database Migration: SQLite to PostgreSQL

This guide walks through migrating from SQLite to PostgreSQL for production deployment.

## Why PostgreSQL?

- **Production Ready**: Better performance and reliability
- **True Arrays**: Native array support (no more JSON strings)
- **Full-text Search**: Built-in search capabilities
- **JSON Support**: Better JSON column support
- **Concurrency**: Better handling of multiple connections
- **Scalability**: Designed for production workloads

## Migration Steps

### 1. Setup PostgreSQL

#### Option A: Docker (Recommended)
```bash
# Start PostgreSQL with Docker
npm run docker:postgres

# Or manually
docker-compose -f docker-compose.postgres.yml up -d postgres
```

#### Option B: Local Installation
```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS with Homebrew
brew install postgresql
brew services start postgresql

# Create database and user
sudo -u postgres psql
CREATE DATABASE mamamtu;
CREATE USER mamamtu WITH PASSWORD 'mamamtu123';
GRANT ALL PRIVILEGES ON DATABASE mamamtu TO mamamtu;
\q
```

### 2. Backup Current Data

```bash
# Create backup before migration
npm run db:backup
```

### 3. Update Environment Variables

Create `.env.local` with PostgreSQL connection:
```env
DATABASE_URL="postgresql://mamamtu:mamamtu123@localhost:5432/mamamtu"
POSTGRES_DATABASE_URL="postgresql://mamamtu:mamamtu123@localhost:5432/mamamtu"
```

### 4. Run Migration

```bash
# Run the migration script
npm run prisma:migrate:postgres
```

### 5. Update Schema

```bash
# Backup current schema (automatically done by migration script)
# Replace schema with PostgreSQL version
cp prisma/schema-postgres.prisma prisma/schema.prisma

# Generate Prisma client
npm run prisma:generate

# Create initial migration
npm run prisma:migrate
```

### 6. Verify Migration

```bash
# Start the application
npm run dev

# Check data integrity
# - Users count
# - Patients count
# - Appointments count
```

## Migration Script Details

The migration script (`scripts/migrate-to-postgres.js`) handles:

1. **Data Extraction**: Reads all data from SQLite
2. **Type Conversion**: Converts SQLite types to PostgreSQL
   - JSON strings → Arrays (allergies, symptoms, medications)
   - Date strings → DateTime objects
   - JSON fields → JSON columns
3. **Data Insertion**: Inserts into PostgreSQL in correct order
4. **Validation**: Ensures data integrity

## Key Differences in Schema

### Arrays
```sql
-- SQLite (stored as JSON string)
allergies TEXT DEFAULT '[]'

-- PostgreSQL (native array)
allergies String[]
```

### JSON Columns
```sql
-- SQLite (TEXT column)
vitals TEXT

-- PostgreSQL (JSON column)
vitals Json?
```

### UUID Support
```sql
-- PostgreSQL has native UUID support
id String @id @default(uuid())
```

## Testing the Migration

### 1. Test Environment
```bash
# Create test database
docker-compose -f docker-compose.postgres.yml up -d postgres pgadmin

# Access pgAdmin at http://localhost:5050
# Email: admin@mamamtu.com
# Password: admin123
```

### 2. Data Validation
```bash
# Compare record counts
node -e "
const {PrismaClient} = require('@prisma/client');
const sqlite = new PrismaClient({datasources: {db: {provider: 'sqlite', url: 'file:./prisma/dev.db'}}});
const postgres = new PrismaClient({datasources: {db: {provider: 'postgresql', url: process.env.POSTGRES_DATABASE_URL}}});

(async () => {
  const sqliteUsers = await sqlite.user.count();
  const postgresUsers = await postgres.user.count();
  console.log('Users:', {sqlite: sqliteUsers, postgres: postgresUsers});
})();
"
```

## Rollback Plan

If migration fails:

1. **Restore from Backup**
```bash
npm run db:restore backups/backup-<timestamp>.json
```

2. **Revert Schema**
```bash
cp prisma/schema-sqlite-backup.prisma prisma/schema.prisma
npm run prisma:generate
npm run prisma:migrate
```

3. **Update Environment**
```env
DATABASE_URL="file:./prisma/dev.db"
```

## Production Deployment

### 1. Database Provider
- **AWS RDS**: Managed PostgreSQL
- **Google Cloud SQL**: Managed PostgreSQL
- **Heroku Postgres**: Easy setup
- **DigitalOcean**: Managed PostgreSQL

### 2. Connection Pooling
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=20"
```

### 3. Backups
```bash
# Automated backups
pg_dump mamamtu > backup.sql

# For managed providers, use their backup features
```

## Performance Optimizations

### 1. Indexes
```sql
-- Additional indexes for performance
CREATE INDEX CONCURRENTLY idx_patients_search ON patients (last_name, first_name);
CREATE INDEX CONCURRENTLY idx_appointments_range ON appointments (start_time, end_time);
CREATE INDEX CONCURRENTLY idx_notifications_queue ON notifications (status, scheduled_for);
```

### 2. Connection Pool
```javascript
// In lib/prisma.js
const { PrismaClient } = require('@prisma/client');

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Add connection pooling
  __internal: {
    engine: {
      connectionLimit: 20,
    },
  },
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = { prisma };
```

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Check PostgreSQL is running
   - Verify connection string
   - Check firewall settings

2. **Migration Fails**
   - Check database exists
   - Verify user permissions
   - Check disk space

3. **Data Loss**
   - Always backup first
   - Test migration on copy
   - Use transactions

### Debug Commands
```bash
# Check PostgreSQL status
docker-compose -f docker-compose.postgres.yml ps postgres

# View logs
docker-compose -f docker-compose.postgres.yml logs postgres

# Connect to database
docker-compose -f docker-compose.postgres.yml exec postgres psql -U mamamtu -d mamamtu

# Check tables
\dt

# Check data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM patients;
```

## Next Steps

After successful migration:

1. **Update CI/CD** to use PostgreSQL
2. **Add monitoring** for database performance
3. **Set up backups** in production
4. **Update documentation** for deployment
5. **Test under load** to verify performance

## Support

For issues with migration:

1. Check the migration logs
2. Verify PostgreSQL is accessible
3. Test with sample data first
4. Use pgAdmin to inspect database
5. Check Prisma migration logs
