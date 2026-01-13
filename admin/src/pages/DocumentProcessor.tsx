import { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Settings,
} from 'lucide-react';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { parseDocument } from '../services/documentParser';
import { analyzeDocument, WeeklyContentOutput, Snippet } from '../services/claudeService';
import SnippetEditor from '../components/SnippetEditor';
import { Link } from 'react-router-dom';

const DEFAULT_PROMPT = `Break this document into many small, digestible teaching snippets. Each snippet should be ONE standalone idea, thought, or takeaway.

Guidelines:
- Extract 30-60+ snippets from a typical document
- Each snippet covers ONE concept (not multiple)
- Go through the ENTIRE document - don't skip sections
- Focus on practical, applicable teachings

For each snippet return:
- title: Bold header, 3-5 words max
- subtitle: Short preview hint
- body: Lock screen message, MUST be under 100 characters
- snippet: 1-2 paragraphs of actual teaching content
- scripture: A relevant Bible verse {reference, text}`;

export default function DocumentProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [output, setOutput] = useState<WeeklyContentOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showRawText, setShowRawText] = useState(false);

  // Load prompt from Firebase
  useEffect(() => {
    const loadPrompt = async () => {
      try {
        const docRef = doc(db, 'adminSettings', 'prompt');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.content) {
            setCustomPrompt(data.content);
          } else {
            setCustomPrompt(DEFAULT_PROMPT);
          }
        } else {
          setCustomPrompt(DEFAULT_PROMPT);
        }
      } catch (err) {
        console.error('Error loading prompt:', err);
        setCustomPrompt(DEFAULT_PROMPT);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    loadPrompt();
  }, []);

  // Handle file upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);
    setOutput(null);

    // Parse the document
    const result = await parseDocument(selectedFile);
    if (result.success && result.text) {
      setExtractedText(result.text);
      setSuccess(`Document parsed successfully${result.pageCount ? ` (${result.pageCount} pages)` : ''}`);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error || 'Failed to parse document');
      setExtractedText('');
    }
  };

  // Process document with Claude
  const handleProcess = async () => {
    if (!extractedText) {
      setError('Please upload a document first');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const result = await analyzeDocument(extractedText, customPrompt);

    if (result.success && result.data) {
      setOutput(result.data);
      setSuccess(`Extracted ${result.data.snippets.length} snippets!`);
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.error || 'Failed to analyze document');
      if (result.rawResponse) {
        console.log('Raw response:', result.rawResponse);
      }
    }

    setIsProcessing(false);
  };

  // Save to Firebase
  const handleSave = async () => {
    if (!output) {
      setError('No content to save');
      return;
    }

    if (output.snippets.length === 0) {
      setError('No snippets to save');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // Generate a week ID based on current date
      const now = new Date();
      const weekId = `${now.getFullYear()}-W${String(getWeekNumber(now)).padStart(2, '0')}`;

      const weeklyContentRef = doc(db, 'weeklyContent', weekId);
      await setDoc(weeklyContentRef, {
        weekTitle: output.weekTitle,
        snippets: output.snippets,
        snippetCount: output.snippets.length,
        createdAt: Timestamp.now(),
        publishedAt: Timestamp.now(),
        weekId,
      });

      setSuccess(`Saved ${output.snippets.length} snippets as ${weekId}!`);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }

    setIsSaving(false);
  };

  // Get ISO week number
  const getWeekNumber = (date: Date): number => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  };

  // Update week title
  const updateWeekTitle = (value: string) => {
    if (output) setOutput({ ...output, weekTitle: value });
  };

  // Update snippets
  const updateSnippets = (snippets: Snippet[]) => {
    if (output) setOutput({ ...output, snippets });
  };

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Processor</h1>
          <p className="text-gray-600 mt-1">
            Upload a document, extract teaching snippets with AI
          </p>
        </div>
        <Link
          to="/prompt-settings"
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
        >
          <Settings className="w-4 h-4" /> Edit AI Prompt
        </Link>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-primary" />
          Upload Document
        </h2>

        <label className="block">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary hover:bg-primary/5 transition-colors cursor-pointer">
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileChange}
              className="hidden"
            />
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            {file ? (
              <p className="text-gray-900 font-medium">{file.name}</p>
            ) : (
              <>
                <p className="text-gray-600">Click to upload PDF or DOCX</p>
                <p className="text-sm text-gray-400 mt-1">Bible study documents, sermon notes, etc.</p>
              </>
            )}
          </div>
        </label>

        {extractedText && (
          <div className="mt-4">
            <button
              onClick={() => setShowRawText(!showRawText)}
              className="text-sm text-primary hover:underline"
            >
              {showRawText ? 'Hide' : 'Show'} extracted text ({extractedText.length} chars)
            </button>
            {showRawText && (
              <pre className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 max-h-48 overflow-auto whitespace-pre-wrap">
                {extractedText}
              </pre>
            )}
          </div>
        )}

        {/* Process Button */}
        <button
          onClick={handleProcess}
          disabled={!extractedText || isProcessing}
          className="mt-4 w-full bg-primary text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Extracting snippets with Claude...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Process Document
            </>
          )}
        </button>
      </div>

      {/* Output Section */}
      {output ? (
        <div className="space-y-6">
          {/* Week Title */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Week Title
            </label>
            <input
              type="text"
              value={output.weekTitle}
              onChange={(e) => updateWeekTitle(e.target.value)}
              placeholder="e.g., Faith in Action Study"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Snippets Editor */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <SnippetEditor
              snippets={output.snippets}
              onChange={updateSnippets}
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-green-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving to Firebase...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Publish {output.snippets.length} Snippets
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-12 text-center">
          <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500">No content yet</h3>
          <p className="text-gray-400 mt-1">
            Upload a document and click "Process Document" to extract snippets
          </p>
        </div>
      )}
    </div>
  );
}
