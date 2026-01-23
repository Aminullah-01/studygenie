
import React from 'react';
import { HistoryItem, FeatureType } from '../types';

interface HistoryViewProps {
  history: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
  onClear: () => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onSelectItem, onClear }) => {
  const getFeatureLabel = (type: FeatureType) => {
    switch (type) {
      case 'summary': return 'Summary';
      case 'quiz': return 'Quiz';
      case 'explain': return 'Explanation';
      case 'plan': return 'Study Plan';
      case 'flashcards': return 'Flashcards';
    }
  };

  const getFeatureIcon = (type: FeatureType) => {
    switch (type) {
      case 'summary': return '📝';
      case 'quiz': return '🧠';
      case 'explain': return '👶';
      case 'plan': return '📅';
      case 'flashcards': return '📇';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Study History</h2>
          <p className="text-slate-500 mt-1">Access your previous generated study materials.</p>
        </div>
        {history.length > 0 && (
          <button 
            onClick={onClear}
            className="text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-slate-800">No history yet</h3>
          <p className="text-slate-500 max-w-xs mx-auto mt-2">
            Start a new session in the Workspace to see your history here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.sort((a, b) => b.timestamp - a.timestamp).map((item) => (
            <div 
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {getFeatureIcon(item.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{getFeatureLabel(item.type)}</h4>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                      {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <div className="bg-indigo-50 text-indigo-600 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="mt-4 text-slate-600 text-sm line-clamp-2 italic border-l-2 border-slate-100 pl-4">
                "{item.sourceSnippet}..."
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
