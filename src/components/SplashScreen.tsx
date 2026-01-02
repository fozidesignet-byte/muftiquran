import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 500),
      setTimeout(() => setStage(2), 1500),
      setTimeout(() => setStage(3), 2500),
      setTimeout(() => onComplete(), 4000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsl(142 40% 15%) 0%, hsl(142 50% 25%) 50%, hsl(142 40% 15%) 100%)",
        }}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Animated Islamic Pattern Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-4xl opacity-10"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                color: "hsl(48 100% 65%)",
              }}
              initial={{ opacity: 0, scale: 0, rotate: 0 }}
              animate={{ 
                opacity: [0, 0.2, 0],
                scale: [0.5, 1.5, 0.5],
                rotate: [0, 180, 360]
              }}
              transition={{
                duration: 4,
                delay: i * 0.2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              ✧
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          {/* Crescent Moon Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="text-6xl md:text-8xl mb-6"
            style={{ color: "hsl(48 100% 65%)" }}
          >
            ☪
          </motion.div>

          {/* Arabic Bismillah */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: stage >= 1 ? 1 : 0, y: stage >= 1 ? 0 : 30 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ 
              color: "hsl(48 100% 90%)",
              fontFamily: "'Amiri', 'Traditional Arabic', serif",
              textShadow: "0 2px 10px hsl(0 0% 0% / 0.5)"
            }}
          >
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </motion.h1>

          {/* App Title */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: stage >= 2 ? 1 : 0, y: stage >= 2 ? 0 : 30 }}
            transition={{ duration: 0.6 }}
            className="text-xl md:text-2xl font-semibold mb-2"
            style={{ 
              color: "hsl(48 80% 85%)",
              textShadow: "0 2px 8px hsl(0 0% 0% / 0.4)"
            }}
          >
            Mufi Hajj Umer Idris
          </motion.h2>

          <motion.h3
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: stage >= 2 ? 1 : 0, y: stage >= 2 ? 0 : 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl mb-6"
            style={{ 
              color: "hsl(48 60% 75%)",
              fontFamily: "'Noto Serif Ethiopic', Georgia, serif"
            }}
          >
            የቁርአን ተፍሲር ቪዲዮ ትራከር
          </motion.h3>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: stage >= 3 ? 1 : 0, scale: stage >= 3 ? 1 : 0.9 }}
            transition={{ duration: 0.6 }}
            className="max-w-md"
          >
            <p className="text-sm md:text-base mb-3" style={{ color: "hsl(48 40% 70%)" }}>
              Track video editing progress and cassette capture status for the sacred Quran Tefseer project
            </p>
            <p className="text-xs md:text-sm" style={{ color: "hsl(48 30% 60%)", fontFamily: "'Noto Serif Ethiopic', Georgia, serif" }}>
              የቅዱሱ ቁርአን ተፍሲር ፕሮጀክት የቪዲዮ ኤዲቲንግ እና ካሴት ካፕቸር ሁኔታን ይከታተሉ
            </p>
          </motion.div>

          {/* Loading Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: stage >= 3 ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="mt-8 flex items-center gap-2"
          >
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "hsl(48 100% 65%)" }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "hsl(48 100% 65%)" }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: "hsl(48 100% 65%)" }}
              animate={{ scale: [1, 1.5, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            />
          </motion.div>
        </div>

        {/* Decorative Border */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1"
          style={{ background: "linear-gradient(90deg, transparent, hsl(48 100% 65%), transparent)" }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 3, ease: "easeOut" }}
        />
      </motion.div>
    </AnimatePresence>
  );
};

export default SplashScreen;
