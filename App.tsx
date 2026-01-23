
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import ResultsView from './components/ResultsView';
import HistoryView from './components/HistoryView';
import LoadingOverlay from './components/LoadingOverlay';
import { FeatureType, AppState, StudyResult, HistoryItem, PageType } from './types';
import { 
  generateSummary, 
  generateQuiz, 
  explainLikeIWas5, 
  generateStudyPlan, 
  generateFlashcards 
} from './services/geminiService';

const STORAGE_KEY = 'studygenie_history';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return {
      sourceText: '',
      isLoading: false,
      activeFeature: null,
      results: {},
      history: saved ? JSON.parse(saved) : [],
      error: null
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.history));
  }, [state.history]);

  const handleTextChange = (text: string) => {
    setState(prev => ({ ...prev, sourceText: text }));
  };

  const handleGenerate = async (type: FeatureType, text: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, sourceText: text, activeFeature: type }));
    
    try {
      let resultUpdate: StudyResult = {};
      
      switch (type) {
        case 'summary':
          resultUpdate.summary = await generateSummary(text);
          break;
        case 'quiz':
          resultUpdate.quiz = await generateQuiz(text);
          break;
        case 'explain':
          resultUpdate.explanation = await explainLikeIWas5(text);
          break;
        case 'plan':
          resultUpdate.studyPlan = await generateStudyPlan(text);
          break;
        case 'flashcards':
          resultUpdate.flashcards = await generateFlashcards(text);
          break;
      }

      const newHistoryItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        type,
        sourceSnippet: text.slice(0, 100),
        result: resultUpdate
      };

      setState(prev => ({
        ...prev,
        isLoading: false,
        results: { ...prev.results, ...resultUpdate },
        history: [newHistoryItem, ...prev.history]
      }));
      setCurrentPage('results');
    } catch (err) {
      console.error(err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err instanceof Error ? err.message : "An unexpected error occurred."
      }));
    }
  };

  const handleSelectHistory = (item: HistoryItem) => {
    setState(prev => ({
      ...prev,
      activeFeature: item.type,
      results: item.result
    }));
    setCurrentPage('results');
  };

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to delete your entire study history?")) {
      setState(prev => ({ ...prev, history: [] }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-100 selection:text-indigo-900">
      <LoadingOverlay isLoading={state.isLoading} activeFeature={state.activeFeature} />
      
      <Navigation 
        currentPage={currentPage} 
        onNavigate={(p) => setCurrentPage(p)} 
      />
      
      <main className="pb-20">
        {state.error && (
          <div className="max-w-4xl mx-auto px-4 pt-24">
            <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center justify-between shadow-sm">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <strong>Error:</strong> {state.error}
              </span>
              <button onClick={() => setState(p => ({ ...p, error: null }))} className="text-red-900 font-bold hover:underline">Dismiss</button>
            </div>
          </div>
        )}

        {currentPage === 'home' && (
          <LandingPage onStart={() => setCurrentPage('dashboard')} />
        )}
        
        {currentPage === 'dashboard' && (
          <Dashboard 
            onGenerate={handleGenerate} 
            isLoading={state.isLoading} 
            initialText={state.sourceText}
            onTextChange={handleTextChange}
          />
        )}

        {currentPage === 'history' && (
          <HistoryView 
            history={state.history} 
            onSelectItem={handleSelectHistory} 
            onClear={handleClearHistory}
          />
        )}
        
        {currentPage === 'results' && state.activeFeature && (
          <ResultsView 
            activeType={state.activeFeature} 
            result={state.results} 
            onBack={() => setCurrentPage('dashboard')}
          />
        )}
      </main>

      <footer className="fixed bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-50" />
    </div>
  );
};

export default App;
