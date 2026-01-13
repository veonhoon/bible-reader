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

interface WeeklyContentItem {
  id: string;
  weekId: string;
  title: string;
  summary: string;
  mainPoints: string[];
  scriptures: {
    reference: string;
    text: string;
    insight: string;
  }[];
  notifications: string[];
  createdAt: Timestamp;
  publishedAt: Timestamp;
}

export default function WeeklyContent() {
  const [content, setContent] = useState<WeeklyContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'weeklyContent'),
      orderBy('createdAt', 'desc')
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
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
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Published {formatDate(item.publishedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {item.scriptures?.length || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bell className="w-4 h-4" />
                        {item.notifications?.length || 0}
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
                  {/* Summary */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Summary</h4>
                    <p className="text-gray-600">{item.summary}</p>
                  </div>

                  {/* Main Points */}
                  {item.mainPoints && item.mainPoints.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Main Points</h4>
                      <ul className="space-y-1">
                        {item.mainPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-600">
                            <span className="text-primary font-medium">{index + 1}.</span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Scriptures */}
                  {item.scriptures && item.scriptures.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Scriptures</h4>
                      <div className="space-y-3">
                        {item.scriptures.map((scripture, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                          >
                            <p className="font-medium text-primary text-sm">
                              {scripture.reference}
                            </p>
                            <p className="text-gray-600 text-sm mt-1 italic">
                              "{scripture.text}"
                            </p>
                            {scripture.insight && (
                              <p className="text-gray-500 text-sm mt-2">
                                {scripture.insight}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notifications */}
                  {item.notifications && item.notifications.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Push Notifications
                      </h4>
                      <div className="space-y-2">
                        {item.notifications.map((notification, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm"
                          >
                            <Bell className="w-4 h-4 flex-shrink-0" />
                            {notification}
                          </div>
                        ))}
                      </div>
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
  );
}
