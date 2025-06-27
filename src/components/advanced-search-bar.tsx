'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Filter, X, Calendar, Film, Clock, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchFilters {
  query: string;
  year?: string;
  type?: 'movie' | 'series' | 'episode';
}

interface Suggestion {
  id: string;
  title: string;
  year?: string;
  type: 'recent' | 'popular' | 'api';
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

// Popular movie suggestions
const POPULAR_SUGGESTIONS = [
  'Avatar', 'Titanic', 'Avengers', 'Star Wars', 'The Dark Knight',
  'Inception', 'Interstellar', 'The Matrix', 'Pulp Fiction', 'The Godfather',
  'Breaking Bad', 'Game of Thrones', 'Stranger Things', 'The Office', 'Friends'
];

const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

export function AdvancedSearchBar({ onSearch, initialFilters = { query: '' } }: AdvancedSearchBarProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const onSearchRef = useRef(onSearch);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Update the ref when onSearch changes
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  // Load recent searches from localStorage
  const getRecentSearches = useCallback((): string[] => {
    if (typeof window === 'undefined') return [];
    try {
      const recent = localStorage.getItem('movieSearchRecent');
      return recent ? JSON.parse(recent) : [];
    } catch {
      return [];
    }
  }, []);

  // Save search to recent searches
  const saveToRecentSearches = useCallback((query: string) => {
    if (typeof window === 'undefined' || query.length < 2) return;
    
    try {
      const recent = getRecentSearches();
      const newRecent = [query, ...recent.filter(s => s !== query)].slice(0, 5);
      localStorage.setItem('movieSearchRecent', JSON.stringify(newRecent));
    } catch {
      // Ignore localStorage errors
    }
  }, [getRecentSearches]);

  // Fetch suggestions from API
  const fetchApiSuggestions = useCallback(async (query: string): Promise<Suggestion[]> => {
    if (!query || query.length < 2 || !API_KEY) return [];
    
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(query)}&page=1`
      );
      const data = await response.json();
      
      if (data.Response === 'True' && data.Search) {
        return data.Search.slice(0, 5).map((movie: { imdbID: string; Title: string; Year: string }) => ({
          id: movie.imdbID,
          title: movie.Title,
          year: movie.Year,
          type: 'api' as const
        }));
      }
    } catch {
      // Ignore API errors for suggestions
    }
    
    return [];
  }, []);

  // Generate suggestions based on query
  const generateSuggestions = useCallback(async (query: string) => {
    const suggestions: Suggestion[] = [];
    
    if (!query) {
      // Show recent searches and popular suggestions when no query
      const recent = getRecentSearches();
      recent.forEach(search => {
        suggestions.push({
          id: `recent-${search}`,
          title: search,
          type: 'recent'
        });
      });
      
      // Add popular suggestions
      POPULAR_SUGGESTIONS.slice(0, 5).forEach(title => {
        if (!recent.includes(title)) {
          suggestions.push({
            id: `popular-${title}`,
            title,
            type: 'popular'
          });
        }
      });
    } else {
      // Filter popular suggestions that match query
      const matchingPopular = POPULAR_SUGGESTIONS
        .filter(title => title.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
        .map(title => ({
          id: `popular-${title}`,
          title,
          type: 'popular' as const
        }));
      
      suggestions.push(...matchingPopular);
      
      // Add recent searches that match
      const recent = getRecentSearches();
      const matchingRecent = recent
        .filter(search => search.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 2)
        .map(search => ({
          id: `recent-${search}`,
          title: search,
          type: 'recent' as const
        }));
      
      suggestions.push(...matchingRecent);
      
      // Fetch API suggestions if query is long enough
      if (query.length >= 2) {
        const apiSuggestions = await fetchApiSuggestions(query);
        suggestions.push(...apiSuggestions);
      }
    }
    
    return suggestions.slice(0, 8); // Limit to 8 suggestions
  }, [getRecentSearches, fetchApiSuggestions]);

  // Update suggestions with debouncing
  useEffect(() => {
    if (suggestionDebounceRef.current) {
      clearTimeout(suggestionDebounceRef.current);
    }

    suggestionDebounceRef.current = setTimeout(async () => {
      if (isFocused) {
        const newSuggestions = await generateSuggestions(filters.query);
        setSuggestions(newSuggestions);
        setShowSuggestions(true);
        setSelectedSuggestionIndex(-1);
      }
    }, 150); // Faster debounce for suggestions

    return () => {
      if (suggestionDebounceRef.current) {
        clearTimeout(suggestionDebounceRef.current);
      }
    };
  }, [filters.query, isFocused, generateSuggestions]);

  // Debounced search effect
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      // Only search if query is at least 2 characters or empty (for clearing)
      if (filters.query.length >= 2 || filters.query.length === 0) {
        onSearchRef.current(filters);
        // Save successful searches to recent
        if (filters.query.length >= 2) {
          saveToRecentSearches(filters.query);
        }
      }
    }, 300); // 300ms debounce delay

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [filters, saveToRecentSearches]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: Suggestion) => {
    setFilters(prev => ({ ...prev, query: suggestion.title }));
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
    inputRef.current?.blur();
  };

  // Handle input focus
  const handleFocus = async () => {
    setIsFocused(true);
    const newSuggestions = await generateSuggestions(filters.query);
    setSuggestions(newSuggestions);
    setShowSuggestions(true);
  };

  // Handle input blur
  const handleBlur = () => {
    // Delay hiding suggestions to allow click events
    setTimeout(() => {
      setIsFocused(false);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }, 150);
  };

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
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search for movies, TV series... (min 2 characters)"
            value={filters.query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`pl-12 pr-20 h-14 text-lg bg-background/80 backdrop-blur border-2 focus:border-primary/50 transition-all duration-200 ${
              filters.query.length > 0 && filters.query.length < 2 ? 'border-yellow-500/50' : ''
            }`}
            autoComplete="off"
          />
          
          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                ref={suggestionsRef}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 z-50 mt-1 bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto"
              >
                {suggestions.map((suggestion, index) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.03 }}
                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                      index === selectedSuggestionIndex ? 'bg-muted' : ''
                    } ${index === 0 ? 'rounded-t-lg' : ''} ${index === suggestions.length - 1 ? 'rounded-b-lg' : ''}`}
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <div className="flex-shrink-0">
                      {suggestion.type === 'recent' && (
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      )}
                      {suggestion.type === 'popular' && (
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                      )}
                      {suggestion.type === 'api' && (
                        <Film className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {suggestion.title}
                      </div>
                      {suggestion.year && (
                        <div className="text-xs text-muted-foreground">
                          {suggestion.year}
                        </div>
                      )}
                    </div>
                    {suggestion.type === 'recent' && (
                      <div className="text-xs text-muted-foreground">Recent</div>
                    )}
                    {suggestion.type === 'popular' && (
                      <div className="text-xs text-orange-500">Popular</div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
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
