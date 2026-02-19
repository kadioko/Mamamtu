# Contributing to MamaMtu

Thank you for your interest in contributing to MamaMtu! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Development Setup

1. **Fork the repository**
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

4. **Initialize the database**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

## 📝 How to Contribute

### Reporting Bugs

- Use GitHub Issues to report bugs
- Include detailed steps to reproduce
- Include screenshots if applicable
- Mention your environment (OS, Node version, browser)

### Suggesting Features

- Open a GitHub Issue with the "feature request" label
- Clearly describe the feature and its use case
- Discuss implementation approach if possible

### Pull Requests

1. Create a feature branch from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our coding standards

3. Write/update tests as needed
   ```bash
   npm test
   ```

4. Commit with clear messages
   ```bash
   git commit -m "feat: add new patient search filter"
   ```

5. Push and create a Pull Request

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 📁 Project Structure

```
src/
├── app/              # Next.js App Router pages & API routes
├── components/       # React components
│   ├── ui/          # Base UI components (shadcn/ui)
│   ├── layout/      # Layout components
│   ├── providers/   # React context providers (Theme, Session, WebSocket)
│   ├── patients/    # Patient-related components
│   ├── appointments/# Appointment components
│   └── education/   # Education content components
├── lib/             # Utilities & configurations
├── services/        # Business logic services
└── types/           # TypeScript type definitions
```

## 🎨 Code Style

- Use TypeScript for all new code
- Follow existing patterns and conventions
- Use Prettier for formatting
- Use ESLint for linting
- Use `react-hook-form` + `zod` for all form validation
- Use `next-themes` `useTheme()` hook for theme-aware components (never access `localStorage` directly for theme)
- Use `lucide-react` for all icons (no raw inline SVGs)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
