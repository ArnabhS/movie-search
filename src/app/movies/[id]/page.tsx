'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/hooks/index';
import { fetchMovieDetails } from '@/lib/features/movies/moviesSlice';
import { Header } from '@/components/header';
import { StarRating } from '@/components/star-rating';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Clock, Globe, Award, Star } from 'lucide-react';
import Image from 'next/image';

export default function MovieDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { movieDetails, detailsLoading, error } = useAppSelector((state) => state.movies);
  const movieId = params.id as string;
  const movie = movieDetails[movieId];

  useEffect(() => {
    if (movieId && !movie) {
      dispatch(fetchMovieDetails(movieId));
    }
  }, [dispatch, movieId, movie]);

  if (detailsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Skeleton className="h-10 w-32 mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Movies
          </Button>
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">Movie not found</h3>
            <p className="text-muted-foreground">
              {error || 'The movie you are looking for could not be found.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-8 hover:bg-primary/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Movies
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Movie Poster */}
          <div className="lg:col-span-1">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
              {movie.Poster && movie.Poster !== 'N/A' ? (
                <Image
                  src={movie.Poster}
                  alt={movie.Title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <span className="text-muted-foreground">No poster available</span>
                </div>
              )}
            </div>
          </div>

          {/* Movie Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Year */}
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                {movie.Title}
              </h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{movie.Year}</span>
                </div>
                {movie.Runtime !== 'N/A' && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{movie.Runtime}</span>
                  </div>
                )}
                {movie.Rated !== 'N/A' && (
                  <Badge variant="secondary">{movie.Rated}</Badge>
                )}
              </div>
            </div>

            {/* Rating */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Your Rating</h3>
              <StarRating movieId={movie.imdbID} />
            </div>

            {/* IMDb Rating */}
            {movie.imdbRating !== 'N/A' && (
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-current" />
                <span className="text-lg font-semibold">{movie.imdbRating}/10</span>
                <span className="text-muted-foreground">
                  ({movie.imdbVotes} votes)
                </span>
              </div>
            )}

            {/* Genre */}
            {movie.Genre !== 'N/A' && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Genre</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.Genre.split(', ').map((genre) => (
                    <Badge key={genre} variant="outline">
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Plot */}
            {movie.Plot !== 'N/A' && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Plot</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {movie.Plot}
                </p>
              </div>
            )}

            <Separator />

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {movie.Director !== 'N/A' && (
                <div>
                  <h4 className="font-semibold mb-1">Director</h4>
                  <p className="text-muted-foreground">{movie.Director}</p>
                </div>
              )}
              
              {movie.Actors !== 'N/A' && (
                <div>
                  <h4 className="font-semibold mb-1">Cast</h4>
                  <p className="text-muted-foreground">{movie.Actors}</p>
                </div>
              )}
              
              {movie.Language !== 'N/A' && (
                <div>
                  <h4 className="font-semibold mb-1">Language</h4>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Globe className="h-4 w-4" />
                    <span>{movie.Language}</span>
                  </div>
                </div>
              )}
              
              {movie.Awards !== 'N/A' && (
                <div>
                  <h4 className="font-semibold mb-1">Awards</h4>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Award className="h-4 w-4" />
                    <span>{movie.Awards}</span>
                  </div>
                </div>
              )}
            </div>

            {/* External Ratings */}
            {movie.Ratings && movie.Ratings.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">External Ratings</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {movie.Ratings.map((rating, index) => (
                    <div
                      key={index}
                      className="p-3 bg-muted/50 rounded-lg text-center"
                    >
                      <p className="text-sm text-muted-foreground mb-1">
                        {rating.Source}
                      </p>
                      <p className="font-semibold">{rating.Value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}