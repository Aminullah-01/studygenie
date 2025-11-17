
import React, { useState, useCallback } from 'react';
import { AppView, GeneratedContent, GenerationType } from './types';
import Header from './components/Header';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';
import ResultsDisplay from './components/ResultsDisplay';
import { generateContent } from './services/geminiService';
import { LoaderIcon } from './components/icons/LoaderIcon';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.Home);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  
  const handleStartStudying = () => {
    setView(AppView.Dashboard);
  };

  const handleBackToDashboard = () => {
    setGeneratedContent(null);
    setNoteContent(localStorage.getItem('noteContent') || '');
    setView(AppView.Dashboard);
  };

  const handleGeneration = useCallback(async (type: GenerationType, content: string, options?: { summaryLength?: 'short' | 'medium' | 'long' }) => {
    setIsLoading(true);
    setError(null);
    setNoteContent(content);
    localStorage.setItem('noteContent', content);

    try {
      const result = await generateContent(type, content, options);
      setGeneratedContent(result);
      setView(AppView.Results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      // Stay on dashboard to show error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renderView = () => {
    switch (view) {
      case AppView.Home:
        return <Hero onStart={handleStartStudying} />;
      case AppView.Dashboard:
        return <Dashboard onGenerate={handleGeneration} initialContent={noteContent} error={error} />;
      case AppView.Results:
        return generatedContent && <ResultsDisplay content={generatedContent} onBack={handleBackToDashboard} originalContent={noteContent}/>;
      default:
        return <Hero onStart={handleStartStudying} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <LoaderIcon className="w-16 h-16 animate-spin text-blue-500" />
            <p className="mt-4 text-lg">StudyGenie is thinking...</p>
          </div>
        ) : (
          renderView()
        )}
      </main>
    </div>
  );
};

export default App;
