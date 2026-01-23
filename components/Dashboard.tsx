
import React, { useState, useRef, useEffect } from 'react';
import { FeatureType } from '../types';
import { scanNotesOCR } from '../services/geminiService';

interface DashboardProps {
  onGenerate: (type: FeatureType, text: string) => void;
  isLoading: boolean;
  initialText: string;
  onTextChange: (text: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onGenerate, isLoading, initialText, onTextChange }) => {
  const [text, setText] = useState(initialText);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [activeBtn, setActiveBtn] = useState<FeatureType | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync internal text with parent if prop changes externally (e.g. from Clear in Navigation or History selection)
  useEffect(() => {
    setText(initialText);
  }, [initialText]);

  const updateText = (newText: string) => {
    setText(newText);
    onTextChange(newText);
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      alert("Could not access camera: " + err);
      setShowCamera(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    
    const base64 = canvasRef.current.toDataURL('image/jpeg').split(',')[1];
    
    // Stop stream
    const stream = videoRef.current.srcObject as MediaStream;
    stream.getTracks().forEach(t => t.stop());
    setShowCamera(false);
    
    setIsProcessingFile(true);
    try {
      const extracted = await scanNotesOCR(base64);
      updateText(text + (text ? "\n\n" : "") + extracted);
    } catch (err) {
      alert("OCR failed: " + err);
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        // @ts-ignore
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          fullText += content.items.map((item: any) => item.str).join(' ') + '\n';
        }
        updateText(fullText);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => updateText(event.target?.result as string);
        reader.readAsText(file);
      }
    } catch (err) {
      alert("Error processing file.");
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleActionClick = (id: FeatureType) => {
    setActiveBtn(id);
    onGenerate(id, text);
  };

  const actions: { id: FeatureType; label: string; icon: string; color: string }[] = [
    { id: 'summary', label: 'Summarize', icon: '📝', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { id: 'quiz', label: 'Generate Quiz', icon: '🧠', color: 'bg-purple-50 text-purple-600 border-purple-200' },
    { id: 'explain', label: 'ELI5 Explanation', icon: '👶', color: 'bg-orange-50 text-orange-600 border-orange-200' },
    { id: 'plan', label: 'Study Plan', icon: '📅', color: 'bg-green-50 text-green-600 border-green-200' },
    { id: 'flashcards', label: 'Flashcards', icon: '📇', color: 'bg-pink-50 text-pink-600 border-pink-200' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 pt-24">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Workspace</h2>
            <p className="text-slate-500">Transform your notes into study magic.</p>
          </div>
          <button 
            onClick={() => updateText('')}
            className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
          >
            Clear Text
          </button>
        </div>

        <div className="p-8">
          <textarea
            value={text}
            onChange={(e) => updateText(e.target.value)}
            placeholder="Paste notes, upload a PDF, or scan from your camera..."
            className="w-full h-72 p-6 rounded-2xl bg-slate-50 border-2 border-slate-100 focus:border-indigo-500 focus:ring-0 transition-all resize-none text-slate-700 leading-relaxed mb-6 font-medium"
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-3">
              <label className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-slate-200 text-slate-500 cursor-pointer hover:border-indigo-400 hover:text-indigo-500 transition-all">
                <input type="file" className="hidden" accept=".txt,.pdf" onChange={handleFileUpload} />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span>Upload PDF</span>
              </label>
              <button 
                onClick={startCamera}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-slate-200 text-slate-500 hover:border-indigo-400 hover:text-indigo-500 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Scan Notes</span>
              </button>
            </div>
            <span className="text-sm text-slate-400 font-bold">{text.length.toLocaleString()} chars</span>
          </div>
        </div>

        <div className="bg-slate-50 p-8 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {actions.map((action) => {
            const isGenerating = isLoading && activeBtn === action.id;
            return (
              <button
                key={action.id}
                disabled={isLoading || !text.trim() || isProcessingFile}
                onClick={() => handleActionClick(action.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all active:scale-95 group disabled:opacity-50 relative overflow-hidden ${action.color} ${!text.trim() ? '' : 'hover:-translate-y-1 hover:shadow-lg hover:border-indigo-400'}`}
              >
                {isGenerating && (
                  <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
                    <svg className="animate-spin h-6 w-6 text-indigo-600" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
                <span className={`text-2xl mb-2 transition-transform ${isGenerating ? 'opacity-0' : 'group-hover:rotate-12'}`}>{action.icon}</span>
                <span className={`text-xs font-black uppercase tracking-widest text-center ${isGenerating ? 'opacity-0' : ''}`}>{action.label}</span>
              </button>
            );
          })}
        </div>

        {/* Camera Overlay */}
        {showCamera && (
          <div className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center p-4">
            <video ref={videoRef} autoPlay playsInline className="w-full max-w-md rounded-2xl mb-6 shadow-2xl" />
            <div className="flex gap-4">
              <button onClick={() => setShowCamera(false)} className="px-6 py-3 bg-white/20 text-white rounded-xl font-bold">Cancel</button>
              <button onClick={capturePhoto} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-xl">Capture & OCR</button>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}
      </div>

      {isProcessingFile && (
        <div className="mt-8 text-center text-indigo-600 font-black animate-pulse flex items-center justify-center gap-2">
           <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
           Extracting text from image...
        </div>
      )}
    </div>
  );
};

export default Dashboard;
