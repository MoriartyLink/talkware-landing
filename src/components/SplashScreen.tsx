import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  useEffect(() => {
    // Fallback if video fails to play or load
    const timer = setTimeout(() => {
      onFinish();
    }, 10000); // 10 seconds fallback

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
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
