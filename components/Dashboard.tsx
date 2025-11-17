import React, { useState, useRef } from 'react';
import { GenerationType } from '../types';
import { FileTextIcon } from './icons/FileTextIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { LoaderIcon } from './icons/LoaderIcon';
import { XIcon } from './icons/XIcon';

// Declare globals from CDN scripts to satisfy TypeScript
declare const pdfjsLib: any;
declare const mammoth: any;

interface DashboardProps {
  onGenerate: (type: GenerationType, content: string, options?: any) => void;
  initialContent: string;
  error: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ onGenerate, initialContent, error }) => {
  const [content, setContent] = useState(initialContent);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [summaryLength, setSummaryLength] = useState<'short' | 'medium' | 'long'>('medium');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setFileName(file.name);
    setContent('');
    setIsProcessingFile(true);

    try {
      if (file.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const typedArray = new Uint8Array(e.target.result as ArrayBuffer);
            if (typeof pdfjsLib === 'undefined') {
              throw new Error("pdf.js library is not loaded.");
            }
            // Configure the workerSrc for pdf.js
            pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
            
            const pdf = await pdfjsLib.getDocument(typedArray).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
            }
            setContent(fullText);
          } catch (pdfError) {
             console.error('Error parsing .pdf file:', pdfError);
             alert('Could not read the PDF file. It might be corrupted or protected.');
             setFileName(null);
          } finally {
             setIsProcessingFile(false);
          }
        };
        reader.readAsArrayBuffer(file);

      } else if (file.name.endsWith('.docx') || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            if (typeof mammoth === 'undefined') {
              throw new Error("mammoth.js library is not loaded.");
            }
            const result = await mammoth.extractRawText({ arrayBuffer: e.target.result as ArrayBuffer });
            setContent(result.value);
          } catch (mammothError) {
             console.error('Error parsing .docx file:', mammothError);
             alert('Could not read the Word document. The file might be corrupted or in an unsupported format.');
             setFileName(null);
          } finally {
             setIsProcessingFile(false);
          }
        };
        reader.readAsArrayBuffer(file);
      
      } else if (file.type === "text/plain" || file.name.endsWith('.md')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setContent(e.target?.result as string);
          setIsProcessingFile(false);
        };
        reader.readAsText(file);

      } else {
        alert("Unsupported file type. Please upload a .pdf, .docx, .txt, or .md file.");
        setFileName(null);
        setIsProcessingFile(false);
      }
    } catch (error) {
       console.error('Error processing file:', error);
       alert('An error occurred while trying to read the file.');
       setFileName(null);
       setIsProcessingFile(false);
    }
  };


  const handleGenerateClick = (type: GenerationType) => {
    if (!content.trim()) {
      alert("Please enter some text or upload a file first.");
      return;
    }
    onGenerate(type, content, { summaryLength });
  };
  
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  }

  const handleClearContent = () => {
    setContent('');
    setFileName(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-2">Let's Get Started</h2>
      <p className="text-slate-500 dark:text-slate-400 text-center mb-8">
        Upload your notes or paste your topic below.
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <strong className="font-bold">Oops! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label htmlFor="note-input" className="font-semibold mb-2">
              Paste your text here:
            </label>
            <div className="relative w-full h-64">
                <textarea
                  id="note-input"
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (fileName) setFileName(null); // Clear file name if user starts typing
                  }}
                  placeholder="Type or paste your study material..."
                  className="w-full h-full p-3 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  disabled={isProcessingFile}
                ></textarea>
                {content && !isProcessingFile && (
                    <button
                        onClick={handleClearContent}
                        className="absolute top-2.5 right-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full bg-slate-200/50 dark:bg-slate-600/50 hover:bg-slate-300/70 dark:hover:bg-slate-500/70 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        aria-label="Clear text"
                        title="Clear text"
                    >
                        <XIcon className="w-4 h-4" />
                    </button>
                )}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg text-center">
            {isProcessingFile ? (
              <>
                <LoaderIcon className="w-12 h-12 text-slate-400 mb-4 animate-spin" />
                <h3 className="font-semibold text-lg">Processing File...</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Please wait while we extract the text.
                </p>
              </>
            ) : (
              <>
                <FileTextIcon className="w-12 h-12 text-slate-400 mb-4" />
                <h3 className="font-semibold text-lg">Upload Notes</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Supports .pdf, .docx, .txt, and .md
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.docx,.txt,.md,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                />
                <button onClick={handleUploadClick} disabled={isProcessingFile} className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                    {fileName ? 'Change File' : 'Select File'}
                </button>
                {fileName && <p className="text-sm mt-2 text-slate-500 truncate w-full px-2" title={fileName}>{fileName}</p>}
              </>
            )}
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 dark:border-slate-700 pt-6">
            <h3 className="text-xl font-semibold text-center mb-4">Choose Your Magic Tool</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <button onClick={() => handleGenerateClick(GenerationType.Summary)} className="p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition flex items-center justify-center space-x-2">
                    <SparklesIcon className="w-5 h-5" /><span>Summary</span>
                </button>
                <button onClick={() => handleGenerateClick(GenerationType.Quiz)} className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition flex items-center justify-center space-x-2">
                    <SparklesIcon className="w-5 h-5" /><span>Quiz</span>
                </button>
                 <button onClick={() => handleGenerateClick(GenerationType.ELI5)} className="p-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-semibold transition flex items-center justify-center space-x-2">
                    <SparklesIcon className="w-5 h-5" /><span>ELI5</span>
                </button>
                <button onClick={() => handleGenerateClick(GenerationType.StudyPlan)} className="p-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-semibold transition flex items-center justify-center space-x-2">
                    <SparklesIcon className="w-5 h-5" /><span>Study Plan</span>
                </button>
                <button onClick={() => handleGenerateClick(GenerationType.Flashcards)} className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition flex items-center justify-center space-x-2">
                    <SparklesIcon className="w-5 h-5" /><span>Flashcards</span>
                </button>
            </div>
             <div className="flex items-center justify-center mt-6">
                <label htmlFor="summary-length" className="mr-3 font-medium">Summary Length:</label>
                <select id="summary-length" value={summaryLength} onChange={e => setSummaryLength(e.target.value as any)} className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="short">Short</option>
                    <option value="medium">Medium</option>
                    <option value="long">Long</option>
                </select>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;