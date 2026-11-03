/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

export interface MagneticKeyProps {
  children: React.ReactNode;
  className?: string;
  strength?: number; // 0 (rigid) to 1 (full cursor tracking), default 0.38
  radius?: number; // magnetic activation radius in pixels, default 90
  isKeycap?: boolean; // apply tactile mechanical glassmorphism keycap styling
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  title?: string;
  role?: string;
  ariaLabel?: string;
}

export const MagneticKey: React.FC<MagneticKeyProps> = ({
  children,
  className = '',
  strength = 0.38,
  radius = 90,
  isKeycap = false,
  onClick,
  title,
  role = onClick ? 'button' : undefined,
  ariaLabel,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Motion coordinates for magnetic displacement
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // High-performance spring physics (120Hz smooth, bouncy yet snappy)
  const springConfig = { damping: 16, stiffness: 380, mass: 0.18 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);

  // Optional 3D tilt for tactile keycaps
  const tiltX = useTransform(smoothY, [-18, 18], [12, -12]);
  const tiltY = useTransform(smoothX, [-18, 18], [-12, 12]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.hypot(dx, dy);

      if (dist < radius) {
        // Smooth non-linear magnetic pull
        const pull = 1 - Math.pow(dist / radius, 1.6);
        x.set(dx * strength * (1 + pull * 0.4));
        y.set(dy * strength * (1 + pull * 0.4));
      } else {
        x.set(0);
        y.set(0);
      }
    },
    [radius, strength, x, y]
  );

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  }, [x, y]);

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const defaultKeycapClasses = isKeycap
    ? 'inline-flex items-center justify-center font-mono text-[10px] uppercase font-semibold text-white rounded-md px-2 py-0.5 backdrop-blur-2xl backdrop-saturate-200 bg-white/[0.16] hover:bg-white/[0.26] border border-white/[0.36] hover:border-white/[0.55] shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.65),inset_0_-1px_1px_rgba(0,0,0,0.5),0_4px_14px_rgba(0,0,0,0.6),0_0_12px_rgba(255,255,255,0.12)] active:translate-y-[1px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] transition-all duration-150'
    : '';

  return (
    <motion.div
      ref={ref}
      style={{
        x: smoothX,
        y: smoothY,
        rotateX: isKeycap ? tiltX : 0,
        rotateY: isKeycap ? tiltY : 0,
        transformStyle: 'preserve-3d',
      }}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onClick={onClick}
      title={title}
      role={role}
      aria-label={ariaLabel}
      tabIndex={onClick ? 0 : undefined}
      className={`relative select-none ${defaultKeycapClasses} ${className}`}
    >
      {/* Permanent glass prism highlight border & inner sheen */}
      <span
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-white/[0.2] via-transparent to-white/[0.05] opacity-75"
        aria-hidden="true"
      />

      {/* Intense specular reflection on hover */}
      {isHovered && (
        <span
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-tr from-white/[0.28] via-transparent to-white/[0.45] opacity-100 transition-opacity"
          aria-hidden="true"
        />
      )}
      <span className="relative z-10 flex items-center justify-center gap-1">
        {children}
      </span>
    </motion.div>
  );
};

export default MagneticKey;
