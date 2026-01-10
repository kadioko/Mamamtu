import type { UserRole } from '@/types/roles';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: UserRole;
      emailVerified?: Date | null;
      isActive?: boolean;
    };
  }
  
  interface User {
    role: UserRole;
    emailVerified?: Date | null;
    isActive?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role: UserRole;
    emailVerified?: Date | null;
    isActive?: boolean;
  }
}
