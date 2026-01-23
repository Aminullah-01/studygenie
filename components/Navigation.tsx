
import React from 'react';
import { PageType } from '../types';

const Navigation: React.FC<{ currentPage: PageType, onNavigate: (page: PageType) => void }> = ({ currentPage, onNavigate }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onNavigate('home')}
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg group-hover:bg-indigo-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="brand-font text-xl font-bold tracking-tight text-slate-800">StudyGenie</span>
        </div>
        
        <div className="flex gap-4 md:gap-8">
          <button 
            onClick={() => onNavigate('dashboard')} 
            className={`text-sm font-bold uppercase tracking-wider transition-colors ${currentPage === 'dashboard' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            Workspace
          </button>
          <button 
            onClick={() => onNavigate('history')} 
            className={`text-sm font-bold uppercase tracking-wider transition-colors ${currentPage === 'history' ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}
          >
            History
          </button>
          <button 
            onClick={() => onNavigate('dashboard')} 
            className="hidden md:block px-5 py-2 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 shadow-md transition-all active:scale-95"
          >
            New Session
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
