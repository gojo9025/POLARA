'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { getAllResources } from '@/lib/data';
import { Resource } from '@/lib/types';
import { useToast } from '@/lib/toast';

interface BookmarkContextType {
  bookmarkedIds: string[];
  bookmarkedItems: Resource[];
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (resource: Resource) => void;
  clearBookmarks: () => void;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const { success, info } = useToast();

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('polara_bookmarks');
      if (saved) {
        setBookmarkedIds(JSON.parse(saved));
      } else {
        // Default seed items for demonstration
        setBookmarkedIds(['rep-001', 'ds-001']);
      }
    } catch {
      setBookmarkedIds(['rep-001', 'ds-001']);
    }
  }, []);

  const saveToStorage = useCallback((ids: string[]) => {
    try {
      localStorage.setItem('polara_bookmarks', JSON.stringify(ids));
    } catch {
      // fallback
    }
  }, []);

  const isBookmarked = useCallback(
    (id: string) => {
      return bookmarkedIds.includes(id);
    },
    [bookmarkedIds]
  );

  const toggleBookmark = useCallback(
    (resource: Resource) => {
      setBookmarkedIds((prev) => {
        let updated: string[];
        if (prev.includes(resource.id)) {
          updated = prev.filter((id) => id !== resource.id);
          info('Removed from Collection', `"${resource.title.slice(0, 45)}..." removed`);
        } else {
          updated = [...prev, resource.id];
          success('Saved to Collection', `"${resource.title.slice(0, 45)}..." saved to research dossier`);
        }
        saveToStorage(updated);
        return updated;
      });
    },
    [saveToStorage, success, info]
  );

  const clearBookmarks = useCallback(() => {
    setBookmarkedIds([]);
    saveToStorage([]);
    info('Dossier Cleared', 'All saved items have been cleared');
  }, [saveToStorage, info]);

  const allResources = getAllResources();
  const bookmarkedItems = mounted
    ? allResources.filter((r) => bookmarkedIds.includes(r.id))
    : [];

  return (
    <BookmarkContext.Provider
      value={{
        bookmarkedIds,
        bookmarkedItems,
        isBookmarked,
        toggleBookmark,
        clearBookmarks,
      }}
    >
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (!context) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
}
