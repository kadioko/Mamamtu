import { NextResponse } from 'next/server';

export async function GET() {
  // Temporary placeholder for socket functionality
  // TODO: Implement proper Socket.IO server for Next.js App Router
  // Currently disabled due to type conflicts with existing global declarations
  return NextResponse.json({
    success: true,
    message: 'Socket functionality is temporarily disabled',
    note: 'This requires custom server setup for proper Next.js App Router integration'
  });
}

// This is needed to prevent the route from being statically optimized
export const dynamic = 'force-dynamic';
