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
  Compass,
  Sparkles,
  Globe,
  ExternalLink,
  Box,
  ChevronUp,
  ChevronDown,
  CornerDownLeft,
} from 'lucide-react';
import { MagneticKey } from './MagneticKey';

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

  // Project chapters and settings
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

    // Settings & Features
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

  // Helper to pick contextual icons with glassmorphism wrapper
  const getItemIcon = (id: string, category: string) => {
    switch (id) {
      case 'prologue':
        return <Compass size={13} className="text-[#dfe7e0]" />;
      case 'sanmon-gate':
        return <Layers size={13} className="text-[#dfe7e0]" />;
      case 'secret-pathways':
        return <Sparkles size={13} className="text-[#dfe7e0]" />;
      case 'lantern-court':
        return <Flame size={13} className="text-[#ff7849]" />;
      case 'afterlight-sanctum':
        return <Wind size={13} className="text-[#96e2df]" />;
      case 'creator-portfolio':
        return <Sparkles size={13} className="text-[#e0231c]" />;
      case 'open-portfolio-site':
        return <Globe size={13} className="text-[#5eead4]" />;
      case 'profile':
        return <Settings size={13} className="text-[#dfe7e0]" />;
      case 'fireflies':
        return <Flame size={13} className="text-[#fcee0a]" />;
      case 'motion-blur':
        return <Wind size={13} className="text-[#86efac]" />;
      case 'theme-vermilion':
      case 'theme-yellow':
        return <Palette size={13} className="text-[#fca5a5]" />;
      case 'spatial-3d':
        return <Box size={13} className="text-[#93c5fd]" />;
      case 'fullscreen':
        return <Maximize2 size={13} className="text-[#dfe7e0]" />;
      default:
        return category === 'Settings' ? <Settings size={13} /> : <ArrowRight size={13} />;
    }
  };

  return (
    <div ref={containerRef} className="flex flex-col items-center select-none pointer-events-auto">
      {/* Overhead hint with thin vertical pointer line */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center mb-0.5 text-center"
          >
            <div className="text-[9px] font-mono tracking-[0.18em] text-[#dfe7e0] uppercase leading-tight font-medium px-2.5 py-0.5 rounded-full backdrop-blur-2xl backdrop-saturate-200 bg-white/[0.1] border border-white/[0.26] shadow-[0_4px_16px_rgba(0,0,0,0.6),inset_0_1px_1.5px_rgba(255,255,255,0.4)]">
              PRESS F OR CLICK INPUT
            </div>
            <div className="w-[1px] h-3 bg-gradient-to-b from-[#4a505b] to-[#a3acbc] my-0.5" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Morphing Intense Glassmorphic Command Container */}
      <motion.div
        layout
        transition={{
          type: 'spring',
          stiffness: 420,
          damping: 34,
        }}
        className={`relative overflow-hidden rounded-2xl bg-[#080a0f]/60 border border-white/[0.28] shadow-[0_30px_90px_rgba(0,0,0,0.88),0_0_24px_rgba(255,255,255,0.08),inset_0_2px_2.5px_rgba(255,255,255,0.5),inset_0_-1px_2px_rgba(0,0,0,0.7)] backdrop-blur-3xl backdrop-saturate-200 transition-all ${
          isOpen ? 'w-[350px] sm:w-[380px]' : 'w-[260px] sm:w-[280px]'
        }`}
      >
        {/* Specular Diagonal Sheen Overlay */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/[0.08] via-transparent to-white/[0.16] opacity-70"
          aria-hidden="true"
        />

        {/* Top Input Bar */}
        <div
          onClick={() => {
            if (!isOpen) {
              setIsOpen(true);
              setTimeout(() => inputRef.current?.focus(), 50);
            }
          }}
          className="relative z-10 flex items-center h-11 px-3 cursor-pointer group"
        >
          {/* Intense Glassmorphic Search Icon with Specular Rim */}
          <div className="p-1.5 rounded-xl backdrop-blur-2xl backdrop-saturate-200 bg-white/[0.16] border border-white/[0.36] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.6),0_4px_14px_rgba(0,0,0,0.5),0_0_10px_rgba(255,255,255,0.15)] text-white mr-2.5 shrink-0 flex items-center justify-center group-hover:bg-white/[0.22] group-hover:border-white/[0.5] transition-all">
            <Search size={13} className="text-white" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setIsOpen(true)}
            placeholder="Search chapters, portfolio, settings..."
            className="w-full bg-transparent border-0 text-xs text-white placeholder-[#8b95a5] focus:outline-none focus:ring-0 selection:bg-[#e0231c]"
          />

          {/* Magnetic Key Badge: F when closed, Esc when open */}
          <div className="shrink-0 ml-2">
            {isOpen ? (
              <MagneticKey
                isKeycap
                strength={0.42}
                radius={75}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                title="Press Esc or click to close"
                className="text-[10px] text-white bg-white/[0.18] hover:bg-white/[0.28] border-white/[0.4]"
              >
                Esc
              </MagneticKey>
            ) : (
              <MagneticKey
                isKeycap
                strength={0.42}
                radius={75}
                title="Press F to search"
                className="text-[10px] text-white"
              >
                F
              </MagneticKey>
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
              className="relative z-10 border-t border-white/[0.16] bg-white/[0.03] backdrop-blur-3xl backdrop-saturate-200 max-h-[350px] overflow-y-auto px-2 py-2.5"
            >
              {filteredItems.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#a3acbc] flex flex-col items-center gap-1.5">
                  <div className="p-2.5 rounded-xl backdrop-blur-2xl bg-white/[0.08] border border-white/[0.2] shadow-inner">
                    <Search size={16} className="text-[#a3acbc]" />
                  </div>
                  <span>No results found</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {groupedCategories.map(([category, items]) => (
                    <div key={category} className="space-y-1">
                      <div className="px-2.5 py-1 text-[10px] uppercase font-mono tracking-wider font-semibold text-[#b8c1ce] select-none flex items-center justify-between">
                        <span>{category}</span>
                        <span className="text-[9px] opacity-80">
                          {items.length} {items.length === 1 ? 'item' : 'items'}
                        </span>
                      </div>
                      <div className="space-y-1">
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
                              className={`group flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs cursor-pointer transition-all duration-150 ${
                                isSelected
                                  ? 'bg-white/[0.2] backdrop-blur-2xl text-white shadow-[0_8px_24px_rgba(0,0,0,0.5),inset_0_1.5px_2px_rgba(255,255,255,0.5)] border border-white/[0.36]'
                                  : 'text-[#dfe7e0] hover:bg-white/[0.09] border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                {/* Intense Glassmorphic Icon Badge */}
                                <div
                                  className={`p-1.5 rounded-lg backdrop-blur-2xl backdrop-saturate-150 transition-all shrink-0 flex items-center justify-center ${
                                    isSelected
                                      ? 'bg-white/[0.28] border border-white/[0.55] shadow-[inset_0_2px_2.5px_rgba(255,255,255,0.7),0_0_14px_rgba(255,255,255,0.25)] scale-110'
                                      : 'bg-white/[0.12] border border-white/[0.24] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.45),0_2px_8px_rgba(0,0,0,0.4)]'
                                  }`}
                                >
                                  {getItemIcon(item.id, category)}
                                </div>
                                <span className="truncate font-normal tracking-wide text-xs">
                                  {item.label}
                                </span>
                              </div>

                              {item.hint && (
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md backdrop-blur-xl bg-white/[0.1] border border-white/[0.22] text-white shrink-0 ml-2 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.35)]">
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

              {/* Bottom Keyboard Navigation Bar with Magnetic Keys */}
              <div className="mt-3 pt-2.5 border-t border-white/[0.16] bg-white/[0.04] backdrop-blur-xl rounded-b-xl flex items-center justify-between px-2 py-1 text-[10px] text-[#dfe7e0] select-none">
                <div className="flex items-center gap-1">
                  <MagneticKey isKeycap strength={0.45} radius={50} className="px-1.5 py-0.5 text-[9px]">
                    <ChevronUp size={10} />
                  </MagneticKey>
                  <MagneticKey isKeycap strength={0.45} radius={50} className="px-1.5 py-0.5 text-[9px]">
                    <ChevronDown size={10} />
                  </MagneticKey>
                  <span className="ml-1 tracking-wide text-[9px] font-mono opacity-80">navigate</span>
                </div>
                <div className="flex items-center gap-1">
                  <MagneticKey isKeycap strength={0.45} radius={50} className="px-1.5 py-0.5 text-[9px]">
                    <CornerDownLeft size={10} />
                  </MagneticKey>
                  <span className="ml-1 tracking-wide text-[9px] font-mono opacity-80">select</span>
                </div>
                <div className="flex items-center gap-1">
                  <MagneticKey
                    isKeycap
                    strength={0.45}
                    radius={50}
                    className="px-1.5 py-0.5 text-[9px]"
                    onClick={() => setIsOpen(false)}
                  >
                    Esc
                  </MagneticKey>
                  <span className="ml-1 tracking-wide text-[9px] font-mono opacity-80">close</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CommandSearchBar;
