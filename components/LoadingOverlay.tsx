
import React, { useState, useEffect } from 'react';

interface LoadingOverlayProps {
  isLoading: boolean;
  activeFeature: string | null;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, activeFeature }) => {
  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const messages = [
    "Consulting the StudyGenie...",
    "Analyzing complex concepts...",
    "Extracting key information...",
    "Designing your learning materials...",
    "Almost ready to go...",
    "Adding some academic magic...",
  ];

  useEffect(() => {
    if (!isLoading) {
      setProgress(0);
      setMessageIndex(0);
      return;
    }

    // Cycle through messages
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    // Simulated progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // Stop at 90 until finished
        return prev + (90 - prev) * 0.1;
      });
    }, 1000);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 glass-effect bg-white/60 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="relative mb-12">
        {/* Animated Spinner with Gradient */}
        <div className="w-32 h-32 rounded-full border-8 border-slate-100 border-t-indigo-600 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-2xl animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="text-center max-w-md w-full">
        <h2 className="text-3xl font-black text-slate-800 mb-4 animate-bounce">
          {activeFeature ? `Generating ${activeFeature}...` : 'Thinking...'}
        </h2>
        
        <p className="text-lg font-bold text-indigo-600/70 h-8 transition-all duration-500">
          {messages[messageIndex]}
        </p>

        {/* Progress Bar Container */}
        <div className="mt-8 w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 transition-all duration-1000 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-xs font-black text-slate-400 uppercase tracking-widest">
          {Math.round(progress)}% Processed
        </p>
      </div>

      <div className="mt-16 bg-white/50 px-6 py-4 rounded-3xl border border-white/20 shadow-xl max-w-sm text-center">
        <p className="text-sm font-medium text-slate-600 italic">
          "Did you know? Spaced repetition can improve long-term retention by up to 200%."
        </p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
