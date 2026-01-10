import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-2">Unauthorized</h1>
        <p className="text-muted-foreground mb-4">
          You do not have permission to view this page.
        </p>
        <Link href="/" className="text-primary underline">Go to Home</Link>
      </div>
    </main>
  );
}
