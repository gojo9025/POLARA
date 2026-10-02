'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/lib/toast';
import { BookmarkProvider } from '@/lib/bookmarks';
import CommandPalette from '@/components/CommandPalette';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <BookmarkProvider>
          {children}
          <CommandPalette />
        </BookmarkProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
