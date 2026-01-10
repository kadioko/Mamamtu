'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContentType, DifficultyLevel } from '@prisma/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SearchAndFilterProps {
  categories: Array<{ id: string; name: string; slug: string }>;
  initialSearch?: string;
  initialCategory?: string;
  initialDifficulty?: string;
  initialType?: string;
}

export function SearchAndFilter({
  categories,
  initialSearch = '',
  initialCategory = '',
  initialDifficulty = '',
  initialType = '',
}: SearchAndFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [difficulty, setDifficulty] = useState<DifficultyLevel | ''>(initialDifficulty as DifficultyLevel || '');
  const [type, setType] = useState<ContentType | ''>(initialType as ContentType || '');

  // Update local state when URL params change
  useEffect(() => {
    setSearch(initialSearch);
    setCategory(initialCategory);
    setDifficulty(initialDifficulty as DifficultyLevel || '');
    setType(initialType as ContentType || '');
  }, [initialSearch, initialCategory, initialDifficulty, initialType]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (difficulty) params.set('difficulty', difficulty);
    if (type) params.set('type', type);
    
    // Reset to first page when filters change
    params.set('page', '1');
    
    router.push(`/education?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setDifficulty('');
    setType('');
    router.push('/education');
  };

  const hasFilters = search || category || difficulty || type;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={category}
          onValueChange={(value) => setCategory(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="difficulty">Difficulty</Label>
        <Select
          value={difficulty}
          onValueChange={(value) => setDifficulty(value as DifficultyLevel)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any Difficulty</SelectItem>
            {Object.values(DifficultyLevel).map((level) => (
              <SelectItem key={level} value={level}>
                {level.charAt(0) + level.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Content Type</Label>
        <Select
          value={type}
          onValueChange={(value) => setType(value as ContentType)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Any type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any Type</SelectItem>
            {Object.values(ContentType).map((contentType) => (
              <SelectItem key={contentType} value={contentType}>
                {contentType.charAt(0) + contentType.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col space-y-2 pt-2">
        <Button type="submit" className="w-full">
          Apply Filters
        </Button>
        {hasFilters && (
          <Button
            type="button"
            variant="outline"
            onClick={clearFilters}
            className="w-full"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </form>
  );
}
