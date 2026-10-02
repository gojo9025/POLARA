'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search, Compass, Database, GraduationCap, MessageCircle,
  Megaphone, ArrowRight, FileText, BarChart3, BookOpen,
  Sparkles, Globe, MapPin, X, CornerDownLeft, Command
} from 'lucide-react';
import { getAllResources, expeditions } from '@/lib/data';

interface PaletteItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Navigation' | 'Resources' | 'Expeditions' | 'Actions';
  icon: React.ReactNode;
  href: string;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Listen for Ctrl+K / Cmd+K and global open event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => setIsOpen(true);

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-command-palette', handleCustomOpen);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-command-palette', handleCustomOpen);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Static items + Dynamic data items
  const allItems: PaletteItem[] = useMemo(() => {
    const navItems: PaletteItem[] = [
      { id: 'nav-home', title: 'Dashboard & Mission Telemetry', subtitle: 'Platform overview and live station radar', category: 'Navigation', icon: <Globe size={16} />, href: '/' },
      { id: 'nav-explore', title: 'Explore Polar Observatory', subtitle: 'Search expeditions, datasets and publications', category: 'Navigation', icon: <Search size={16} />, href: '/explore' },
      { id: 'nav-repo', title: 'Knowledge Repository', subtitle: 'Structured scientific research dossiers', category: 'Navigation', icon: <Database size={16} />, href: '/repository' },
      { id: 'nav-expeditions', title: 'Expeditions Mission Control', subtitle: 'Active and historic polar research voyages', category: 'Navigation', icon: <Compass size={16} />, href: '/expeditions' },
      { id: 'nav-ask', title: 'Ask POLARA Neural Core', subtitle: 'Source-grounded AI polar intelligence', category: 'Navigation', icon: <MessageCircle size={16} />, href: '/ask' },
      { id: 'nav-learning', title: 'Learning & Educational Hub', subtitle: 'Interactive explainers, quizzes and visual stories', category: 'Navigation', icon: <GraduationCap size={16} />, href: '/learning' },
      { id: 'nav-outreach', title: 'Outreach Content Studio', subtitle: 'AI multi-channel scientific communication', category: 'Navigation', icon: <Megaphone size={16} />, href: '/outreach' },
      { id: 'nav-collections', title: 'Research Collections & Saved Dossiers', subtitle: 'Curated disciplines and personal bookmarks', category: 'Navigation', icon: <BookOpen size={16} />, href: '/collections' },
    ];

    const expItems: PaletteItem[] = expeditions.map((exp) => ({
      id: `exp-${exp.id}`,
      title: exp.name,
      subtitle: `${exp.region} • ${exp.year} • ${exp.location}`,
      category: 'Expeditions',
      icon: <MapPin size={16} />,
      href: `/expeditions/${exp.id}`,
    }));

    const resourceItems: PaletteItem[] = getAllResources().map((res) => ({
      id: `res-${res.id}`,
      title: res.title,
      subtitle: `${res.type.toUpperCase()} • ${res.researchArea} (${res.year})`,
      category: 'Resources',
      icon: res.type === 'dataset' ? <BarChart3 size={16} /> : <FileText size={16} />,
      href: `/repository/${res.id}`,
    }));

    return [...navItems, ...expItems, ...resourceItems];
  }, []);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 10);
    const q = query.toLowerCase();
    const matches = allItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );

    // If no exact match, add Ask AI action item
    const results = matches.slice(0, 12);
    results.push({
      id: 'action-ask-ai',
      title: `Ask POLARA AI: "${query}"`,
      subtitle: 'Send this research inquiry to the Neural Core',
      category: 'Actions',
      icon: <Sparkles size={16} />,
      href: `/ask?q=${encodeURIComponent(query)}`,
    });

    return results;
  }, [allItems, query]);

  const handleSelect = (item: PaletteItem) => {
    setIsOpen(false);
    router.push(item.href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredItems.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % filteredItems.length);
    } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
      e.preventDefault();
      handleSelect(filteredItems[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="cmd-palette-backdrop" onClick={() => setIsOpen(false)}>
      <div
        className="cmd-palette-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Command Palette"
      >
        <div className="cmd-palette-header">
          <Search size={18} className="cmd-search-icon" />
          <input
            ref={inputRef}
            type="text"
            className="cmd-palette-input"
            placeholder="Type a command, search research, expeditions, or ask AI..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button className="cmd-clear-btn" onClick={() => setQuery('')}>
              <X size={14} />
            </button>
          )}
          <kbd className="cmd-shortcut-tag">ESC</kbd>
        </div>

        <div className="cmd-palette-list">
          {filteredItems.length === 0 ? (
            <div className="cmd-empty-state">
              <Search size={24} />
              <p>No matching commands or telemetry records found.</p>
            </div>
          ) : (
            filteredItems.map((item, index) => (
              <div
                key={item.id}
                className={`cmd-item ${index === selectedIndex ? 'selected' : ''}`}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="cmd-item-icon">{item.icon}</div>
                <div className="cmd-item-text">
                  <div className="cmd-item-title">{item.title}</div>
                  <div className="cmd-item-subtitle">{item.subtitle}</div>
                </div>
                <div className="cmd-item-badge">{item.category}</div>
                {index === selectedIndex && (
                  <CornerDownLeft size={14} className="cmd-item-enter" />
                )}
              </div>
            ))
          )}
        </div>

        <div className="cmd-palette-footer">
          <div className="cmd-footer-hints">
            <span><kbd>↑</kbd> <kbd>↓</kbd> to navigate</span>
            <span><kbd>↵</kbd> to select</span>
            <span><kbd>esc</kbd> to close</span>
          </div>
          <div className="cmd-footer-branding">
            <Command size={12} /> POLARA Command Core
          </div>
        </div>
      </div>
    </div>
  );
}
