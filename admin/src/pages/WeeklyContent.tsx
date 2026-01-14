import { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Trash2,
  BookOpen,
  Bell,
  Loader2,
  AlertCircle,
  FileText,
  MessageSquare,
} from 'lucide-react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import Layout from '../components/Layout';

interface Scripture {
  reference: string;
  text: string;
}

interface Snippet {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  snippet: string;
  scripture: Scripture;
}

interface WeeklyContentItem {
  id: string;
  weekId: string;
  weekTitle: string;
  snippets: Snippet[];
  snippetCount: number;
  createdAt: Timestamp;
  publishedAt: Timestamp;
}

export default function WeeklyContent() {
  const [content, setContent] = useState<WeeklyContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [expandedSnippets, setExpandedSnippets] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'weeklyContent'),
      orderBy('publishedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as WeeklyContentItem[];
      setContent(items);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'weeklyContent', id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  const toggleSnippet = (snippetId: string) => {
    setExpandedSnippets(prev => {
      const next = new Set(prev);
      if (next.has(snippetId)) {
        next.delete(snippetId);
      } else {
        next.add(snippetId);
      }
      return next;
    });
  };

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

  if (isLoading) {
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Published Content</h1>
          <p className="text-gray-600 mt-1">
            View and manage weekly content published to the mobile app
          </p>
        </div>

        {content.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500">No content published yet</h3>
            <p className="text-gray-400 mt-1">
              Go to "Process Doc" to create and publish weekly content
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {content.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {/* Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-mono text-sm">
                        {item.weekId}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.weekTitle}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          Published {formatDate(item.publishedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {item.snippetCount || item.snippets?.length || 0} snippets
                        </span>
                      </div>
                      {expandedId === item.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedId === item.id && (
                  <div className="border-t border-gray-200 p-4 space-y-4">
                    {/* Snippets List */}
                    {item.snippets && item.snippets.length > 0 ? (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          Snippets ({item.snippets.length})
                        </h4>
                        <div className="space-y-2">
                          {item.snippets.map((snippet, index) => (
                            <div
                              key={snippet.id || index}
                              className="border border-gray-200 rounded-lg overflow-hidden"
                            >
                              {/* Snippet Header */}
                              <div
                                className="p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => toggleSnippet(`${item.id}-${snippet.id}`)}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <span className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded">
                                      #{index + 1}
                                    </span>
                                    <div>
                                      <h5 className="font-medium text-gray-900 text-sm">
                                        {snippet.title}
                                      </h5>
                                      <p className="text-xs text-gray-500">{snippet.subtitle}</p>
                                    </div>
                                  </div>
                                  {expandedSnippets.has(`${item.id}-${snippet.id}`) ? (
                                    <ChevronUp className="w-4 h-4 text-gray-400" />
                                  ) : (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                  )}
                                </div>
                              </div>

                              {/* Snippet Details */}
                              {expandedSnippets.has(`${item.id}-${snippet.id}`) && (
                                <div className="p-3 space-y-3 bg-white">
                                  {/* Body (Lock Screen Message) */}
                                  <div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
                                      <Bell className="w-3 h-3" />
                                      Lock Screen Message
                                    </div>
                                    <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded border border-blue-100">
                                      {snippet.body}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {snippet.body?.length || 0}/100 characters
                                    </p>
                                  </div>

                                  {/* Snippet Content */}
                                  <div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
                                      <MessageSquare className="w-3 h-3" />
                                      Reading Content
                                    </div>
                                    <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-200 whitespace-pre-wrap">
                                      {snippet.snippet}
                                    </p>
                                  </div>

                                  {/* Scripture */}
                                  {snippet.scripture && (
                                    <div>
                                      <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
                                        <BookOpen className="w-3 h-3" />
                                        Scripture
                                      </div>
                                      <div className="bg-amber-50 p-2 rounded border border-amber-100">
                                        <p className="text-sm font-medium text-amber-800">
                                          {snippet.scripture.reference}
                                        </p>
                                        <p className="text-sm text-amber-700 italic mt-1">
                                          "{snippet.scripture.text}"
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                        <p>No snippets found in this content</p>
                      </div>
                    )}

                    {/* Delete Button */}
                    <div className="pt-4 border-t border-gray-200">
                      {deleteConfirm === item.id ? (
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-5 h-5 text-red-500" />
                          <span className="text-sm text-gray-600">Delete this content?</span>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                          >
                            Yes, Delete
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(item.id)}
                          className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Content
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
