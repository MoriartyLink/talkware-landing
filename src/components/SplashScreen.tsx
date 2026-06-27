import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const clickCountRef = useRef(0);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback(() => {
    clickCountRef.current += 1;

    if (clickCountRef.current >= 3) {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickCountRef.current = 0;
      onFinish();
      return;
    }

    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    clickTimerRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1500);
  }, [onFinish]);

  useEffect(() => {
    // Fallback if video fails to play or load
    const timer = setTimeout(() => {
      onFinish();
    }, 10000); // 10 seconds fallback

    return () => {
      clearTimeout(timer);
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
      onClick={handleClick}
    >
      <video
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={onFinish}
        className="w-full h-full object-cover"
      >
        <source src="/splash-screen.mp4" type="video/mp4" />
      </video>
    </motion.div>
  );
};

export default SplashScreen;
