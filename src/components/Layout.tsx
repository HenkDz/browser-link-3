import type React from 'react';
import { Globe } from 'lucide-react';
import { Toaster as Sonner } from './ui/sonner.js';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground p-8 flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex items-center space-x-2">
            <Globe className="h-6 w-6" />
            <span className="font-bold">Browser Link</span>
          </div>
        </div>
      </header>
      <main className="container flex-1 py-6 md:py-8 flex-grow">
        {children}
      </main>
      <footer className="border-t py-4 md:py-6">
        <div className="container flex flex-col items-center justify-center gap-2 text-center md:flex-row md:justify-between">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Browser Link - Intelligent URL Router
          </p>
        </div>
      </footer>
      <Sonner />
    </div>
  );
} 