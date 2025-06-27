'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { Film } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-8">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/movies" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-lg">
            <Film className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">MovieSearch</span>
        </Link>
        
        <ThemeToggle />
      </div>
    </header>
  );
}