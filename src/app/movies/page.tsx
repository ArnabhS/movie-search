'use client';

import { useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/index';
import { searchMovies, setSearchQuery, clearMovies } from '@/lib/features/movies/moviesSlice';
import { MovieCard } from '@/components/movie-card';
import { SearchBar } from '@/components/search-bar';
import { Header } from '@/components/header';
import { MovieSkeleton } from '@/components/movie-skeleton';
import { Button } from '@/components/ui/button';
import { Film, Search } from 'lucide-react';

const POPULAR_SEARCHES = ['Avengers', 'Batman', 'Star Wars', 'Marvel', 'Harry Potter'];

export default function MoviesPage() {
  const dispatch = useAppDispatch();
  const { movies, loading, error, searchQuery, totalResults } = useAppSelector((state) => state.movies);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback((query: string) => {
    dispatch(setSearchQuery(query));
    if (query.trim()) {
      dispatch(searchMovies({ query }));
      setHasSearched(true);
    } else {
      dispatch(clearMovies());
      setHasSearched(false);
    }
  }, [dispatch]);

  const handlePopularSearch = (query: string) => {
    handleSearch(query);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-primary/5 to-background py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
            <Film className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Discover Amazing
            <span className="text-primary block">Movies</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Search through thousands of movies and discover detailed information about your favorites
          </p>
          
          <div className="max-w-2xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
          
          {!hasSearched && (
            <div className="mt-12">
              <p className="text-sm text-muted-foreground mb-4">Popular searches:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {POPULAR_SEARCHES.map((search) => (
                  <Button
                    key={search}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePopularSearch(search)}
                    className="hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {search}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mb-4">
                <Search className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Search Error</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          )}

          {hasSearched && !loading && !error && movies.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No movies found</h3>
              <p className="text-muted-foreground">
                Try searching with different keywords or check your spelling
              </p>
            </div>
          )}

          {searchQuery && !loading && movies.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-2">
                Search Results for &quot;{searchQuery}&quot;
              </h2>
              <p className="text-muted-foreground">
                Found {totalResults} results
              </p>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 10 }).map((_, index) => (
                <MovieSkeleton key={index} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {movies.map((movie) => (
                <MovieCard key={movie.imdbID} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}