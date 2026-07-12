'use client';

import { useEffect, useRef, useState } from 'react';

interface UseCountUpOptions {
  end: number;
  start?: number;
  duration?: number;
  decimals?: number;
}

/**
 * Animates a number from `start` to `end` over `duration` ms using
 * requestAnimationFrame with an ease-out curve. Returns the current
 * displayed value plus a ref to attach to the element so the animation
 * only starts once the element scrolls into view.
 */
export function useCountUp({ end, start = 0, duration = 1600, decimals = 0 }: UseCountUpOptions) {
  const [value, setValue] = useState(start);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    let startTime: number | null = null;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (startTime === null) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = easeOut(progress);
      const current = start + (end - start) * eased;
      setValue(current);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        setValue(end);
      }
    };

    frameRef.current = requestAnimationFrame(step);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [started, end, start, duration]);

  const factor = Math.pow(10, decimals);
  const display = Math.round(value * factor) / factor;

  return { value: display, ref };
}
