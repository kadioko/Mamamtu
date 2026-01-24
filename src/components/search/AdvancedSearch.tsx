'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, User, FileText, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

interface AdvancedSearchProps {
  onSearch: (filters: any) => void;
  onFiltersChange?: (filters: any) => void;
  className?: string;
  placeholder?: string;
  showFilters?: boolean;
}

const GENDER_OPTIONS = [
  { value: 'MALE', label: 'Male' },
  { value: 'FEMALE', label: 'Female' },
  { value: 'OTHER', label: 'Other' },
];

const BLOOD_TYPE_OPTIONS = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
];

const APPOINTMENT_STATUS_OPTIONS = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'NO_SHOW', label: 'No Show' },
];

const APPOINTMENT_TYPE_OPTIONS = [
  { value: 'CONSULTATION', label: 'Consultation' },
  { value: 'FOLLOW_UP', label: 'Follow-up' },
  { value: 'LAB_TEST', label: 'Lab Test' },
  { value: 'ULTRASOUND', label: 'Ultrasound' },
  { value: 'VACCINATION', label: 'Vaccination' },
  { value: 'OTHER', label: 'Other' },
];

const RECORD_TYPE_OPTIONS = [
  { value: 'CONSULTATION', label: 'Consultation' },
  { value: 'LAB_RESULT', label: 'Lab Result' },
  { value: 'PRESCRIPTION', label: 'Prescription' },
  { value: 'PROCEDURE', label: 'Procedure' },
  { value: 'ADMISSION', label: 'Admission' },
  { value: 'DISCHARGE', label: 'Discharge' },
  { value: 'VACCINATION', label: 'Vaccination' },
  { value: 'PRENATAL_VISIT', label: 'Prenatal Visit' },
  { value: 'GENERAL', label: 'General' },
];

export function AdvancedSearch({
  onSearch,
  onFiltersChange,
  className,
  placeholder = 'Search patients, appointments, records...',
  showFilters = true,
}: AdvancedSearchProps) {
  const [query, setQuery] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const debouncedQuery = useDebounce(query, 300);

  // Basic filters
  const [selectedGender, setSelectedGender] = useState<string[]>([]);
  const [selectedBloodType, setSelectedBloodType] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [includeInactive, setIncludeInactive] = useState(false);

  // Date range filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Age range filters
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');

  // Sorting
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Update search when debounced query changes
  useEffect(() => {
    performSearch();
  }, [debouncedQuery]);

  // Update filters when any filter changes
  useEffect(() => {
    const filters = buildFilters();
    setActiveFilters(filters);
    onFiltersChange?.(filters);
  }, [
    selectedGender,
    selectedBloodType,
    selectedStatus,
    selectedType,
    selectedTags,
    includeInactive,
    startDate,
    endDate,
    minAge,
    maxAge,
    sortBy,
    sortOrder,
  ]);

  const performSearch = () => {
    const filters = buildFilters();
    onSearch(filters);
  };

  const buildFilters = () => {
    const filters: Record<string, any> = {};

    if (debouncedQuery) filters.query = debouncedQuery;
    if (selectedGender.length > 0) filters.gender = selectedGender;
    if (selectedBloodType.length > 0) filters.bloodType = selectedBloodType;
    if (selectedStatus.length > 0) filters.status = selectedStatus;
    if (selectedType.length > 0) filters.type = selectedType;
    if (selectedTags.length > 0) filters.tags = selectedTags;
    if (includeInactive) filters.includeInactive = true;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;
    if (minAge) filters.minAge = minAge;
    if (maxAge) filters.maxAge = maxAge;
    if (sortBy) filters.sortBy = sortBy;
    if (sortOrder) filters.sortOrder = sortOrder;

    return filters;
  };

  const clearFilters = () => {
    setQuery('');
    setSelectedGender([]);
    setSelectedBloodType([]);
    setSelectedStatus([]);
    setSelectedType([]);
    setSelectedTags([]);
    setIncludeInactive(false);
    setStartDate('');
    setEndDate('');
    setMinAge('');
    setMaxAge('');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  const getActiveFilterCount = () => {
    return Object.keys(activeFilters).filter(key => {
      const value = activeFilters[key];
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === 'boolean') return value;
      return value !== undefined && value !== '';
    }).length;
  };

  const handleGenderChange = (value: string, checked: boolean) => {
    setSelectedGender(prev => 
      checked ? [...prev, value] : prev.filter(g => g !== value)
    );
  };

  const handleBloodTypeChange = (value: string, checked: boolean) => {
    setSelectedBloodType(prev => 
      checked ? [...prev, value] : prev.filter(b => b !== value)
    );
  };

  const handleStatusChange = (value: string, checked: boolean) => {
    setSelectedStatus(prev => 
      checked ? [...prev, value] : prev.filter(s => s !== value)
    );
  };

  const handleTypeChange = (value: string, checked: boolean) => {
    setSelectedType(prev => 
      checked ? [...prev, value] : prev.filter(t => t !== value)
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setQuery('')}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Toggle */}
      {showFilters && (
        <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filters
                {getActiveFilterCount() > 0 && (
                  <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                    {getActiveFilterCount()}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {isFiltersOpen ? 'Hide' : 'Show'} filters
              </span>
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Search Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Range */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4" />
                    Date Range
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="start-date" className="text-xs text-gray-600">
                        Start Date
                      </Label>
                      <Input
                        id="start-date"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="end-date" className="text-xs text-gray-600">
                        End Date
                      </Label>
                      <Input
                        id="end-date"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Age Range */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <User className="h-4 w-4" />
                    Age Range
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="min-age" className="text-xs text-gray-600">
                        Min Age
                      </Label>
                      <Input
                        id="min-age"
                        type="number"
                        placeholder="0"
                        value={minAge}
                        onChange={(e) => setMinAge(e.target.value)}
                        className="text-sm"
                        min="0"
                        max="120"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-age" className="text-xs text-gray-600">
                        Max Age
                      </Label>
                      <Input
                        id="max-age"
                        type="number"
                        placeholder="120"
                        value={maxAge}
                        onChange={(e) => setMaxAge(e.target.value)}
                        className="text-sm"
                        min="0"
                        max="120"
                      />
                    </div>
                  </div>
                </div>

                {/* Gender Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Gender</Label>
                  <div className="flex flex-wrap gap-2">
                    {GENDER_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`gender-${option.value}`}
                          checked={selectedGender.includes(option.value)}
                          onCheckedChange={(checked) => 
                            handleGenderChange(option.value, checked as boolean)
                          }
                        />
                        <Label htmlFor={`gender-${option.value}`} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blood Type Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Blood Type</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {BLOOD_TYPE_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`blood-${option.value}`}
                          checked={selectedBloodType.includes(option.value)}
                          onCheckedChange={(checked) => 
                            handleBloodTypeChange(option.value, checked as boolean)
                          }
                        />
                        <Label htmlFor={`blood-${option.value}`} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {APPOINTMENT_STATUS_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`status-${option.value}`}
                          checked={selectedStatus.includes(option.value)}
                          onCheckedChange={(checked) => 
                            handleStatusChange(option.value, checked as boolean)
                          }
                        />
                        <Label htmlFor={`status-${option.value}`} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Type Filter */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {RECORD_TYPE_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${option.value}`}
                          checked={selectedType.includes(option.value)}
                          onCheckedChange={(checked) => 
                            handleTypeChange(option.value, checked as boolean)
                          }
                        />
                        <Label htmlFor={`type-${option.value}`} className="text-sm">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sorting */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Sort By</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Created Date</SelectItem>
                        <SelectItem value="updatedAt">Updated Date</SelectItem>
                        <SelectItem value="firstName">First Name</SelectItem>
                        <SelectItem value="lastName">Last Name</SelectItem>
                        <SelectItem value="dateOfBirth">Date of Birth</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending</SelectItem>
                        <SelectItem value="desc">Descending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Include Inactive */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-inactive"
                    checked={includeInactive}
                    onCheckedChange={(checked) => setIncludeInactive(checked as boolean)}
                  />
                  <Label htmlFor="include-inactive" className="text-sm">
                    Include inactive records
                  </Label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-3 border-t">
                  <Button onClick={performSearch} className="flex-1">
                    <Search className="h-4 w-4 mr-2" />
                    Apply Filters
                  </Button>
                  <Button variant="outline" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(activeFilters).map(([key, value]) => {
            if (!value || (Array.isArray(value) && value.length === 0)) return null;
            
            return (
              <Badge key={key} variant="secondary" className="flex items-center gap-1">
                <span className="text-xs capitalize">
                  {key}: {Array.isArray(value) ? value.join(', ') : value}
                </span>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
