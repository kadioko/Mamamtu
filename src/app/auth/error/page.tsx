type Props = { searchParams?: Promise<{ error?: string }> };

const messages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification link is invalid or expired.',
  Default: 'An unknown error occurred. Please try again.'
};

export default async function AuthErrorPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  const errorKey = (resolvedSearchParams?.error || 'Default') as keyof typeof messages;
  const message = messages[errorKey] || messages.Default;

  return (
    <main className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold mb-2">Authentication Error</h1>
        <p className="text-muted-foreground mb-4">{message}</p>
        <a href="/auth/signin" className="text-primary underline">Back to Sign In</a>
      </div>
    </main>
  );
}
