import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useState } from "react";
import LandingPage from "./pages/LandingPage";
import AdminDashboard from "./pages/AdminDashboard";
import SplashScreen from "./components/SplashScreen";
import { AnimatePresence, motion } from "motion/react";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <Router>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" onFinish={() => setShowSplash(false)} />
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </motion.div>
        )}
      </AnimatePresence>
    </Router>
  );
}
