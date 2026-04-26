import Link from 'next/link';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { EducationPublishToggle } from '@/components/dashboard/EducationPublishToggle';

export const dynamic = 'force-dynamic';

export default async function DashboardEducationPage() {
  const session = await auth();
  const canManage = session?.user && ['ADMIN', 'HEALTHCARE_PROVIDER'].includes(session.user.role);

  const contents = await prisma.content.findMany({
    take: 50,
    orderBy: { updatedAt: 'desc' },
    include: {
      category: { select: { name: true } },
      author: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Education Management</h1>
          <p className="text-muted-foreground">Review, publish, and manage maternal health education resources.</p>
        </div>
        {canManage && (
          <Button asChild>
            <Link href="/education/new">Add Resource</Link>
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {contents.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-muted-foreground">
              No education resources yet. Seed the database or add the first resource.
            </CardContent>
          </Card>
        ) : contents.map((content) => (
          <Card key={content.id}>
            <CardContent className="grid gap-4 p-4 md:grid-cols-[1fr_160px_180px_130px] md:items-center">
              <div>
                <h2 className="font-semibold">
                  <Link href={`/education/${content.slug}`} className="hover:underline">
                    {content.title}
                  </Link>
                </h2>
                <p className="line-clamp-2 text-sm text-muted-foreground">{content.description}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {content.category.name} · {content.type} · {content.difficulty}
                </p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Status</span>
                <p className={content.isPublished ? 'text-green-700' : 'text-amber-700'}>
                  {content.isPublished ? 'Published' : 'Draft'}
                </p>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Author</span>
                <p>{content.author.name ?? content.author.email}</p>
              </div>
              {canManage && <EducationPublishToggle contentId={content.id} isPublished={content.isPublished} />}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
