import { useState, useEffect, useCallback } from 'react';
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
  History,
  Clock,
  FileCheck,
  Copy,
  FileJson,
  ExternalLink,
} from 'lucide-react';
import { doc, setDoc, getDoc, Timestamp, collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { parseDocument } from '../services/documentParser';
import { analyzeDocument, WeeklyContentOutput, Snippet } from '../services/claudeService';
import SnippetEditor from '../components/SnippetEditor';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';

// Document history interface
interface DocumentHistory {
  id: string;
  fileName: string;
  weekTitle: string;
  snippetCount: number;
  weekId: string;
  processedAt: Timestamp;
  publishedAt: Timestamp;
}

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
  const [isParsing, setIsParsing] = useState(false);
  const [output, setOutput] = useState<WeeklyContentOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showRawText, setShowRawText] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [documentHistory, setDocumentHistory] = useState<DocumentHistory[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);

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

  // Load document history from Firebase
  useEffect(() => {
    const q = query(
      collection(db, 'documentHistory'),
      orderBy('processedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DocumentHistory[];
      setDocumentHistory(history);
    });

    return () => unsubscribe();
  }, []);

  // Process uploaded file
  const processFile = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setOutput(null);
    setIsParsing(true);

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
    setIsParsing(false);
  }, []);

  // Handle file input change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    await processFile(selectedFile);
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    // Validate file type
    const fileName = droppedFile.name.toLowerCase();
    if (!fileName.endsWith('.pdf') && !fileName.endsWith('.docx') && !fileName.endsWith('.doc')) {
      setError('Please upload a PDF or DOCX file');
      return;
    }

    await processFile(droppedFile);
  }, [processFile]);

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
      const timestamp = Timestamp.now();

      const weeklyContentRef = doc(db, 'weeklyContent', weekId);
      await setDoc(weeklyContentRef, {
        weekTitle: output.weekTitle,
        snippets: output.snippets,
        snippetCount: output.snippets.length,
        createdAt: timestamp,
        publishedAt: timestamp,
        weekId,
      });

      // Save to document history
      await addDoc(collection(db, 'documentHistory'), {
        fileName: file?.name || 'Unknown document',
        weekTitle: output.weekTitle,
        snippetCount: output.snippets.length,
        weekId,
        processedAt: timestamp,
        publishedAt: timestamp,
      });

      setSuccess(`Saved ${output.snippets.length} snippets as ${weekId}!`);
      setTimeout(() => setSuccess(null), 5000);

      // Clear the form after successful save
      setFile(null);
      setExtractedText('');
      setOutput(null);
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

  // Format timestamp for display
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'Unknown';
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Update week title
  const updateWeekTitle = (value: string) => {
    if (output) setOutput({ ...output, weekTitle: value });
  };

  // Update snippets
  const updateSnippets = (snippets: Snippet[]) => {
    if (output) setOutput({ ...output, snippets });
  };

  // Generate the full prompt for claude.ai
  const generateFullPrompt = () => {
    return `${customPrompt}

Here is the document to analyze and break into snippets:

---
${extractedText}
---

IMPORTANT: Respond with ONLY valid JSON in this exact format:
{
  "weekTitle": "Short title for this study",
  "snippets": [
    {
      "id": "1",
      "title": "Short Header (3-5 words)",
      "subtitle": "Preview hint text",
      "body": "Lock screen message under 100 chars",
      "snippet": "The actual teaching content - 1-2 paragraphs",
      "scripture": {
        "reference": "John 3:16",
        "text": "For God so loved the world..."
      }
    }
  ]
}

Extract 30-60+ snippets. Each snippet should be ONE teaching point. NO markdown, NO code blocks - ONLY the raw JSON.`;
  };

  // Copy prompt to clipboard for claude.ai
  const handleCopyPrompt = async () => {
    if (!extractedText) {
      setError('Please upload a document first');
      return;
    }

    const fullPrompt = generateFullPrompt();
    try {
      await navigator.clipboard.writeText(fullPrompt);
      setCopiedPrompt(true);
      setSuccess('Prompt copied! Paste it into claude.ai');
      setTimeout(() => {
        setCopiedPrompt(false);
        setSuccess(null);
      }, 3000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  };

  // Import JSON from claude.ai response
  const handleImportJson = () => {
    if (!importJson.trim()) {
      setError('Please paste the JSON response from claude.ai');
      return;
    }

    try {
      // Clean up the JSON string
      let jsonStr = importJson.trim();

      // Remove markdown code blocks if present
      if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.slice(7);
      } else if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.slice(3);
      }
      if (jsonStr.endsWith('```')) {
        jsonStr = jsonStr.slice(0, -3);
      }
      jsonStr = jsonStr.trim();

      // Find JSON object in string
      if (!jsonStr.startsWith('{')) {
        const jsonStart = jsonStr.indexOf('{');
        const jsonEnd = jsonStr.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          jsonStr = jsonStr.substring(jsonStart, jsonEnd + 1);
        }
      }

      const parsed = JSON.parse(jsonStr) as WeeklyContentOutput;

      // Validate required fields
      if (!parsed.weekTitle || !parsed.snippets || !Array.isArray(parsed.snippets)) {
        setError('Invalid JSON: missing weekTitle or snippets array');
        return;
      }

      // Ensure each snippet has an id
      parsed.snippets = parsed.snippets.map((s, i) => ({
        ...s,
        id: s.id || String(i + 1),
        isScheduled: false,
      }));

      setOutput(parsed);
      setShowImportModal(false);
      setImportJson('');
      setSuccess(`Imported ${parsed.snippets.length} snippets successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(`Failed to parse JSON: ${err instanceof Error ? err.message : 'Invalid format'}`);
    }
  };

  if (isLoadingSettings) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
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
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragging
                ? 'border-primary bg-primary/10'
                : 'border-gray-300 hover:border-primary hover:bg-primary/5'
            }`}
          >
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileChange}
              className="hidden"
            />
            {isParsing ? (
              <>
                <Loader2 className="w-12 h-12 text-primary mx-auto mb-3 animate-spin" />
                <p className="text-gray-600">Parsing document...</p>
              </>
            ) : (
              <>
                <FileText className={`w-12 h-12 mx-auto mb-3 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
                {file ? (
                  <p className="text-gray-900 font-medium">{file.name}</p>
                ) : (
                  <>
                    <p className="text-gray-600">
                      {isDragging ? 'Drop your file here' : 'Drag & drop or click to upload'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">PDF or DOCX files supported</p>
                  </>
                )}
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

        {/* Process Buttons */}
        <div className="mt-4 space-y-3">
          {/* Option 1: Use claude.ai (Free with Max plan) */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <ExternalLink className="w-4 h-4" />
              Option 1: Use claude.ai (Free with your Max plan)
            </h3>
            <p className="text-sm text-blue-700 mb-3">
              Copy the prompt, paste it into claude.ai, then import the JSON response.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleCopyPrompt}
                disabled={!extractedText}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {copiedPrompt ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Prompt
                  </>
                )}
              </button>
              <a
                href="https://claude.ai/new"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-100 text-blue-700 py-2 px-4 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-200 transition-colors"
              >
                Open claude.ai
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={() => setShowImportModal(true)}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
              >
                <FileJson className="w-4 h-4" />
                Import JSON
              </button>
            </div>
          </div>

          {/* Option 2: Use API (Costs money) */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Option 2: Use API (Costs ~$0.40 per document)
            </h3>
            <button
              onClick={handleProcess}
              disabled={!extractedText || isProcessing}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Extracting snippets with Claude API...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Process with API
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Import JSON Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileJson className="w-5 h-5 text-primary" />
                Import JSON from claude.ai
              </h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportJson('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-3">
                Paste the JSON response from claude.ai below. It should start with <code className="bg-gray-100 px-1 rounded">{"{"}</code> and contain <code className="bg-gray-100 px-1 rounded">weekTitle</code> and <code className="bg-gray-100 px-1 rounded">snippets</code>.
              </p>
              <textarea
                value={importJson}
                onChange={(e) => setImportJson(e.target.value)}
                placeholder='{"weekTitle": "...", "snippets": [...]}'
                className="w-full h-64 px-4 py-3 border border-gray-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportJson('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleImportJson}
                className="bg-primary text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Import Snippets
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Document History Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Document History
        </h2>

        {documentHistory.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No documents processed yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Your processed documents will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {documentHistory.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors"
              >
                <div className="bg-primary/10 p-3 rounded-lg">
                  <FileCheck className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {item.fileName}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {item.weekTitle}
                  </p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(item.processedAt)}
                    </span>
                    <span className="text-xs text-primary font-medium">
                      {item.weekId}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {item.snippetCount} snippets
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
}
