'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, Filter, Plus, RotateCcw, Search, Sparkles } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Content } from '@/components/education/content-card';
import { ContentCard } from '@/components/education/content-card';
import { ContentList } from '@/components/education/content-list';
import { ContentListSkeleton } from '@/components/education/content-skeleton';
import { ContentListError } from '@/components/education/content-states';

interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by education error boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

type Category = {
  id?: string;
  name: string;
  slug: string;
  _count: {
    contents: number;
  };
};

type ContentItem = Content & {
  isFeatured?: boolean;
};

type ContentResponse = {
  data?: ContentItem[];
  meta?: {
    total?: number;
    totalPages?: number;
  };
  message?: string;
};

const pageSize = 9;

async function getErrorMessage(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return data?.message || fallback;
  } catch {
    return fallback;
  }
}

function EducationLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 space-y-3">
        <div className="h-8 w-72 rounded-md bg-muted" />
        <div className="h-4 w-full max-w-xl rounded-md bg-muted" />
      </div>
      <ContentListSkeleton count={pageSize} />
    </div>
  );
}

function EducationContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [categories, setCategories] = useState<Category[]>([]);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [featured, setFeatured] = useState<ContentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [contentError, setContentError] = useState<Error | null>(null);
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');

  const page = Math.max(Number(searchParams.get('page') || '1'), 1);
  const selectedCategory = searchParams.get('category') || 'all';
  const selectedDifficulty = searchParams.get('difficulty') || 'all';
  const selectedType = searchParams.get('type') || 'all';
  const sortBy = searchParams.get('sort') || 'newest';
  const searchQuery = searchParams.get('search') || '';

  const selectedCategoryName = selectedCategory !== 'all'
    ? categories.find(category => category.slug === selectedCategory)?.name
    : null;

  const totalPages = Math.max(Math.ceil(total / pageSize), 1);
  const canManage = ['ADMIN', 'HEALTHCARE_PROVIDER'].includes(session?.user?.role || '');
  const hasFilters = Boolean(searchQuery || selectedCategory !== 'all' || selectedDifficulty !== 'all' || selectedType !== 'all');

  const categoryCount = useMemo(
    () => categories.reduce((sum, category) => sum + category._count.contents, 0),
    [categories]
  );

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === 'all') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    if (!('page' in updates)) {
      params.set('page', '1');
    }

    const query = params.toString();
    router.push((query ? `${pathname}?${query}` : pathname) as Route);
  }

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchCategories() {
      try {
        setIsLoadingCategories(true);
        const response = await fetch('/api/content/categories', { signal: controller.signal });

        if (!response.ok) {
          throw new Error(await getErrorMessage(response, 'Failed to fetch categories'));
        }

        const data = await response.json();
        setCategories(data.data || []);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error loading education categories:', error);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingCategories(false);
        }
      }
    }

    fetchCategories();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchFeatured() {
      try {
        const response = await fetch('/api/content?featured=true&limit=3&sort=popular', { signal: controller.signal });

        if (!response.ok) {
          throw new Error(await getErrorMessage(response, 'Failed to fetch featured resources'));
        }

        const data: ContentResponse = await response.json();
        setFeatured(data.data || []);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error loading featured education resources:', error);
        }
      }
    }

    fetchFeatured();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchContent() {
      try {
        setIsLoadingContent(true);
        setContentError(null);

        const params = new URLSearchParams({
          page: page.toString(),
          limit: pageSize.toString(),
          sort: sortBy,
        });

        if (selectedCategory !== 'all') params.set('category', selectedCategory);
        if (selectedDifficulty !== 'all') params.set('difficulty', selectedDifficulty);
        if (selectedType !== 'all') params.set('type', selectedType);
        if (searchQuery) params.set('search', searchQuery);

        const response = await fetch(`/api/content?${params.toString()}`, { signal: controller.signal });

        if (!response.ok) {
          throw new Error(await getErrorMessage(response, 'Failed to fetch content'));
        }

        const data: ContentResponse = await response.json();
        setContents(data.data || []);
        setTotal(data.meta?.total || 0);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Error loading education content:', error);
          setContentError(error instanceof Error ? error : new Error('Failed to load content'));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingContent(false);
        }
      }
    }

    fetchContent();

    return () => controller.abort();
  }, [page, searchQuery, selectedCategory, selectedDifficulty, selectedType, sortBy]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const normalized = searchInput.trim();
      if (normalized !== searchQuery) {
        updateParams({ search: normalized || null });
      }
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [searchInput, searchQuery]);

  const handlePageChange = (newPage: number) => {
    updateParams({ page: newPage.toString() });
  };

  const retryContent = () => {
    updateParams({ page: page.toString() });
  };

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <section className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-md border px-3 py-1 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Auto-search and curated maternal health learning
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Educational Resources</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Browse practical pregnancy, newborn, postpartum, nutrition, and danger-sign guidance curated for families and care teams.
            </p>
          </div>
        </div>

        {canManage ? (
          <Button asChild className="w-full lg:w-auto">
            <Link href="/education/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New Content
            </Link>
          </Button>
        ) : null}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">Published resources</p>
          <p className="text-2xl font-semibold">{categoryCount.toLocaleString()}</p>
        </div>
        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">Categories</p>
          <p className="text-2xl font-semibold">{categories.length.toLocaleString()}</p>
        </div>
        <div className="rounded-md border p-4">
          <p className="text-sm text-muted-foreground">Current results</p>
          <p className="text-2xl font-semibold">{total.toLocaleString()}</p>
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Featured This Week</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {featured.map(resource => (
              <ContentCard key={resource.id} content={resource} showCategory />
            ))}
          </div>
        </section>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="education-search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="education-search"
                value={searchInput}
                onChange={event => setSearchInput(event.target.value)}
                placeholder="Search topics, tags, symptoms..."
                className="pl-9"
              />
            </div>
            <p className="text-xs text-muted-foreground">Search updates automatically as you type.</p>
          </div>

          <div className="space-y-2">
            <Label>Categories</Label>
            <div className="space-y-1">
              <Button
                type="button"
                variant={selectedCategory === 'all' ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => updateParams({ category: null })}
              >
                All Resources
              </Button>
              {isLoadingCategories ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">Loading categories...</p>
              ) : categories.map(category => (
                <Button
                  key={category.slug}
                  type="button"
                  variant={selectedCategory === category.slug ? 'default' : 'ghost'}
                  className="w-full justify-between"
                  onClick={() => updateParams({ category: category.slug })}
                >
                  <span className="truncate">{category.name}</span>
                  <span className="text-xs opacity-70">{category._count.contents}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="education-difficulty">Difficulty</Label>
            <Select value={selectedDifficulty} onValueChange={value => updateParams({ difficulty: value })}>
              <SelectTrigger id="education-difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any difficulty</SelectItem>
                <SelectItem value="BEGINNER">Beginner</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                <SelectItem value="ADVANCED">Advanced</SelectItem>
                <SelectItem value="EXPERT">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="education-type">Type</Label>
            <Select value={selectedType} onValueChange={value => updateParams({ type: value })}>
              <SelectTrigger id="education-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Any type</SelectItem>
                <SelectItem value="ARTICLE">Article</SelectItem>
                <SelectItem value="VIDEO">Video</SelectItem>
                <SelectItem value="PODCAST">Podcast</SelectItem>
                <SelectItem value="INFOGRAPHIC">Infographic</SelectItem>
                <SelectItem value="PDF">PDF</SelectItem>
                <SelectItem value="PRESENTATION">Presentation</SelectItem>
                <SelectItem value="QUIZ">Quiz</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasFilters ? (
            <Button type="button" variant="outline" className="w-full" onClick={() => updateParams({ search: null, category: null, difficulty: null, type: null, page: null })}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Filters
            </Button>
          ) : null}
        </aside>

        <main className="space-y-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">
                {selectedCategoryName ? `${selectedCategoryName} Resources` : 'All Resources'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {searchQuery ? `Filtered by "${searchQuery}"` : 'Use filters to narrow resources by topic, level, and format.'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={value => updateParams({ sort: value })}>
                <SelectTrigger className="w-44" aria-label="Sort resources">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="popular">Most popular</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ErrorBoundary
            fallback={
              <ContentListError
                error={new Error('Failed to load content')}
                onRetry={() => window.location.reload()}
              />
            }
          >
            <ContentList
              contents={contents}
              total={total}
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              isLoading={isLoadingContent}
              error={contentError}
              onRetry={retryContent}
              pageSize={pageSize}
            />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default function EducationPage() {
  return (
    <Suspense fallback={<EducationLoading />}>
      <EducationContent />
    </Suspense>
  );
}
