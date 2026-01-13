import { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Search,
  Eye,
  Bell,
  BookMarked,
} from 'lucide-react';
import { Snippet } from '../services/claudeService';

interface SnippetEditorProps {
  snippets: Snippet[];
  onChange: (snippets: Snippet[]) => void;
}

// iOS-style notification preview
function NotificationPreview({ snippet }: { snippet: Snippet }) {
  return (
    <div className="bg-gray-100 rounded-2xl p-1">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg">📖</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-semibold text-gray-900 text-sm truncate">
                {snippet.title || 'Bible Teacher'}
              </span>
              <span className="text-xs text-gray-400 ml-2 flex-shrink-0">now</span>
            </div>
            {snippet.subtitle && (
              <p className="text-sm text-gray-600 truncate">{snippet.subtitle}</p>
            )}
            <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
              {snippet.body || 'Notification message preview'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Detail view preview (what user sees after tapping notification)
function DetailPreview({ snippet }: { snippet: Snippet }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-bold text-gray-900 text-lg">{snippet.title || 'Title'}</h3>
        {snippet.subtitle && (
          <p className="text-gray-500 text-sm mt-1">{snippet.subtitle}</p>
        )}
      </div>
      <div className="p-4">
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          {snippet.snippet || 'The teaching content will appear here...'}
        </p>
      </div>
      {snippet.scripture?.reference && (
        <div className="p-4 bg-blue-50 border-t border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <BookMarked className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-900">{snippet.scripture.reference}</span>
          </div>
          <p className="text-blue-800 italic text-sm">
            "{snippet.scripture.text || 'Scripture text...'}"
          </p>
          <button className="mt-3 text-blue-600 text-sm font-medium hover:underline">
            Read Full Scripture →
          </button>
        </div>
      )}
    </div>
  );
}

// Single snippet card
function SnippetCard({
  snippet,
  index,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  totalCount,
}: {
  snippet: Snippet;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (field: keyof Snippet | 'scripture.reference' | 'scripture.text', value: string) => void;
  onDelete: () => void;
  totalCount: number;
}) {
  const [previewMode, setPreviewMode] = useState<'notification' | 'detail'>('notification');

  const handleFieldUpdate = (field: string, value: string) => {
    onUpdate(field as keyof Snippet | 'scripture.reference' | 'scripture.text', value);
  };

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      isExpanded ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Collapsed Header */}
      <div
        className="p-4 cursor-pointer flex items-center gap-3"
        onClick={onToggle}
      >
        <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-gray-900 truncate">
            {snippet.title || `Snippet ${index + 1}`}
          </h4>
          <p className="text-sm text-gray-500 truncate">{snippet.body || 'No preview text'}</p>
        </div>
        <div className="flex items-center gap-2">
          {snippet.scripture?.reference && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {snippet.scripture.reference}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
            {/* Left: Editor */}
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Title (Bold Header)
                </label>
                <input
                  type="text"
                  value={snippet.title}
                  onChange={(e) => handleFieldUpdate('title', e.target.value)}
                  placeholder="Short title (3-5 words)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Subtitle (Preview Hint)
                </label>
                <input
                  type="text"
                  value={snippet.subtitle}
                  onChange={(e) => handleFieldUpdate('subtitle', e.target.value)}
                  placeholder="Short hint text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Body (Lock Screen) */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Lock Screen Message (under 100 chars)
                </label>
                <input
                  type="text"
                  value={snippet.body}
                  onChange={(e) => handleFieldUpdate('body', e.target.value)}
                  placeholder="Brief, intriguing message..."
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <span className={`text-xs ${snippet.body?.length > 100 ? 'text-red-500' : 'text-gray-400'}`}>
                  {snippet.body?.length || 0}/100
                </span>
              </div>

              {/* Snippet Content */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Teaching Content (1-2 paragraphs)
                </label>
                <textarea
                  value={snippet.snippet}
                  onChange={(e) => handleFieldUpdate('snippet', e.target.value)}
                  placeholder="The main teaching point that users will read..."
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>

              {/* Scripture */}
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
                <label className="block text-xs font-medium text-gray-500 mb-2">
                  Scripture Reference
                </label>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <input
                    type="text"
                    value={snippet.scripture?.reference || ''}
                    onChange={(e) => handleFieldUpdate('scripture.reference', e.target.value)}
                    placeholder="John 3:16"
                    className="col-span-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <textarea
                  value={snippet.scripture?.text || ''}
                  onChange={(e) => handleFieldUpdate('scripture.text', e.target.value)}
                  placeholder="Scripture text..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                />
              </div>

              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                disabled={totalCount <= 1}
                className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 className="w-4 h-4" /> Delete Snippet
              </button>
            </div>

            {/* Right: Preview */}
            <div className="space-y-4">
              {/* Preview Toggle */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setPreviewMode('notification')}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    previewMode === 'notification'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Bell className="w-4 h-4" /> Notification
                </button>
                <button
                  onClick={() => setPreviewMode('detail')}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                    previewMode === 'detail'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Eye className="w-4 h-4" /> Detail View
                </button>
              </div>

              {/* Preview Content */}
              {previewMode === 'notification' ? (
                <div className="bg-gray-900 rounded-[2rem] p-3 shadow-xl">
                  <div className="bg-gray-100 rounded-[1.5rem] overflow-hidden">
                    <div className="bg-gray-200 px-6 py-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-600">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-4 h-2 bg-gray-400 rounded-sm"></div>
                        <div className="w-6 h-3 bg-gray-400 rounded-sm"></div>
                      </div>
                    </div>
                    <div className="p-4 min-h-[180px] flex flex-col justify-center">
                      <NotificationPreview snippet={snippet} />
                    </div>
                    <div className="pb-2 flex justify-center">
                      <div className="w-32 h-1 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                </div>
              ) : (
                <DetailPreview snippet={snippet} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SnippetEditor({ snippets, onChange }: SnippetEditorProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter snippets by search
  const filteredSnippets = snippets.filter((s) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      s.title?.toLowerCase().includes(query) ||
      s.body?.toLowerCase().includes(query) ||
      s.snippet?.toLowerCase().includes(query) ||
      s.scripture?.reference?.toLowerCase().includes(query)
    );
  });

  // Update a snippet field
  const updateSnippet = (index: number, field: string, value: string) => {
    const updated = [...snippets];
    const actualIndex = snippets.findIndex((s) => s.id === filteredSnippets[index].id);

    if (field.startsWith('scripture.')) {
      const scriptureField = field.split('.')[1] as 'reference' | 'text';
      updated[actualIndex] = {
        ...updated[actualIndex],
        scripture: {
          ...updated[actualIndex].scripture,
          [scriptureField]: value,
        },
      };
    } else {
      updated[actualIndex] = { ...updated[actualIndex], [field]: value };
    }

    onChange(updated);
  };

  // Delete a snippet
  const deleteSnippet = (index: number) => {
    if (snippets.length <= 1) return;
    const actualIndex = snippets.findIndex((s) => s.id === filteredSnippets[index].id);
    const updated = snippets.filter((_, i) => i !== actualIndex);
    onChange(updated);
    if (expandedIndex === index) {
      setExpandedIndex(null);
    }
  };

  // Add a new snippet
  const addSnippet = () => {
    const newSnippet: Snippet = {
      id: String(snippets.length + 1),
      title: '',
      subtitle: '',
      body: '',
      snippet: '',
      scripture: { reference: '', text: '' },
    };
    onChange([...snippets, newSnippet]);
    setExpandedIndex(snippets.length);
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-gray-900">
            Teaching Snippets ({snippets.length})
          </h3>
        </div>
        <button
          onClick={addSnippet}
          className="text-primary hover:text-primary/80 flex items-center gap-1 text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Add Snippet
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search snippets..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      {/* Snippet List */}
      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
        {filteredSnippets.map((snippet, index) => (
          <SnippetCard
            key={snippet.id}
            snippet={snippet}
            index={index}
            isExpanded={expandedIndex === index}
            onToggle={() => setExpandedIndex(expandedIndex === index ? null : index)}
            onUpdate={(field, value) => updateSnippet(index, field, value)}
            onDelete={() => deleteSnippet(index)}
            totalCount={snippets.length}
          />
        ))}

        {filteredSnippets.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'No snippets match your search' : 'No snippets yet'}
          </div>
        )}
      </div>
    </div>
  );
}
