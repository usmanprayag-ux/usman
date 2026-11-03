/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  ArrowRight,
  Settings,
  Wind,
  Layers,
  Maximize2,
  Palette,
  Flame,
} from 'lucide-react';

export interface CommandItem {
  id: string;
  category: 'Suggestions' | 'Settings';
  label: string;
  hint?: string;
  action: () => void;
}

interface CommandSearchBarProps {
  onJumpChapter: (id: string, index: number) => void;
  onToggleMotionBlur: () => void;
  motionBlurEnabled: boolean;
  onToggleFireflies: () => void;
  firefliesEnabled: boolean;
  onToggleSpatialTilt: () => void;
  spatialTiltEnabled: boolean;
  onSelectColor: (hex: string) => void;
  onToggleFullscreen: () => void;
  onReset: () => void;
}

export const CommandSearchBar: React.FC<CommandSearchBarProps> = ({
  onJumpChapter,
  onToggleMotionBlur,
  motionBlurEnabled,
  onToggleFireflies,
  firefliesEnabled,
  onToggleSpatialTilt,
  spatialTiltEnabled,
  onSelectColor,
  onToggleFullscreen,
  onReset,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Recreated items matching the video hierarchy
  const allItems: CommandItem[] = useMemo(() => [
    // Project Chapters & Navigation
    {
      id: 'prologue',
      category: 'Suggestions',
      label: 'Prologue: The Hidden Gate',
      hint: 'Chapter 01 · 山門序章',
      action: () => onJumpChapter('hero', 1),
    },
    {
      id: 'sanmon-gate',
      category: 'Suggestions',
      label: 'Sanmon: Charred Cypress Gate',
      hint: 'Chapter 02 · 山門の影',
      action: () => onJumpChapter('gate', 2),
    },
    {
      id: 'secret-pathways',
      category: 'Suggestions',
      label: 'Still Gardens: Secret Pathways',
      hint: 'Chapter 03 · 参道の導き',
      action: () => onJumpChapter('pathways', 3),
    },
    {
      id: 'lantern-court',
      category: 'Suggestions',
      label: 'Lantern Court: Sacred Craft',
      hint: 'Chapter 04 · 燈籠庭',
      action: () => onJumpChapter('lessons', 4),
    },
    {
      id: 'afterlight-sanctum',
      category: 'Suggestions',
      label: 'Moonwater Sanctum: Afterlight',
      hint: 'Chapter 05 · 月水亭',
      action: () => onJumpChapter('eternity', 5),
    },
    {
      id: 'creator-portfolio',
      category: 'Suggestions',
      label: 'Creator Portfolio & Contact',
      hint: 'Chapter 06 · Bewakoof Studio',
      action: () => onJumpChapter('portfolio', 6),
    },

    // Settings category (as seen in video)
    {
      id: 'open-portfolio-site',
      category: 'Settings',
      label: 'Visit bewakoofstudio.vercel.app',
      hint: 'External Website ↗',
      action: () => {
        window.open('https://bewakoofstudio.vercel.app/', '_blank', 'noopener,noreferrer');
      },
    },
    {
      id: 'profile',
      category: 'Settings',
      label: 'Profile',
      hint: 'Reset Visual Defaults',
      action: onReset,
    },
    {
      id: 'fireflies',
      category: 'Settings',
      label: firefliesEnabled ? 'Disable Fireflies' : 'Enable Fireflies',
      hint: 'Three.js Particles',
      action: onToggleFireflies,
    },
    {
      id: 'motion-blur',
      category: 'Settings',
      label: motionBlurEnabled ? 'Disable Motion Blur' : 'Enable Motion Blur',
      hint: 'Canvas Shutter',
      action: onToggleMotionBlur,
    },
    {
      id: 'theme-vermilion',
      category: 'Settings',
      label: 'Vermilion Kyoto Theme',
      hint: '#e0231c',
      action: () => onSelectColor('#e0231c'),
    },
    {
      id: 'theme-yellow',
      category: 'Settings',
      label: 'Gold Temple Theme',
      hint: '#fcee0a',
      action: () => onSelectColor('#fcee0a'),
    },
    {
      id: 'spatial-3d',
      category: 'Settings',
      label: spatialTiltEnabled ? 'Disable 3D Spatial Tilt' : 'Enable 3D Spatial Tilt',
      hint: 'Perspective Tilt',
      action: onToggleSpatialTilt,
    },
    {
      id: 'fullscreen',
      category: 'Settings',
      label: 'Toggle Fullscreen',
      action: onToggleFullscreen,
    },
  ], [
    spatialTiltEnabled,
    motionBlurEnabled,
    firefliesEnabled,
    onJumpChapter,
    onToggleFireflies,
    onToggleMotionBlur,
    onToggleSpatialTilt,
    onSelectColor,
    onToggleFullscreen,
    onReset,
  ]);

  // Filter items by query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.hint?.toLowerCase().includes(q)
    );
  }, [allItems, query]);

  // Group items by category
  const groupedCategories = useMemo(() => {
    const map = new Map<'Suggestions' | 'Settings', CommandItem[]>();
    filteredItems.forEach((item) => {
      const list = map.get(item.category) || [];
      list.push(item);
      map.set(item.category, list);
    });
    return Array.from(map.entries());
  }, [filteredItems]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Global hotkey: Press 'F' or '/' to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase()) &&
        e.target !== inputRef.current
      ) {
        return;
      }

      if ((e.key === 'f' || e.key === 'F' || e.key === '/') && !isOpen && (e.target as HTMLElement)?.tagName !== 'INPUT') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 60);
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
        if (!isOpen) setTimeout(() => inputRef.current?.focus(), 60);
      } else if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Arrow key navigation
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filteredItems[selectedIndex];
      if (item) {
        item.action();
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="flex flex-col items-center select-none pointer-events-auto">
      {/* Overhead hint with thin vertical pointer line (exact replica of video) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center mb-0.5 text-center"
          >
            <div className="text-[9px] font-mono tracking-[0.18em] text-[#555a64] uppercase leading-tight font-medium">
              PRESS F OR<br />
              CLICK IN<br />
              INPUT
            </div>
            <div className="w-[1px] h-3 bg-gradient-to-b from-[#3a3e46] to-[#606570] my-0.5" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Morphing Command Container */}
      <motion.div
        layout
        transition={{
          type: 'spring',
          stiffness: 420,
          damping: 34,
        }}
        className={`overflow-hidden rounded-2xl bg-[#141518]/95 border border-[#2b2e35] shadow-[0_16px_48px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-colors ${
          isOpen ? 'w-[340px] sm:w-[360px]' : 'w-[250px] sm:w-[270px]'
        }`}
      >
        {/* Top Input Bar */}
        <div
          onClick={() => {
            if (!isOpen) {
              setIsOpen(true);
              setTimeout(() => inputRef.current?.focus(), 50);
            }
          }}
          className="flex items-center h-10 px-3 cursor-pointer"
        >
          <Search size={14} className="text-[#78808b] mr-2.5 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder="Search chapters, portfolio, settings..."
            className="w-full bg-transparent border-0 text-xs text-[#e4e7eb] placeholder-[#6b7280] focus:outline-none focus:ring-0 selection:bg-[#e0231c]"
          />

          {/* Key badge: F when closed, Esc when open */}
          <div className="shrink-0 ml-2">
            {isOpen ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.08] text-[#9ca3af] hover:text-white border border-white/[0.06] transition-colors"
              >
                Esc
              </button>
            ) : (
              <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/[0.08] text-[#9ca3af] border border-white/[0.06] shadow-sm">
                F
              </kbd>
            )}
          </div>
        </div>

        {/* Morphing Expanded Dropdown List */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                type: 'spring',
                stiffness: 420,
                damping: 34,
              }}
              className="border-t border-[#23262d] max-h-[340px] overflow-y-auto px-2 py-2"
            >
              {filteredItems.length === 0 ? (
                <div className="py-4 text-center text-xs text-[#78808b]">
                  No results found
                </div>
              ) : (
                <div className="space-y-3">
                  {groupedCategories.map(([category, items]) => (
                    <div key={category} className="space-y-0.5">
                      <div className="px-2.5 py-1 text-[11px] font-medium text-[#6b7280] tracking-wide select-none">
                        {category}
                      </div>
                      <div className="space-y-0.5">
                        {items.map((item) => {
                          const itemIndex = filteredItems.findIndex((fi) => fi.id === item.id);
                          const isSelected = itemIndex === selectedIndex;

                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                item.action();
                                setIsOpen(false);
                              }}
                              onMouseEnter={() => setSelectedIndex(itemIndex)}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                                isSelected
                                  ? 'bg-[#22252c] text-white shadow-sm'
                                  : 'text-[#d1d5db] hover:bg-[#1a1c22]'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className="text-[#9ca3af] shrink-0">
                                  {category === 'Settings' && item.id === 'profile' ? (
                                    <Settings size={13} />
                                  ) : (
                                    <ArrowRight size={13} />
                                  )}
                                </span>
                                <span className="truncate font-normal tracking-wide">{item.label}</span>
                              </div>
                              {item.hint && (
                                <span className="text-[10px] font-mono text-[#6b7280] shrink-0 ml-2">
                                  {item.hint}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CommandSearchBar;
