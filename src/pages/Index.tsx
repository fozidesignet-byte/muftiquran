import { useState, useEffect, useCallback } from "react";
import VideoTracker from "@/components/VideoTracker";
import SplashScreen from "@/components/SplashScreen";

const Index = () => {
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash only once per session
    const hasSeenSplash = sessionStorage.getItem("hasSeenSplash");
    return !hasSeenSplash;
  });

  const handleSplashComplete = useCallback(() => {
    sessionStorage.setItem("hasSeenSplash", "true");
    setShowSplash(false);
  }, []);

  // Handle double back to exit (for mobile browsers)
  useEffect(() => {
    let lastBackPress = 0;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // This handles the case when user tries to leave the page
      // For most browsers, this shows a confirmation dialog
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return <VideoTracker />;
};

export default Index;
