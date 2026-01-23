
import React, { useState, useRef } from 'react';
import { StudyResult, FeatureType, QuizQuestion, Flashcard, StudyPlan } from '../types';
import { speakExplanation } from '../services/geminiService';

interface ResultsViewProps {
  result: StudyResult;
  activeType: FeatureType;
  onBack: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ result, activeType, onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-24 pb-12 print:p-0">
      <div className="flex items-center justify-between mb-8 print:hidden">
        <button onClick={onBack} className="flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Workspace
        </button>
        <div className="flex gap-4 items-center">
          <button onClick={() => window.print()} className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          </button>
          <span className="bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">{activeType}</span>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-2xl p-8 md:p-12 min-h-[500px] border border-slate-100">
        {activeType === 'summary' && result.summary && <SummaryContent summary={result.summary} />}
        {activeType === 'quiz' && result.quiz && <QuizContent quiz={result.quiz} />}
        {activeType === 'explain' && result.explanation && <ExplainContent explanation={result.explanation} />}
        {activeType === 'plan' && result.studyPlan && <StudyPlanContent plan={result.studyPlan} />}
        {activeType === 'flashcards' && result.flashcards && <FlashcardsContent flashcards={result.flashcards} />}
      </div>
    </div>
  );
};

const SummaryContent: React.FC<{ summary: NonNullable<StudyResult['summary']> }> = ({ summary }) => {
  const [mode, setMode] = useState<'short' | 'medium' | 'long'>('medium');
  return (
    <div>
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit mb-8 print:hidden">
        {(['short', 'medium', 'long'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition-all ${mode === m ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
            {m}
          </button>
        ))}
      </div>
      <div className="prose prose-slate max-w-none text-slate-700 text-lg leading-relaxed whitespace-pre-line">
        {summary[mode]}
      </div>
    </div>
  );
};

const QuizContent: React.FC<{ quiz: QuizQuestion[] }> = ({ quiz }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const correctIndices = quiz.map((q, i) => answers[i]?.toLowerCase().trim() === q.answer.toLowerCase().trim());
  const score = correctIndices.filter(Boolean).length;
  
  // Identify topics for missed questions
  const missedTopics = quiz.filter((_, i) => !correctIndices[i]).map(q => ({ topic: q.topic, suggestion: q.reviewSuggestion }));
  const uniqueMissedTopics = Array.from(new Set(missedTopics.map(t => t.topic))).map(topic => missedTopics.find(t => t.topic === topic)!);

  return (
    <div className="space-y-8">
      {showResults && (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
          {/* Score Card */}
          <div className="bg-indigo-600 rounded-3xl p-10 text-white text-center shadow-xl">
            <h4 className="text-xl font-black opacity-80 mb-2 uppercase tracking-widest">Final Score</h4>
            <div className="text-7xl font-black mb-4">{score} / {quiz.length}</div>
            <p className="text-indigo-100 font-bold text-lg">
              {score === quiz.length ? "Incredible! Master status achieved." : score > 7 ? "Great work! Just a few gaps to fill." : "Good effort. Review the suggestions below."}
            </p>
          </div>

          {/* Smart Roadmap / Review Suggestions */}
          {uniqueMissedTopics.length > 0 && (
            <div className="bg-amber-50 border-2 border-amber-100 rounded-3xl p-8">
              <h5 className="flex items-center gap-2 text-amber-800 font-black text-xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                Study Roadmap
              </h5>
              <div className="grid gap-4">
                {uniqueMissedTopics.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-4 bg-white/50 p-4 rounded-2xl border border-amber-200">
                    <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-lg text-xs font-black uppercase whitespace-nowrap">
                      Review {item.topic}
                    </div>
                    <p className="text-amber-900 text-sm font-medium leading-relaxed">
                      {item.suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {quiz.map((q, idx) => {
        const isCorrect = answers[idx]?.toLowerCase().trim() === q.answer.toLowerCase().trim();
        return (
          <div key={idx} className={`p-8 rounded-3xl border-2 transition-all duration-300 ${showResults ? (isCorrect ? 'bg-green-50/50 border-green-200 shadow-sm' : 'bg-red-50/50 border-red-200 shadow-sm') : 'bg-slate-50 border-slate-100 hover:border-indigo-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                {q.topic}
              </span>
              {showResults && (
                <div className={`flex items-center gap-1 font-black uppercase text-[10px] tracking-widest ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? (
                    <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> Correct</>
                  ) : (
                    <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg> Incorrect</>
                  )}
                </div>
              )}
            </div>
            
            <p className="font-black text-slate-800 mb-6 text-xl">{idx + 1}. {q.question}</p>
            
            {q.options ? (
              <div className="grid gap-3">
                {q.options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => !showResults && setAnswers({ ...answers, [idx]: opt })}
                    className={`p-4 text-left rounded-2xl border-2 font-bold transition-all ${answers[idx] === opt ? (showResults ? (opt === q.answer ? 'bg-green-600 border-green-600 text-white shadow-lg' : 'bg-red-600 border-red-600 text-white shadow-lg') : 'bg-indigo-600 border-indigo-600 text-white shadow-lg') : (showResults && opt === q.answer ? 'bg-green-100 border-green-500 text-green-800' : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400')}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                disabled={showResults}
                value={answers[idx] || ''}
                onChange={(e) => setAnswers({ ...answers, [idx]: e.target.value })}
                className={`w-full p-4 rounded-2xl border-2 font-bold outline-none transition-all ${showResults ? (isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'border-slate-200 focus:border-indigo-500'}`}
                placeholder="Your answer..."
              />
            )}
            
            {showResults && (
              <div className={`mt-6 p-6 rounded-2xl border ${isCorrect ? 'bg-green-100/50 border-green-200' : 'bg-amber-100/50 border-amber-200'}`}>
                <p className={`font-black mb-1 text-sm ${isCorrect ? 'text-green-800' : 'text-amber-800'}`}>
                   {isCorrect ? 'Quick Recall' : `Key Insight: ${q.topic}`}
                </p>
                {!isCorrect && <p className="text-slate-800 font-bold mb-2">The correct answer was: <span className="text-green-700">{q.answer}</span></p>}
                <p className="text-slate-600 text-sm italic">{q.explanation}</p>
              </div>
            )}
          </div>
        );
      })}
      
      <div className="flex gap-4">
        <button 
          onClick={() => {
            if (showResults) {
              setAnswers({});
              setShowResults(false);
            } else {
              setShowResults(true);
            }
          }} 
          className="flex-1 py-5 bg-indigo-600 text-white rounded-3xl font-black text-xl hover:bg-indigo-700 shadow-2xl transition-all active:scale-[0.98]"
        >
          {showResults ? "Retake Quiz" : "Grade Quiz"}
        </button>
      </div>
    </div>
  );
};

const ExplainContent: React.FC<{ explanation: string }> = ({ explanation }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleSpeak = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      const base64 = await speakExplanation(explanation);
      if (!base64) throw new Error("Audio generation failed");

      if (!audioContextRef.current) audioContextRef.current = new AudioContext();
      const ctx = audioContextRef.current;
      
      const bytes = atob(base64);
      const uint8 = new Uint8Array(bytes.length);
      for(let i=0; i<bytes.length; i++) uint8[i] = bytes.charCodeAt(i);
      
      const pcmData = new Int16Array(uint8.buffer);
      const buffer = ctx.createBuffer(1, pcmData.length, 24000);
      const channelData = buffer.getChannelData(0);
      for(let i=0; i<pcmData.length; i++) channelData[i] = pcmData[i] / 32768.0;
      
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      source.start();
    } catch (err) {
      alert("TTS Error: " + err);
      setIsPlaying(false);
    }
  };

  return (
    <div className="prose prose-indigo max-w-none">
      <div className="flex items-center justify-between mb-8">
        <div className="p-4 bg-orange-100 rounded-2xl border-l-8 border-orange-500">
          <p className="font-black text-orange-800 text-sm mb-1 uppercase tracking-widest">ELI5 Perspective</p>
          <p className="text-orange-700 text-sm">Complex logic made simple through analogies.</p>
        </div>
        <button 
          onClick={handleSpeak} 
          disabled={isPlaying}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all ${isPlaying ? 'bg-slate-100 text-slate-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
        >
          {isPlaying ? (
            <div className="flex gap-1">
              {[1,2,3].map(i => <div key={i} className="w-1 h-4 bg-indigo-400 animate-pulse" />)}
            </div>
          ) : (
            <><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" /></svg> Listen</>
          )}
        </button>
      </div>
      <div className="whitespace-pre-line text-slate-800 text-2xl font-bold leading-relaxed">{explanation}</div>
    </div>
  );
};

const StudyPlanContent: React.FC<{ plan: StudyPlan }> = ({ plan }) => {
  const [done, setDone] = useState<Record<string, boolean>>({});
  const total = plan.schedule.reduce((acc, d) => acc + d.tasks.length, 0);
  const completed = Object.values(done).filter(Boolean).length;
  const progress = Math.round((completed / total) * 100);

  return (
    <div>
      <div className="mb-10 border-b-4 border-slate-50 pb-8 flex justify-between items-end">
        <div>
          <h3 className="text-4xl font-black text-slate-900 mb-2">{plan.title}</h3>
          <span className="px-4 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-black uppercase">{plan.difficulty} Level</span>
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-slate-400 uppercase mb-1">Topic Mastery</p>
          <div className="w-32 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-sm font-black text-slate-800 mt-1">{progress}% Complete</p>
        </div>
      </div>
      <div className="space-y-6">
        {plan.schedule.map((day) => (
          <div key={day.day} className="p-8 bg-slate-50 rounded-3xl border-2 border-slate-100 hover:border-indigo-300 transition-all">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl">D{day.day}</div>
              <h5 className="text-2xl font-black text-slate-800">{day.focus}</h5>
            </div>
            <div className="grid gap-3">
              {day.tasks.map((task, ti) => {
                const key = `${day.day}-${ti}`;
                return (
                  <label key={ti} className="flex items-center gap-4 p-4 bg-white rounded-2xl border-2 border-transparent hover:border-indigo-100 cursor-pointer group">
                    <input type="checkbox" checked={done[key]} onChange={() => setDone(prev => ({ ...prev, [key]: !prev[key] }))} className="w-6 h-6 rounded-lg text-indigo-600 focus:ring-indigo-500" />
                    <span className={`text-lg font-bold transition-all ${done[key] ? 'text-slate-300 line-through' : 'text-slate-700'}`}>{task}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FlashcardsContent: React.FC<{ flashcards: Flashcard[] }> = ({ flashcards }) => {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 flex items-center gap-4">
        <div className="h-2 w-32 bg-slate-100 rounded-full"><div className="h-full bg-indigo-500 transition-all" style={{width: `${((idx+1)/flashcards.length)*100}%`}} /></div>
        <span className="text-xs font-black text-slate-400 uppercase">{idx + 1} / {flashcards.length}</span>
      </div>
      <div onClick={() => setFlipped(!flipped)} className="relative w-full max-w-md h-80 cursor-pointer [perspective:1000px] mb-12">
        <div className={`relative w-full h-full transition-all duration-500 [transform-style:preserve-3d] ${flipped ? '[transform:rotateY(180deg)]' : ''}`}>
          <div className="absolute inset-0 bg-indigo-600 rounded-[3rem] flex items-center justify-center p-10 text-center text-white shadow-2xl [backface-visibility:hidden]">
            <p className="text-2xl font-black leading-tight">{flashcards[idx].front}</p>
          </div>
          <div className="absolute inset-0 bg-white border-4 border-indigo-600 rounded-[3rem] flex items-center justify-center p-10 text-center text-slate-800 shadow-2xl [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <p className="text-2xl font-black leading-tight">{flashcards[idx].back}</p>
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <button onClick={() => { setFlipped(false); setIdx((idx - 1 + flashcards.length) % flashcards.length); }} className="p-4 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" /></svg></button>
        <button onClick={() => setFlipped(!flipped)} className="px-10 py-4 bg-indigo-50 text-indigo-600 font-black rounded-3xl hover:bg-indigo-100">Flip Card</button>
        <button onClick={() => { setFlipped(false); setIdx((idx + 1) % flashcards.length); }} className="p-4 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200"><svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg></button>
      </div>
    </div>
  );
};

export default ResultsView;
