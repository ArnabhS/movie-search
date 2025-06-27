'use client';

import { motion } from 'framer-motion';
import { Loader2, Film, Search, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DottedBackground } from '@/components/ui/dotted-background';

interface LoadingStateProps {
  count?: number;
}

export function LoadingState({ count = 10 }: LoadingStateProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="overflow-hidden bg-card/50 backdrop-blur border-border/50">
            <div className="relative aspect-[2/3] bg-muted">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                animate={{ x: [-100, 400] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Film className="h-12 w-12 text-muted-foreground/50" />
              </div>
            </div>
            <CardContent className="p-4 space-y-2">
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

interface SearchingStateProps {
  query: string;
}

export function SearchingState({ query }: SearchingStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4"
      >
        <Loader2 className="h-8 w-8 text-primary" />
      </motion.div>
      <h3 className="text-lg font-semibold mb-2">Searching for movies...</h3>
      <p className="text-muted-foreground">
        Looking for &quot;{query}&quot;
      </p>
    </motion.div>
  );
}

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <DottedBackground containerClassName="py-12" density="light" interactive={false}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mb-4"
        >
          <AlertCircle className="h-8 w-8 text-destructive" />
        </motion.div>
        <h3 className="text-lg font-semibold mb-2">Search Error</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            Try Again
          </Button>
        )}
      </motion.div>
    </DottedBackground>
  );
}

interface EmptyStateProps {
  query: string;
}

export function EmptyState({ query }: EmptyStateProps) {
  return (
    <DottedBackground containerClassName="py-12" density="light" interactive={false}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="inline-flex items-center justify-center w-16 h-16 bg-muted rounded-full mb-4"
        >
          <Search className="h-8 w-8 text-muted-foreground" />
        </motion.div>
        <h3 className="text-lg font-semibold mb-2">No movies found</h3>
        <p className="text-muted-foreground">
          No results found for &quot;{query}&quot;. Try searching with different keywords or check your spelling.
        </p>
      </motion.div>
    </DottedBackground>
  );
}
