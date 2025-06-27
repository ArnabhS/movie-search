'use client';

import { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/index';
import { setRating } from '@/lib/features/ratings/ratingSlice';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  movieId: string;
  maxRating?: number;
}

export function StarRating({ movieId, maxRating = 5 }: StarRatingProps) {
  const dispatch = useAppDispatch();
  const currentRating = useAppSelector((state) => state.ratings.ratings[movieId] || 0);
  const [hoverRating, setHoverRating] = useState(0);

  const handleRating = (rating: number) => {
    dispatch(setRating({ movieId, rating }));
  };

  const displayRating = hoverRating || currentRating;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }, (_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayRating;
        
        return (
          <button
            key={index}
            onClick={() => handleRating(starValue)}
            onMouseEnter={() => setHoverRating(starValue)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded"
          >
            <Star
              className={cn(
                'h-6 w-6 transition-colors duration-200',
                isFilled
                  ? 'text-yellow-500 fill-current'
                  : 'text-muted-foreground hover:text-yellow-500'
              )}
            />
          </button>
        );
      })}
      <span className="ml-2 text-sm text-muted-foreground">
        {currentRating > 0 ? `${currentRating}/${maxRating}` : 'Rate this movie'}
      </span>
    </div>
  );
}