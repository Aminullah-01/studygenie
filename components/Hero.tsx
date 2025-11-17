
import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="text-center py-16 sm:py-24">
      <div className="inline-flex items-center bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full px-4 py-1 mb-6">
        <SparklesIcon className="w-5 h-5 mr-2" />
        <span className="font-medium">Your Personal AI Study Partner</span>
      </div>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Unlock Your Learning Potential
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
        StudyGenie transforms your notes into interactive summaries, quizzes, and flashcards. Study smarter, not harder.
      </p>
      <div className="mt-8">
        <button
          onClick={onStart}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
        >
          Start Studying Now
        </button>
      </div>
    </div>
  );
};

export default Hero;
