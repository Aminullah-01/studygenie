
import React from 'react';
import { BrainCircuitIcon } from './icons/BrainCircuitIcon';

const Header: React.FC = () => {
  return (
    <header className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-lg sticky top-0 z-50 border-b border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center space-x-3">
          <BrainCircuitIcon className="w-8 h-8 text-blue-500" />
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
            StudyGenie
          </h1>
        </div>
      </div>
    </header>
  );
};

export default Header;
