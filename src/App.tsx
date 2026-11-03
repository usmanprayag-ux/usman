/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { KageLandingPage } from './effects/kage-landing-page/KageLandingPage';
import { SmoothMode } from './shaders/landing-pages/LandingPageFrame';
import { CommandSearchBar } from './components/CommandSearchBar';
import './effects/kage-landing-page/styles.css';
import { Maximize2, Minimize2 } from 'lucide-react';

export function Scene({
  primaryColor = '#e0231c',
  headingFont = 'Onest',
  bodyFont = 'Onest',
  headingWeight = 400,
  bodyWeight = 300,
  headingCeiling = 60,
  bodySize = 14,
  headingTracking = -0.012,
  smoothMode = 'native',
  smoothFactor = 0.16,
  lockResolution = true,
  motionBlurEnabled = true,
  motionBlurIntensity = 1.0,
  onVelocityChange,
  onChapterChange,
}: {
  primaryColor?: string;
  headingFont?: 'Onest' | 'Instrument Serif' | 'Newsreader' | 'Geist';
  bodyFont?: 'Onest' | 'Geist' | 'Newsreader' | 'Instrument Serif';
  headingWeight?: 400 | 500 | 600 | 700;
  bodyWeight?: 300 | 400 | 500 | 600;
  headingCeiling?: number;
  bodySize?: number;
  headingTracking?: number;
  smoothMode?: SmoothMode;
  smoothFactor?: number;
  lockResolution?: boolean;
  motionBlurEnabled?: boolean;
  motionBlurIntensity?: number;
  onVelocityChange?: (vel: number) => void;
  onChapterChange?: (chap: number) => void;
}) {
  return (
    <div className="effect-frame">
      <KageLandingPage
        title="Kage — Where stillness reveals the unseen"
        sourceUrl="/landing-pages/kage.html"
        primaryColor={primaryColor}
        headingFont={headingFont}
        bodyFont={bodyFont}
        headingWeight={headingWeight}
        bodyWeight={bodyWeight}
        smoothMode={smoothMode}
        smoothFactor={smoothFactor}
        lockResolution={lockResolution}
        motionBlurEnabled={motionBlurEnabled}
        motionBlurIntensity={motionBlurIntensity}
        onVelocityChange={onVelocityChange}
        typography={{
          headingCeiling,
          bodySize,
          headingTracking,
        }}
        onChapterChange={onChapterChange}
      />
    </div>
  );
}

const CHAPTERS = [
  { id: 'hero', num: '01', title: 'Prologue', jp: '山門序章' },
  { id: 'gate', num: '02', title: 'Sanmon Gate', jp: '山門の影' },
  { id: 'pathways', num: '03', title: 'Secret Pathways', jp: '参道の導き' },
  { id: 'lessons', num: '04', title: 'Lantern Court', jp: '燈籠庭' },
  { id: 'eternity', num: '05', title: 'Afterlight', jp: '月水亭' },
  { id: 'portfolio', num: '06', title: 'Portfolio', jp: '制作室' },
];

export default function App() {
  const [primaryColor, setPrimaryColor] = useState('#e0231c');
  const [headingFont, setHeadingFont] = useState<'Onest' | 'Instrument Serif' | 'Newsreader' | 'Geist'>('Onest');
  const [bodyFont, setBodyFont] = useState<'Onest' | 'Geist' | 'Newsreader' | 'Instrument Serif'>('Onest');
  const [headingWeight, setHeadingWeight] = useState<400 | 500 | 600 | 700>(400);
  const [bodyWeight, setBodyWeight] = useState<300 | 400 | 500 | 600>(300);
  const [headingCeiling, setHeadingCeiling] = useState(60);
  const [bodySize, setBodySize] = useState(14);
  const [headingTracking, setHeadingTracking] = useState(-0.012);

  // Hardware Native Smooth Motion (zero lag, 120Hz responsive compositor scrolling)
  const [smoothMode, setSmoothMode] = useState<SmoothMode>('native');
  const [smoothFactor, setSmoothFactor] = useState(0.16);
  const [lockResolution, setLockResolution] = useState(true);
  const [motionBlurEnabled, setMotionBlurEnabled] = useState(true);
  const [motionBlurIntensity, setMotionBlurIntensity] = useState(1.15);
  const [currentVelocity, setCurrentVelocity] = useState(0);

  // Background Audio: Cyberpunk Edgerunners soundtrack auto-playing seamlessly in background (no toggle)
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.55;

    const playAudio = () => {
      if (audio.paused) {
        audio.play().catch(() => {});
      }
    };

    // Attempt playback immediately
    playAudio();

    // Start immediately on first user interaction if blocked by initial browser autoplay policy
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'];
    const onUserGesture = () => {
      playAudio();
      if (!audio.paused) {
        events.forEach((evt) => window.removeEventListener(evt, onUserGesture));
      }
    };

    events.forEach((evt) => window.addEventListener(evt, onUserGesture, { passive: true }));

    // Also listen to postMessage from iframe
    const onMessage = (e: MessageEvent) => {
      if (e.data === 'kage-interaction') {
        playAudio();
      }
    };
    window.addEventListener('message', onMessage);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, onUserGesture));
      window.removeEventListener('message', onMessage);
    };
  }, []);

  // Firefly Particle Controls
  const [firefliesEnabled, setFirefliesEnabled] = useState(true);

  // Spatial 3D Effects State
  const [spatialTiltEnabled, setSpatialTiltEnabled] = useState(true);
  const [pointerNorm, setPointerNorm] = useState({ x: 0, y: 0 });

  const [activeChapter, setActiveChapter] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Spatial Pointer Tracking (3D Parallax Tilt)
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const normX = (e.clientX / w) * 2 - 1;
      const normY = (e.clientY / h) * 2 - 1;
      setPointerNorm({ x: normX, y: normY });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, []);

  // Toggle Firefly visibility in Three.js world
  useEffect(() => {
    try {
      const iframe = document.querySelector('iframe');
      const win = iframe?.contentWindow as unknown as { WORLD?: { fireflies?: { material?: { uniforms?: { uEnabled?: { value: number } } } } } };
      if (win?.WORLD?.fireflies?.material?.uniforms?.uEnabled) {
        win.WORLD.fireflies.material.uniforms.uEnabled.value = firefliesEnabled ? 1.0 : 0.0;
      }
    } catch {
      // Ignored
    }
  }, [firefliesEnabled]);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const handleReset = () => {
    setPrimaryColor('#e0231c');
    setHeadingFont('Onest');
    setBodyFont('Onest');
    setHeadingWeight(400);
    setBodyWeight(300);
    setHeadingCeiling(60);
    setBodySize(14);
    setHeadingTracking(-0.012);
    setSmoothMode('native');
    setSmoothFactor(0.16);
    setLockResolution(true);
    setMotionBlurEnabled(true);
    setMotionBlurIntensity(1.15);
    setSpatialTiltEnabled(true);
    setFirefliesEnabled(true);
  };

  const jumpToChapter = (id: string, index: number) => {
    setActiveChapter(index);
    try {
      const iframe = document.querySelector('iframe');
      if (iframe?.contentDocument) {
        const target = iframe.contentDocument.getElementById(id);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }
    } catch {
      // Ignored
    }
  };

  // 3D Spatial Parallax Transform for Glass Overlays
  const spatialTransform = spatialTiltEnabled
    ? `perspective(1200px) rotateY(${pointerNorm.x * 3.0}deg) rotateX(${-pointerNorm.y * 3.0}deg)`
    : 'none';

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-[#05070a] text-[#dfe7e0]"
      style={{
        fontFamily: "'Onest', system-ui, sans-serif",
      }}
    >
      {/* Authored Kage Scene Component with Depth Mountain Parallax, Smooth Engine & Directional Motion Blur */}
      <Scene
        primaryColor={primaryColor}
        headingFont={headingFont}
        bodyFont={bodyFont}
        headingWeight={headingWeight}
        bodyWeight={bodyWeight}
        headingCeiling={headingCeiling}
        bodySize={bodySize}
        headingTracking={headingTracking}
        smoothMode={smoothMode}
        smoothFactor={smoothFactor}
        lockResolution={lockResolution}
        motionBlurEnabled={motionBlurEnabled}
        motionBlurIntensity={motionBlurIntensity}
        onVelocityChange={(vel) => setCurrentVelocity(vel)}
        onChapterChange={(chap) => setActiveChapter(chap)}
      />

      {/* TOP CENTER: Command Search Bar - Elevated to the Very Top Edge */}
      <div className="fixed inset-x-0 top-2 sm:top-2.5 z-50 flex justify-center pointer-events-none px-4">
        <div
          className="pointer-events-auto transition-transform duration-300 ease-out"
          style={{ transform: spatialTransform }}
        >
          <CommandSearchBar
            onJumpChapter={jumpToChapter}
            onToggleMotionBlur={() => setMotionBlurEnabled((p) => !p)}
            motionBlurEnabled={motionBlurEnabled}
            onToggleFireflies={() => setFirefliesEnabled((p) => !p)}
            firefliesEnabled={firefliesEnabled}
            onToggleSpatialTilt={() => setSpatialTiltEnabled((p) => !p)}
            spatialTiltEnabled={spatialTiltEnabled}
            onSelectColor={setPrimaryColor}
            onToggleFullscreen={toggleFullscreen}
            onReset={handleReset}
          />
        </div>
      </div>

      {/* Fullscreen Button (Top Right Glass Pill) */}
      <div
        className="absolute top-3.5 right-4 z-40 flex items-center transition-transform duration-300 ease-out"
        style={{ transform: spatialTransform }}
      >
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          className="p-2.5 rounded-full backdrop-blur-2xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.15] text-[#dfe7e0] transition-all hover:scale-105 shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)]"
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
      </div>

      {/* Glassmorphic Chapter Dock - Centered in Between the Bottom Screen */}
      <div className="fixed inset-x-0 bottom-8 z-30 flex justify-center pointer-events-none px-4">
        <div
          className="pointer-events-auto transition-transform duration-300 ease-out"
          style={{
            transform: spatialTiltEnabled
              ? `perspective(1000px) rotateY(${pointerNorm.x * 2.5}deg) rotateX(${-pointerNorm.y * 2.5}deg)`
              : 'none',
          }}
        >
          <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-full backdrop-blur-2xl bg-[#05070a]/75 border border-white/[0.16] shadow-[0_16px_40px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.25)]">
            {CHAPTERS.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => jumpToChapter(ch.id, idx + 1)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs transition-all ${
                  activeChapter === idx + 1
                    ? 'bg-gradient-to-r from-[#e0231c] to-[#ff5a3c] text-white font-medium shadow-[0_0_18px_rgba(224,35,28,0.6),inset_0_1px_1px_rgba(255,255,255,0.4)]'
                    : 'text-[#aab4ad] hover:text-[#dfe7e0] hover:bg-white/[0.08]'
                }`}
              >
                <span className="text-[10px] font-mono opacity-80">{ch.num}</span>
                <span className="hidden sm:inline font-light tracking-wide">{ch.title}</span>
                <span className="text-[10px] opacity-70 hidden md:inline font-normal">{ch.jp}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Background Soundtrack: Cyberpunk Edgerunners (auto-playing with zero UI toggles) */}
      <audio
        ref={audioRef}
        src="/audio/cyberpunk-edgerunners.mp3"
        loop
        preload="auto"
        className="hidden"
      />
    </div>
  );
}
