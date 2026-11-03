/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';

export interface TypographyConfig {
  headingCeiling?: number;
  bodySize?: number;
  headingTracking?: number;
}

export type SmoothMode = 'silky' | 'crisp' | 'dreamy' | 'native';

export interface LandingPageFrameProps {
  title?: string;
  sourceUrl?: string;
  className?: string;
  headingFont?: 'Onest' | 'Instrument Serif' | 'Newsreader' | 'Geist';
  bodyFont?: 'Onest' | 'Geist' | 'Newsreader' | 'Instrument Serif';
  headingWeight?: 400 | 500 | 600 | 700;
  bodyWeight?: 300 | 400 | 500 | 600;
  primaryColor?: string;
  typography?: TypographyConfig;
  smoothMode?: SmoothMode;
  smoothFactor?: number;
  lockResolution?: boolean;
  motionBlurEnabled?: boolean;
  motionBlurIntensity?: number;
  onVelocityChange?: (velocity: number) => void;
  onLoad?: () => void;
  onChapterChange?: (chapter: number) => void;
}

export const LandingPageFrame: React.FC<LandingPageFrameProps> = ({
  title = 'Kage',
  sourceUrl = '/landing-pages/kage.html',
  className = '',
  headingFont,
  bodyFont,
  headingWeight,
  bodyWeight,
  primaryColor,
  typography,
  smoothMode = 'silky',
  smoothFactor,
  lockResolution = true,
  motionBlurEnabled = true,
  motionBlurIntensity = 1.0,
  onVelocityChange,
  onLoad,
  onChapterChange,
}) => {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  // Smooth scroll and motion blur internal state
  const scrollState = useRef<{
    targetY: number;
    currentY: number;
    prevY: number;
    currentBlurY: number;
    isAnimating: boolean;
    rafId: number | null;
    factor: number;
    enabled: boolean;
    blurEnabled: boolean;
    blurIntensity: number;
  }>({
    targetY: 0,
    currentY: 0,
    prevY: 0,
    currentBlurY: 0,
    isAnimating: false,
    rafId: null,
    factor: 0.082,
    enabled: true,
    blurEnabled: true,
    blurIntensity: 1.0,
  });

  // Keep state refs in sync with props
  useEffect(() => {
    scrollState.current.blurEnabled = motionBlurEnabled;
    scrollState.current.blurIntensity = motionBlurIntensity;
  }, [motionBlurEnabled, motionBlurIntensity]);

  // Calculate actual factor based on mode
  useEffect(() => {
    if (smoothMode === 'native') {
      scrollState.current.enabled = false;
    } else {
      scrollState.current.enabled = true;
      if (smoothFactor !== undefined) {
        scrollState.current.factor = smoothFactor;
      } else {
        switch (smoothMode) {
          case 'dreamy':
            scrollState.current.factor = 0.09;
            break;
          case 'crisp':
            scrollState.current.factor = 0.24;
            break;
          case 'silky':
          default:
            scrollState.current.factor = 0.16;
            break;
        }
      }
    }
  }, [smoothMode, smoothFactor]);

  // Check WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setWebglSupported(false);
    } catch {
      setWebglSupported(false);
    }
  }, []);

  // Sync customizations (color, fonts, weights, typography, GPU compositing fixes)
  const applyCustomizations = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;

      const root = doc.documentElement;

      // 1. Primary accent color + ember tint
      if (primaryColor) {
        root.style.setProperty('--vermilion', primaryColor);
        root.style.setProperty('--ember', primaryColor);
      }

      // 2. Load Google Fonts if custom font chosen
      const fontFamilies = new Set<string>();
      if (headingFont && headingFont !== 'Onest') fontFamilies.add(headingFont);
      if (bodyFont && bodyFont !== 'Onest') fontFamilies.add(bodyFont);

      if (fontFamilies.size > 0 && !doc.getElementById('kage-dynamic-fonts')) {
        const link = doc.createElement('link');
        link.id = 'kage-dynamic-fonts';
        link.rel = 'stylesheet';
        const familiesQuery = Array.from(fontFamilies)
          .map((f) => `family=${encodeURIComponent(f)}:ital,wght@0,300..700;1,300..700`)
          .join('&');
        link.href = `https://fonts.googleapis.com/css2?${familiesQuery}&display=swap`;
        doc.head.appendChild(link);
      }

      // 3. Optional motion blur setup: handled via hardware-accelerated CSS filter

      // 4. Inject styling overrides + GPU composite layer enhancements
      let styleEl = doc.getElementById('kage-frame-custom-style') as HTMLStyleElement | null;
      if (!styleEl) {
        styleEl = doc.createElement('style');
        styleEl.id = 'kage-frame-custom-style';
        doc.head.appendChild(styleEl);
      }

      const rules: string[] = [
        /* Hardware acceleration and compositing isolation to eliminate scrolling stutter */
        '#gl { transform: translate3d(0, 0, 0); backface-visibility: hidden; will-change: transform, filter; }',
        '#grain { transform: translate3d(0, 0, 0); backface-visibility: hidden; }',
        '#vignette { transform: translate3d(0, 0, 0); backface-visibility: hidden; }',
        'body { -webkit-overflow-scrolling: touch; }',
      ];

      if (headingFont) {
        rules.push(
          `h1, h2, h3, .display, .eyebrow { font-family: '${headingFont}', 'Onest', serif, sans-serif !important; }`
        );
      }
      if (headingWeight) {
        rules.push(`h1, h2, h3, .display { font-weight: ${headingWeight} !important; }`);
      }
      if (bodyFont) {
        rules.push(
          `body, .body, .body-lg, p { font-family: '${bodyFont}', 'Onest', sans-serif !important; }`
        );
      }
      if (bodyWeight) {
        rules.push(`body, .body, .body-lg, p { font-weight: ${bodyWeight} !important; }`);
      }
      if (typography?.headingCeiling) {
        rules.push(
          `.h-sec { font-size: clamp(24px, 4vw, ${typography.headingCeiling}px) !important; }`
        );
      }
      if (typography?.bodySize) {
        rules.push(`.body { font-size: ${typography.bodySize}px !important; }`);
      }
      if (typography?.headingTracking !== undefined) {
        rules.push(
          `.display, h1, h2, h3 { letter-spacing: ${typography.headingTracking}em !important; }`
        );
      }

      styleEl.textContent = rules.join('\n');
    } catch {
      // Cross-origin safety
    }
  }, [primaryColor, headingFont, bodyFont, headingWeight, bodyWeight, typography]);

  // Setup silky smooth momentum scrolling engine with subtle canvas motion blur
  const setupSmoothScroll = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    try {
      const win = iframe.contentWindow;
      const doc = iframe.contentDocument;
      if (!win || !doc) return;

      const state = scrollState.current;
      state.targetY = win.scrollY;
      state.currentY = win.scrollY;
      state.prevY = win.scrollY;
      state.currentBlurY = 0;

      const glCanvas = doc.getElementById('gl') as HTMLCanvasElement | null;
      let lastBlurState = false;

      const applyCanvasMotionBlur = (blurY: number) => {
        if (!glCanvas) return;

        if (blurY > 0.4 && state.blurEnabled) {
          glCanvas.style.filter = `blur(${Math.min(blurY, 3.0).toFixed(1)}px)`;
          lastBlurState = true;
        } else if (lastBlurState) {
          glCanvas.style.filter = 'none';
          lastBlurState = false;
        }
      };

      const stopAnimation = () => {
        if (state.rafId !== null) {
          cancelAnimationFrame(state.rafId);
          state.rafId = null;
        }
        state.isAnimating = false;
        state.currentBlurY = 0;
        applyCanvasMotionBlur(0);
        onVelocityChange?.(0);
      };

      const getMaxScroll = () => {
        return Math.max(0, doc.documentElement.scrollHeight - win.innerHeight);
      };

      const animate = () => {
        if (!state.enabled) {
          stopAnimation();
          return;
        }

        const diff = state.targetY - state.currentY;

        // Instant velocity calculation (pixels moved in current frame)
        const frameVelocity = Math.abs(diff * state.factor);
        onVelocityChange?.(frameVelocity);

        // Calculate subtle canvas-level directional motion blur
        // Scales smoothly with velocity, clamped to an elegant subtle ceiling (max ~4.8px)
        if (state.blurEnabled) {
          const targetBlur = Math.min(frameVelocity * 0.12 * state.blurIntensity, 4.8);
          // Rapid attack, smooth decay
          state.currentBlurY += (targetBlur - state.currentBlurY) * 0.35;
          applyCanvasMotionBlur(state.currentBlurY);
        } else {
          applyCanvasMotionBlur(0);
        }

        // Threshold check for completion
        if (Math.abs(diff) < 0.25) {
          state.currentY = state.targetY;
          win.scrollTo({ top: state.currentY, behavior: 'instant' as ScrollBehavior });
          stopAnimation();
          return;
        }

        // Luxurious exponential ease damping
        state.currentY += diff * state.factor;
        win.scrollTo({ top: state.currentY, behavior: 'instant' as ScrollBehavior });

        state.rafId = requestAnimationFrame(animate);
      };

      const startAnimation = () => {
        if (!state.isAnimating) {
          state.isAnimating = true;
          state.rafId = requestAnimationFrame(animate);
        }
      };

      // Wheel Handler
      const handleWheel = (e: WheelEvent) => {
        if (!state.enabled) return;

        // Don't intercept if modifier keys are pressed
        if (e.ctrlKey || e.metaKey || e.shiftKey) return;

        e.preventDefault();

        let delta = e.deltaY;
        if (e.deltaMode === 1) delta *= 40; // LINE mode
        else if (e.deltaMode === 2) delta *= 800; // PAGE mode

        const maxScroll = getMaxScroll();
        state.targetY = Math.max(0, Math.min(state.targetY + delta, maxScroll));
        startAnimation();
      };

      // Handle keyboard scroll
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!state.enabled) return;
        if (['input', 'textarea', 'select'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return;

        let delta = 0;
        const pageDelta = win.innerHeight * 0.85;

        switch (e.key) {
          case 'ArrowDown':
            delta = 100;
            break;
          case 'ArrowUp':
            delta = -100;
            break;
          case 'PageDown':
          case ' ':
            delta = pageDelta;
            break;
          case 'PageUp':
            delta = -pageDelta;
            break;
          case 'Home':
            delta = -state.targetY;
            break;
          case 'End':
            delta = getMaxScroll() - state.targetY;
            break;
          default:
            return;
        }

        e.preventDefault();
        const maxScroll = getMaxScroll();
        state.targetY = Math.max(0, Math.min(state.targetY + delta, maxScroll));
        startAnimation();
      };

      let lastScrollY = win.scrollY;
      let lastScrollTime = performance.now();
      let scrollTimer: ReturnType<typeof setTimeout> | null = null;

      // Native scroll synchronization and real-time velocity tracking
      const handleScroll = () => {
        const curY = win.scrollY;
        if (!state.isAnimating) {
          state.currentY = curY;
          state.targetY = curY;
          const now = performance.now();
          const dt = Math.max(now - lastScrollTime, 1);
          const vel = (Math.abs(curY - lastScrollY) / dt) * 16.6;
          lastScrollY = curY;
          lastScrollTime = now;
          onVelocityChange?.(vel);

          if (scrollTimer) clearTimeout(scrollTimer);
          scrollTimer = setTimeout(() => {
            onVelocityChange?.(0);
          }, 80);
        }
      };

      // Intercept anchor link smooth navigation
      const handleAnchorClicks = () => {
        const links = doc.querySelectorAll('a[href^="#"]');
        links.forEach((link) => {
          link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;
            const targetEl = doc.querySelector(href);
            if (targetEl) {
              e.preventDefault();
              e.stopPropagation();
              if (state.enabled) {
                const offsetTop = href === '#top' ? 0 : (targetEl as HTMLElement).offsetTop - 40;
                state.targetY = Math.max(0, Math.min(offsetTop, getMaxScroll()));
                startAnimation();
              } else {
                targetEl.scrollIntoView({ behavior: 'smooth' });
              }
            }
          }, { capture: true });
        });
      };

      win.addEventListener('wheel', handleWheel, { passive: false });
      win.addEventListener('keydown', handleKeyDown);
      win.addEventListener('scroll', handleScroll, { passive: true });
      handleAnchorClicks();

      return () => {
        stopAnimation();
        win.removeEventListener('wheel', handleWheel);
        win.removeEventListener('keydown', handleKeyDown);
        win.removeEventListener('scroll', handleScroll);
      };
    } catch {
      return () => {};
    }
  }, [onVelocityChange]);

  // Re-apply customizations when props change or after iframe loads
  useEffect(() => {
    if (isLoaded) {
      applyCustomizations();
    }
  }, [isLoaded, applyCustomizations]);

  const handleIframeLoad = () => {
    setIsLoaded(true);
    applyCustomizations();
    const cleanupScroll = setupSmoothScroll();
    onLoad?.();

    try {
      const doc = iframeRef.current?.contentDocument;
      if (doc) {
        // Track scroll position to update active chapter
        const updateChapter = () => {
          const scrollY = iframeRef.current?.contentWindow?.scrollY || 0;
          const height = doc.documentElement.scrollHeight - (iframeRef.current?.contentWindow?.innerHeight || 1);
          if (height > 0) {
            const progress = Math.min(Math.max(scrollY / height, 0), 1);
            const chapterIndex = Math.min(Math.floor(progress * 6) + 1, 6);
            onChapterChange?.(chapterIndex);
          }
        };

        iframeRef.current?.contentWindow?.addEventListener('scroll', updateChapter, { passive: true });
      }
    } catch {
      // Ignored
    }

    return () => {
      cleanupScroll?.();
    };
  };

  // Build final source URL with high-performance adaptive resolution cap
  const computedUrl = React.useMemo(() => {
    let url = sourceUrl;
    if (lockResolution) {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}adapt=1&dpr=1.0`;
    }
    return url;
  }, [sourceUrl, lockResolution]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-[#05070a] select-none ${className}`}
      style={{ isolation: 'isolate' }}
    >
      {!webglSupported && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#05070a]/95 text-[#dfe7e0] p-6 text-center">
          <div className="max-w-md space-y-3">
            <h3 className="text-xl font-light text-[#e0231c]">WebGL Not Available</h3>
            <p className="text-sm text-[#aab4ad]">
              Hardware acceleration is required to render the Kage WebGL world. Please enable WebGL in your browser.
            </p>
          </div>
        </div>
      )}

      {/* Primary Sandboxed Full-Document Frame */}
      <iframe
        ref={iframeRef}
        src={computedUrl}
        title={title}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads allow-modals"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        className={`w-full h-full border-0 block transition-opacity duration-700 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={handleIframeLoad}
      />

      {/* Atmospheric Loading Veil */}
      {!isLoaded && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#05070a] transition-opacity duration-500">
          <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border border-[#e0231c]/40 animate-ping absolute" />
            <div className="w-8 h-8 rounded-full bg-[#e0231c] shadow-[0_0_24px_#e0231c]" />
          </div>
          <div className="text-[11px] font-medium tracking-[0.3em] uppercase text-[#dfe7e0] opacity-80">
            KAGE &bull; 影の道
          </div>
          <div className="text-[10px] tracking-[0.2em] text-[#78837c] mt-2">
            ENTERING KYOTO SANCTUM...
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPageFrame;
