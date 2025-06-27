'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Filter, X, Calendar, Film } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchFilters {
  query: string;
  year?: string;
  type?: 'movie' | 'series' | 'episode';
}

interface AdvancedSearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

const MOVIE_TYPES = [
  { value: 'movie', label: 'Movies', icon: Film },
  { value: 'series', label: 'TV Series', icon: Film },
  { value: 'episode', label: 'Episodes', icon: Film },
] as const;

const POPULAR_YEARS = [
  '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'
];

export function AdvancedSearchBar({ onSearch, initialFilters = { query: '' } }: AdvancedSearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const onSearchRef = useRef(onSearch);

  // Update the ref when onSearch changes
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Debounced search effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      // Only search if query is at least 2 characters or empty (for clearing)
      if (filters.query.length >= 2 || filters.query.length === 0) {
        onSearchRef.current(filters);
      }
    }, 300); // 300ms debounce delay

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [filters]);

  const handleQueryChange = (query: string) => {
    setFilters(prev => ({ ...prev, query }));
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(prev => ({ query: prev.query }));
  };

  const clearAll = () => {
    setFilters({ query: '' });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== filters.query).length;

  return (
    <div className="w-full space-y-4">
      {/* Main Search Bar */}
      <motion.div 
        className={`relative transition-all duration-200 ${isFocused ? 'scale-105' : ''}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for movies, TV series... (min 2 characters)"
            value={filters.query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`pl-12 pr-20 h-14 text-lg bg-background/80 backdrop-blur border-2 focus:border-primary/50 transition-all duration-200 ${
              filters.query.length > 0 && filters.query.length < 2 ? 'border-yellow-500/50' : ''
            }`}
          />
          
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={`h-8 w-8 transition-colors ${activeFiltersCount > 0 ? 'text-primary' : ''}`}
            >
              <Filter className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            
            {filters.query && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearAll}
                className="h-8 w-8 hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Minimum character warning */}
        {filters.query.length > 0 && filters.query.length < 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-yellow-600 dark:text-yellow-400"
          >
            Type at least 2 characters to search
          </motion.div>
        )}
      </motion.div>

      {/* Active Filters Display */}
      <AnimatePresence>
        {(filters.year || filters.type) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2"
          >
            {filters.year && (
              <Badge variant="secondary" className="gap-1">
                <Calendar className="h-3 w-3" />
                Year: {filters.year}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleFilterChange('year', undefined)}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {filters.type && (
              <Badge variant="secondary" className="gap-1">
                <Film className="h-3 w-3" />
                Type: {MOVIE_TYPES.find(t => t.value === filters.type)?.label}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleFilterChange('type', undefined)}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear filters
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card border rounded-lg p-4 space-y-4"
          >
            {/* Year Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Release Year
              </h4>
              <div className="flex flex-wrap gap-2">
                {POPULAR_YEARS.map((year) => (
                  <Button
                    key={year}
                    variant={filters.year === year ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFilterChange('year', filters.year === year ? undefined : year)}
                  >
                    {year}
                  </Button>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Film className="h-4 w-4" />
                Content Type
              </h4>
              <div className="flex flex-wrap gap-2">
                {MOVIE_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.value}
                      variant={filters.type === type.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFilterChange('type', filters.type === type.value ? undefined : type.value)}
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {type.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
