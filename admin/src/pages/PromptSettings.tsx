import { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  RotateCcw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const DEFAULT_PROMPT = `Break this document into many small, digestible teaching snippets. Each snippet should be ONE standalone idea, thought, or takeaway.

Guidelines:
- Extract 30-60+ snippets from a typical document
- Each snippet covers ONE concept (not multiple)
- Go through the ENTIRE document - don't skip sections
- Focus on practical, applicable teachings

For each snippet return:
- title: Bold header, 3-5 words max (e.g., "Why Faith Matters")
- subtitle: Short preview hint (e.g., "Understanding the foundation")
- body: Lock screen message, MUST be under 100 characters, encouraging and intriguing
- snippet: 1-2 paragraphs of actual teaching content from the document
- scripture: A relevant Bible verse {reference, text} that supports this point

Make each snippet:
- Self-contained (makes sense on its own)
- Encouraging and practical
- Spiritually nourishing`;

export default function PromptSettings() {
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load prompt from Firebase
  useEffect(() => {
    const loadPrompt = async () => {
      try {
        const docRef = doc(db, 'adminSettings', 'prompt');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.content) {
            setPrompt(data.content);
          }
          if (data.updatedAt) {
            setLastSaved(data.updatedAt.toDate());
          }
        }
      } catch (error) {
        console.error('Error loading prompt:', error);
        setStatus({ type: 'error', message: 'Failed to load prompt settings' });
      } finally {
        setIsLoading(false);
      }
    };
    loadPrompt();
  }, []);

  // Save prompt to Firebase
  const handleSave = async () => {
    setIsSaving(true);
    setStatus(null);

    try {
      const docRef = doc(db, 'adminSettings', 'prompt');
      await setDoc(docRef, {
        content: prompt,
        updatedAt: Timestamp.now(),
      });
      setLastSaved(new Date());
      setStatus({ type: 'success', message: 'Prompt saved successfully!' });
      setTimeout(() => setStatus(null), 3000);
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to save prompt' });
    } finally {
      setIsSaving(false);
    }
  };

  // Reset to default
  const handleReset = () => {
    if (window.confirm('Reset prompt to default? This will not save automatically.')) {
      setPrompt(DEFAULT_PROMPT);
      setStatus({ type: 'success', message: 'Reset to default. Click Save to apply.' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          AI Prompt Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Customize how Claude processes documents into teaching snippets
        </p>
      </div>

      {/* Status Message */}
      {status && (
        <div
          className={`px-4 py-3 rounded-lg flex items-center gap-2 ${
            status.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          {status.message}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How this prompt is used:</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>This prompt is sent to Claude API when you process documents</li>
              <li>It tells Claude how to break documents into snippets</li>
              <li>Modify it to change the output format or style</li>
              <li>The document text is appended after this prompt</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Prompt Editor */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-medium text-gray-700">
            Claude Prompt Template
          </label>
          {lastSaved && (
            <span className="text-xs text-gray-400">
              Last saved: {lastSaved.toLocaleDateString()} {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={20}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent resize-y"
          placeholder="Enter your prompt template..."
        />

        <div className="flex items-center justify-between mt-4">
          <button
            onClick={handleReset}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" /> Reset to Default
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Prompt
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Expected Output Format</h3>
        <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
{`{
  "weekTitle": "Faith in Action Study",
  "snippets": [
    {
      "id": "1",
      "title": "Why Faith Matters",
      "subtitle": "Understanding the foundation",
      "body": "Faith is the foundation of our walk",
      "snippet": "Faith is not just belief, it is action...",
      "scripture": {
        "reference": "James 2:17",
        "text": "Faith without works is dead"
      }
    },
    // ... more snippets
  ]
}`}
        </pre>
      </div>
    </div>
  );
}
