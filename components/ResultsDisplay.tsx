
import React, { useState } from 'react';
import { GeneratedContent, QuizQuestion, GenerationType } from '../types';
import Flashcard from './Flashcard';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';

interface ResultsDisplayProps {
  content: GeneratedContent;
  onBack: () => void;
  originalContent: string;
}

type TabKey = 'summary' | 'quiz' | 'explanation' | 'studyPlan' | 'flashcards';

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ content, onBack, originalContent }) => {
  const availableTabs = (Object.keys(content) as Array<keyof GeneratedContent>).filter(key => content[key] != null);
  const [activeTab, setActiveTab] = useState<TabKey>(availableTabs[0] as TabKey);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string | boolean }>({});
  const [showAnswers, setShowAnswers] = useState(false);

  const handleAnswerChange = (questionIndex: number, answer: string | boolean) => {
    setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answer }));
  };
  
  const getCorrectness = (question: QuizQuestion, index: number): 'correct' | 'incorrect' | 'unanswered' => {
      if (!showAnswers) return 'unanswered';
      const selected = selectedAnswers[index];
      if (selected === undefined) return 'unanswered';

      if (question.type === 'mcq' || question.type === 'short') {
          return selected === question.answer ? 'correct' : 'incorrect';
      }
      if (question.type === 'tf') {
          return selected === question.answer ? 'correct' : 'incorrect';
      }
      return 'unanswered';
  };

  const renderQuiz = () => {
    if (!content.quiz) return null;
    return (
        <div>
            {content.quiz.questions.map((q, i) => {
                const correctness = getCorrectness(q, i);
                let borderColor = 'border-slate-300 dark:border-slate-600';
                if (correctness === 'correct') borderColor = 'border-green-500';
                if (correctness === 'incorrect') borderColor = 'border-red-500';

                return (
                    <div key={i} className={`p-4 mb-4 border-2 ${borderColor} rounded-lg bg-white dark:bg-slate-800`}>
                        <p className="font-semibold mb-2">{i + 1}. {q.question}</p>
                        {q.type === 'mcq' && (
                            <div className="space-y-2">
                                {q.options.map((opt, optIndex) => (
                                    <label key={optIndex} className="flex items-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                                        <input type="radio" name={`q-${i}`} value={opt} 
                                               checked={selectedAnswers[i] === opt}
                                               onChange={() => handleAnswerChange(i, opt)}
                                               disabled={showAnswers}
                                               className="mr-3"
                                        /> {opt}
                                    </label>
                                ))}
                            </div>
                        )}
                        {q.type === 'tf' && (
                            <div className="space-y-2">
                                <label className="flex items-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                                    <input type="radio" name={`q-${i}`} value="true"
                                           checked={selectedAnswers[i] === true}
                                           onChange={() => handleAnswerChange(i, true)}
                                           disabled={showAnswers}
                                           className="mr-3"
                                    /> True
                                </label>
                                <label className="flex items-center p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer">
                                    <input type="radio" name={`q-${i}`} value="false"
                                           checked={selectedAnswers[i] === false}
                                           onChange={() => handleAnswerChange(i, false)}
                                           disabled={showAnswers}
                                           className="mr-3"
                                    /> False
                                </label>
                            </div>
                        )}
                        {q.type === 'short' && (
                           <input type="text"
                                  value={(selectedAnswers[i] as string) || ''}
                                  onChange={(e) => handleAnswerChange(i, e.target.value)}
                                  disabled={showAnswers}
                                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700"
                            />
                        )}
                         {showAnswers && (
                            <div className={`mt-3 p-2 rounded-md text-sm font-medium ${correctness === 'correct' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                                Correct Answer: {q.answer.toString()}
                            </div>
                        )}
                    </div>
                );
            })}
             <div className="mt-6 flex justify-center">
                <button onClick={() => setShowAnswers(!showAnswers)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition">
                    {showAnswers ? 'Hide Answers' : 'Check Answers'}
                </button>
            </div>
        </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'summary':
        return <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap p-4 bg-white dark:bg-slate-800 rounded-lg">{content.summary}</div>;
      case 'quiz':
        return renderQuiz();
      case 'explanation':
        return <div className="prose dark:prose-invert max-w-none p-4 bg-white dark:bg-slate-800 rounded-lg">{content.explanation}</div>;
      case 'studyPlan':
        return (
          <div className="space-y-4">
            {content.studyPlan?.plan.map((day) => (
              <div key={day.day} className="p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-lg font-bold">Day {day.day}: {day.topic}</h4>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      day.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                      day.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>{day.difficulty}</span>
                </div>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-300">
                  {day.goals.map((goal, i) => <li key={i}>{goal}</li>)}
                </ul>
              </div>
            ))}
          </div>
        );
      case 'flashcards':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {content.flashcards?.map((card, i) => <Flashcard key={i} front={card.front} back={card.back} />)}
          </div>
        );
      default:
        return <p>No content available.</p>;
    }
  };

  const tabNames: { [key in TabKey]: string } = {
    summary: 'Summary',
    quiz: 'Quiz',
    explanation: 'ELI5',
    studyPlan: 'Study Plan',
    flashcards: 'Flashcards',
  };

  return (
    <div className="max-w-7xl mx-auto">
      <button onClick={onBack} className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:underline mb-6 font-semibold">
        <ChevronLeftIcon className="w-5 h-5" />
        <span>Back to Dashboard</span>
      </button>

      <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {availableTabs.map(tabKey => (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey as TabKey)}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tabKey
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:border-slate-500'
              }`}
            >
              {tabNames[tabKey as TabKey]}
            </button>
          ))}
        </nav>
      </div>

      <div>{renderContent()}</div>
    </div>
  );
};

export default ResultsDisplay;
