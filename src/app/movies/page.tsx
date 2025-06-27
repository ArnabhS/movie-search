'use client';

import { useState, useCallback, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/index';
import { searchMovies, setSearchQuery, setSearchFilters, clearMovies } from '@/lib/features/movies/moviesSlice';
import { MovieCard } from '@/components/movie-card';
import { AdvancedSearchBar } from '@/components/advanced-search-bar';
import { Header } from '@/components/header';
import { SearchingState, ErrorState, EmptyState } from '@/components/loading-states';
import { Button } from '@/components/ui/button';
import { HeroHighlight, Highlight } from '@/components/ui/hero-highlight';

import { Film } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const POPULAR_SEARCHES = ['Avengers', 'Batman', 'Star Wars', 'Marvel'];

interface SearchFilters {
  query: string;
  year?: string;
  type?: 'movie' | 'series' | 'episode';
}

export default function MoviesPage() {
  const dispatch = useAppDispatch();
  const { movies, loading, error, totalResults } = useAppSelector((state) => state.movies);
  const [currentFilters, setCurrentFilters] = useState<SearchFilters>({ query: '' });
  const [hasSearched, setHasSearched] = useState(false);
  const lastSearchRef = useRef('');

  const handleSearch = useCallback((filters: SearchFilters) => {
    const searchKey = `${filters.query.trim()}-${filters.year || ''}-${filters.type || ''}`;
    
    // Prevent duplicate searches
    if (searchKey === lastSearchRef.current) {
      return;
    }
    
    setCurrentFilters(filters);
    dispatch(setSearchQuery(filters.query));
    dispatch(setSearchFilters({ year: filters.year, type: filters.type }));
    
    if (filters.query.trim().length >= 2) {
      dispatch(searchMovies({ 
        query: filters.query, 
        year: filters.year, 
        type: filters.type 
      }));
      lastSearchRef.current = searchKey;
      setHasSearched(true);
    } else if (filters.query.trim().length === 0) {
      dispatch(clearMovies());
      lastSearchRef.current = '';
      setHasSearched(false);
    }
  }, [dispatch]);

  const handlePopularSearch = (query: string) => {
    handleSearch({ query });
  };

  const handleRetry = () => {
    if (currentFilters.query.trim()) {
      dispatch(searchMovies({ 
        query: currentFilters.query, 
        year: currentFilters.year, 
        type: currentFilters.type 
      }));
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Header />
      
      {/* Hero Section */}
      <HeroHighlight containerClassName="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div 
            className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <Film className="h-8 w-8 text-primary" />
          </motion.div>
          
          <motion.h1 
            className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: [20, -5, 0] }}
            transition={{ duration: 0.5, ease: [0.4, 0.0, 0.2, 1] }}
          >
            Discover <Highlight className="text-white">Amazing Movies</Highlight>
          </motion.h1>
          
          <motion.p 
            className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Search through thousands of movies and discover detailed information about your favorites
          </motion.p>
          
          <motion.div 
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <AdvancedSearchBar onSearch={handleSearch} />
          </motion.div>
          
          <AnimatePresence>
            {!hasSearched && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="mt-12"
              >
                <p className="text-sm text-muted-foreground mb-4">Popular searches:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {POPULAR_SEARCHES.map((search, index) => (
                    <motion.div
                      key={search}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 + index * 0.1 }}
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePopularSearch(search)}
                        className="hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {search}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </HeroHighlight>

      {/* Results Section */}
    
        <div className="max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {error && (
              <ErrorState 
                key="error"
                error={error} 
                onRetry={handleRetry} 
              />
            )}

            {hasSearched && !loading && !error && movies.length === 0 && (
              <EmptyState 
                key="empty"
                query={currentFilters.query} 
              />
            )}

            {loading && currentFilters.query && (
              <SearchingState 
                key="searching"
                query={currentFilters.query} 
              />
            )}

            {currentFilters.query && !loading && movies.length > 0 && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div 
                  className="mb-8"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2 className="text-2xl font-bold mb-2">
                    Search Results for &quot;{currentFilters.query}&quot;
                  </h2>
                  <p className="text-muted-foreground">
                    Found {totalResults} results
                    {currentFilters.year && ` from ${currentFilters.year}`}
                    {currentFilters.type && ` in ${currentFilters.type}s`}
                  </p>
                </motion.div>

                <motion.div 
                  className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {movies.map((movie, index) => (
                    <MovieCard key={movie.imdbID} movie={movie} index={index} />
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
     
    </motion.div>
  );
}
