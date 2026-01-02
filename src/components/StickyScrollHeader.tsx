import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StickyScrollHeaderProps {
  editedSectionRef: React.RefObject<HTMLDivElement>;
  capturedSectionRef: React.RefObject<HTMLDivElement>;
  headerOffset: number;
}

const StickyScrollHeader = ({
  editedSectionRef,
  capturedSectionRef,
  headerOffset,
}: StickyScrollHeaderProps) => {
  const [activeSection, setActiveSection] = useState<"edited" | "captured" | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!editedSectionRef.current || !capturedSectionRef.current) return;

      const editedRect = editedSectionRef.current.getBoundingClientRect();
      const capturedRect = capturedSectionRef.current.getBoundingClientRect();
      
      // Threshold for when the header should appear (after the actual header is scrolled past)
      const threshold = headerOffset + 10;

      // Check if we're in the edited section
      if (editedRect.top <= threshold && editedRect.bottom > threshold) {
        setActiveSection("edited");
        setIsVisible(true);
      } 
      // Check if we're in the captured section
      else if (capturedRect.top <= threshold && capturedRect.bottom > threshold) {
        setActiveSection("captured");
        setIsVisible(true);
      }
      // Neither section is in view for sticky header
      else if (editedRect.top > threshold) {
        setIsVisible(false);
        setActiveSection(null);
      }
      // Both sections have scrolled past
      else {
        setIsVisible(false);
        setActiveSection(null);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, [editedSectionRef, capturedSectionRef, headerOffset]);

  const sectionConfig = {
    edited: {
      title: "ኤዲት የተሰሩ (Edited Videos)",
      bgClass: "bg-edited-header",
      textClass: "text-foreground",
    },
    captured: {
      title: "ካፕቸር የተደረጉ (Captured Cassettes)",
      bgClass: "bg-captured-header", 
      textClass: "text-white",
    },
  };

  return (
    <AnimatePresence>
      {isVisible && activeSection && (
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`fixed left-0 right-0 z-30 ${sectionConfig[activeSection].bgClass} ${sectionConfig[activeSection].textClass} text-center py-2 font-bold text-sm tracking-wide shadow-md`}
          style={{ top: `${headerOffset}px` }}
        >
          <motion.span
            key={activeSection + "-text"}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            {sectionConfig[activeSection].title}
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyScrollHeader;
