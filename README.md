# MamaMtu – Maternal & Newborn Health Support

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)

A comprehensive healthcare management system for maternal and newborn health services, built with Next.js 16, Prisma, and Tailwind CSS.

## ✨ Features

- **Patient Management** - Complete patient records with medical history tracking
- **Appointment Scheduling** - Calendar-based scheduling with status management
- **Medical Records** - Secure health records with lab results and vitals
- **Education Portal** - Health education content for patients and staff
- **Real-time Notifications** - In-app, email, and SMS notification support
- **Role-Based Access** - Admin, Healthcare Provider, Patient, and Receptionist roles
- **Dark Mode** - System-aware dark/light mode via `next-themes` with SSR-safe toggle
- **Responsive Design** - Mobile-first UI for healthcare workers in the field
- **Analytics Dashboard** - Health metrics charts and statistics visualization
- **PWA Support** - Install as app with offline access capabilities
- **Internationalization** - English and Swahili language support
- **API Documentation** - OpenAPI/Swagger spec at `/api/docs`

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Database** | [Prisma](https://www.prisma.io/) + PostgreSQL |
| **Authentication** | [NextAuth.js](https://next-auth.js.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| **Forms** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| **Theming** | [next-themes](https://github.com/pacocoursey/next-themes) |
| **Email** | [Resend](https://resend.com/) |
| **Testing** | [Jest](https://jestjs.io/) + [Testing Library](https://testing-library.com/) |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/kadioko/Mamamtu.git
   cd Mamamtu
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:
   - `DATABASE_URL` - PostgreSQL connection string for Supabase, Neon, Docker, or local Postgres
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `SEED_DATABASE_TOKEN` - Optional guard token for `/api/seed` in deployed environments
   - `RESEND_API_KEY` - Optional, for email functionality
   - `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` - Production Redis rate limiting
   - `BLOB_READ_WRITE_TOKEN` - Vercel Blob upload storage
   - `GOOGLE_CLIENT_ID/SECRET` - Optional, for Google OAuth

4. **Initialize the database**

   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

   The seed command creates staff accounts, long-form education resources, and realistic demo clinical data for patients, appointments, medical records, pregnancy episodes, ANC visits, newborns, immunizations, notifications, and audit logs.

5. **Start the development server**

   ```bash
   npm run dev
   ```

6. **Open [http://localhost:3000](http://localhost:3000)**

### Default Test Accounts

After seeding, you can login with:
- **Admin**: `admin@mama-tu.health`
- **Healthcare Provider**: `provider@mama-tu.health`
- **Receptionist**: `reception@mama-tu.health`

Default seeded password: `Demo2025!`

## 📂 Project Structure

```text
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── appointments/      # Appointment pages
│   ├── auth/              # Authentication pages (+ loading.tsx skeleton)
│   ├── dashboard/         # Dashboard pages (+ loading.tsx skeleton)
│   ├── education/         # Education content pages
│   └── patients/          # Patient management pages
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── layout/           # Layout components
│   ├── providers/        # React context providers (Theme, Session, WebSocket)
│   ├── patients/         # Patient components
│   ├── appointments/     # Appointment components
│   ├── education/        # Education components
│   └── notifications/    # Notification components
├── lib/                   # Utilities & configurations
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client
│   ├── rbac.ts           # Role-based access control
│   └── security.ts       # Security utilities
├── services/              # Business logic services
└── types/                 # TypeScript type definitions

prisma/
├── schema.prisma          # Database schema
├── migrations/            # Database migrations
└── seed.js               # Database seed script
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm test` | Run tests |
| `npm run test:coverage` | Run tests with coverage |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run database migrations |
| `npm run prisma:seed` | Seed the database |

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Healthcare workers and professionals for their invaluable input
- Open source community for amazing tools and libraries

---

**Built with ❤️ for maternal and newborn health**
