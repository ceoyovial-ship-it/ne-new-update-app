'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

const SCHOOL_NAME = 'PACE NR Olympiad';
const SUBTITLE = 'AI-Powered School ERP System for Excellence in Education';

interface SplashScreenProps {
  onFinish: () => void;
  duration?: number;
}

function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => ({
        id: i,
        size: 3 + Math.random() * 8,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 12 + Math.random() * 10,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute bottom-0 rounded-full bg-amber-300/40"
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: -window.innerHeight * 1.1, opacity: [0, 0.5, 0.5, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
          }}
        />
      ))}
    </div>
  );
}

function AnimatedWaves() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-56 overflow-hidden pointer-events-none" aria-hidden="true">
      <motion.svg
        className="absolute bottom-0 w-[200%] h-full opacity-20"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        fill="none"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      >
        <path d="M0,100 C150,160 350,40 600,100 C850,160 1050,40 1200,100 L1200,200 L0,200 Z" fill="url(#splash-wave-1)" />
        <defs>
          <linearGradient id="splash-wave-1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </linearGradient>
        </defs>
      </motion.svg>
      <motion.svg
        className="absolute bottom-0 w-[200%] h-full opacity-15"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        fill="none"
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 26, repeat: Infinity, ease: 'linear' }}
      >
        <path d="M0,120 C200,60 400,180 600,120 C800,60 1000,180 1200,120 L1200,200 L0,200 Z" fill="url(#splash-wave-2)" />
        <defs>
          <linearGradient id="splash-wave-2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
          </linearGradient>
        </defs>
      </motion.svg>
    </div>
  );
}

function AnimatedBackground() {
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ backgroundPosition: '0% 50%' }}
      animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
      transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
      style={{
        background: 'linear-gradient(135deg, #0c1e4d, #14306e, #0c1e4d, #1a3a7d, #0c1e4d)',
        backgroundSize: '300% 300%',
      }}
    />
  );
}

export function SplashScreen({ onFinish, duration = 6000 }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      setProgress(pct);
      if (pct >= 100) clearInterval(interval);
    }, 50);

    const completeTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onFinish, 700);
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(completeTimer);
    };
  }, [duration, onFinish]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          <AnimatedBackground />
          <FloatingParticles />
          <AnimatedWaves />

          {/* Decorative glow blobs */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl"
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl"
            animate={{ y: [0, 20, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center px-6 max-w-3xl text-center">
            {/* Logo with zoom + glow */}
            <motion.div
              className="w-28 h-28 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-8 ring-1 ring-white/20"
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{
                boxShadow: '0 0 40px 8px rgba(250, 204, 21, 0.3)',
              }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 30px 0 rgba(250, 204, 21, 0.25)',
                    '0 0 60px 12px rgba(250, 204, 21, 0.5)',
                    '0 0 30px 0 rgba(250, 204, 21, 0.25)',
                  ],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-full h-full rounded-2xl flex items-center justify-center"
              >
                <GraduationCap className="h-16 w-16 text-amber-400" />
              </motion.div>
            </motion.div>

            {/* School name letter by letter */}
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3 tracking-tight"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              {SCHOOL_NAME.split('').map((char, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + i * 0.05, duration: 0.4, ease: 'easeOut' }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </h1>

            {/* Subtitle fade in */}
            <motion.p
              className="text-base sm:text-lg md:text-xl text-blue-100 max-w-xl leading-relaxed mb-12"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + SCHOOL_NAME.length * 0.05 + 0.3, duration: 0.8, ease: 'easeOut' }}
            >
              {SUBTITLE}
            </motion.p>

            {/* Progress bar */}
            <div className="w-full max-w-md">
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Loading dots */}
              <div className="flex items-center justify-center gap-1.5 mt-6">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 rounded-full bg-amber-400"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.3, 1] }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Footer credit */}
            <motion.p
              className="absolute bottom-8 left-0 right-0 text-sm text-blue-200/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
            >
              Powered by Yovial Technologies
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
