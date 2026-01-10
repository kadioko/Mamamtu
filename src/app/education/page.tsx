'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import type { Content } from '@/components/education/content-card';

interface ErrorBoundaryProps {
  fallback: React.ReactNode;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Simple error boundary component since we can't use react-error-boundary
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by error boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Temporary components - these should be moved to separate files
const SearchBar = ({ defaultValue = '' }: { defaultValue?: string }) => (
  <div className="relative">
    <input
      type="text"
      placeholder="Search content..."
      className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
      defaultValue={defaultValue}
    />
    <Icons.logo className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
  </div>
);

const CategoryFilter = ({ 
  categories, 
  selectedCategory = '' 
}: { 
  categories: Category[]; 
  selectedCategory?: string 
}) => (
  <div className="space-y-2">
    <h3 className="font-medium">Categories</h3>
    <div className="space-y-1">
      {categories.map((category) => (
        <Button
          key={category.slug}
          variant={selectedCategory === category.slug ? 'default' : 'ghost'}
          className="w-full justify-start"
        >
          {category.name} ({category._count.contents})
        </Button>
      ))}
    </div>
  </div>
);

const SortSelect = ({ defaultValue = 'newest' }: { defaultValue?: string }) => (
  <select 
    className="bg-background border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
    defaultValue={defaultValue}
    aria-label="Sort content"
  >
    <option value="newest">Newest</option>
    <option value="popular">Most Popular</option>
    <option value="title-asc">Title (A-Z)</option>
    <option value="title-desc">Title (Z-A)</option>
  </select>
);

import { ContentList } from '@/components/education/content-list';
import { ContentListSkeleton } from '@/components/education/content-skeleton';
import { ContentListError } from '@/components/education/content-states';

type Category = {
  name: string;
  slug: string;
  _count: {
    contents: number;
  };
};

type ContentItem = Content;

function ContentListWrapper() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [total, setTotal] = useState(0);
  
  const page = typeof searchParams.get('page') === 'string' ? parseInt(searchParams.get('page') as string) : 1;
  const pageSize = 9;
  const skip = (page - 1) * pageSize;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const category = searchParams.get('category') || '';
        const search = searchParams.get('search') || '';
        const sort = searchParams.get('sort') || 'newest';
        
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: pageSize.toString(),
          ...(category && { category }),
          ...(search && { search }),
        });
        
        const response = await fetch(`/api/content?${queryParams}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch content');
        }
        
        const data = await response.json();
        
        setContents(data.data || []);
        setTotal(data.meta?.total || 0);
      } catch (err: unknown) {
        console.error('Error loading content:', err);
        setError(err instanceof Error ? err : new Error('Failed to load content'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [searchParams, page, pageSize]);
  
  const router = useRouter();
  const pathname = usePathname();
  
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    const url = `/${pathname}?${params.toString()}`.replace('//', '/');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    router.push(url as any);
  };

  if (isLoading) {
    return <ContentListSkeleton count={pageSize} />;
  }

  if (error) {
    throw error;
  }

  const totalPages = Math.ceil(total / pageSize);

  return (
    <ContentList
      contents={contents}
      total={total}
      currentPage={page}
      totalPages={totalPages}
      onPageChange={handlePageChange}
    />
  );
}

export default function EducationPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <EducationContent />
    </Suspense>
  );
}

function EducationContent() {
  const searchParams = useSearchParams();
  const [session, setSession] = useState<{ role?: string } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/content/categories');
        
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        
        const data = await response.json();
        setCategories(data.data || []);
      } catch (error: unknown) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  const selectedCategory = searchParams.get('category');
  const searchQuery = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort') || 'newest';

  const selectedCategoryName = selectedCategory 
    ? categories.find((category: Category) => category.slug === selectedCategory)?.name 
    : null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Educational Resources</h1>
          <p className="text-muted-foreground mt-1">
            Learn about maternal and newborn health with our curated content
          </p>
        </div>
        {session?.role === 'ADMIN' && (
          <Button asChild>
            <Link href="/education/new">
              <Plus className="mr-2 h-4 w-4" />
              Add New Content
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <SearchBar defaultValue={searchQuery} />
          <CategoryFilter 
            categories={categories} 
            selectedCategory={selectedCategory || ''} 
          />
        </div>
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {selectedCategoryName ? `${selectedCategoryName} Resources` : 'All Resources'}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <SortSelect defaultValue={sortBy} />
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
            <Suspense fallback={<ContentListSkeleton count={9} />}>
              <ContentListWrapper />
            </Suspense>
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
