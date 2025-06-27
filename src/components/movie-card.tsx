'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Film } from 'lucide-react';
import { Movie } from '@/lib/features/movies/moviesSlice';
import { motion } from 'framer-motion';

interface MovieCardProps {
  movie: Movie;
  index?: number;
}

export function MovieCard({ movie, index = 0 }: MovieCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Link href={`/movies/${movie.imdbID}`} className="group block">
        <Card className="overflow-hidden bg-card/50 backdrop-blur border-border/50 hover:shadow-xl transition-shadow duration-300">
          <motion.div 
            className="relative aspect-[2/3] overflow-hidden"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            {movie.Poster && movie.Poster !== 'N/A' ? (
              <Image
                src={movie.Poster}
                alt={movie.Title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full bg-muted flex items-center justify-center">
                <Film className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            
            <motion.div 
              className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
            
            <motion.div 
              className="absolute top-3 right-3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Badge variant="secondary" className="text-xs">
                {movie.Type}
              </Badge>
            </motion.div>
          </motion.div>
          
          <CardContent className="p-4">
            <motion.h3 
              className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              {movie.Title}
            </motion.h3>
            <motion.div 
              className="flex items-center text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Calendar className="h-3 w-3 mr-1" />
              <span>{movie.Year}</span>
            </motion.div>
          </CardContent>
        </Card>
      </Link>
    </motion.div>
  );
}