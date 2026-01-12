import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import Layout from '../components/Layout';
import { Plus, Edit2, Trash2, Star, X } from 'lucide-react';

interface Scripture {
  id: string;
  date: Date;
  verse: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  text: string;
  message?: string;
  isFeatured: boolean;
  createdAt: Date;
}

// Book name to ID mapping for Bolls.life API
const BIBLE_BOOKS: { name: string; id: string }[] = [
  { name: 'Genesis', id: '1' }, { name: 'Exodus', id: '2' }, { name: 'Leviticus', id: '3' },
  { name: 'Numbers', id: '4' }, { name: 'Deuteronomy', id: '5' }, { name: 'Joshua', id: '6' },
  { name: 'Judges', id: '7' }, { name: 'Ruth', id: '8' }, { name: '1 Samuel', id: '9' },
  { name: '2 Samuel', id: '10' }, { name: '1 Kings', id: '11' }, { name: '2 Kings', id: '12' },
  { name: '1 Chronicles', id: '13' }, { name: '2 Chronicles', id: '14' }, { name: 'Ezra', id: '15' },
  { name: 'Nehemiah', id: '16' }, { name: 'Esther', id: '17' }, { name: 'Job', id: '18' },
  { name: 'Psalms', id: '19' }, { name: 'Proverbs', id: '20' }, { name: 'Ecclesiastes', id: '21' },
  { name: 'Song of Solomon', id: '22' }, { name: 'Isaiah', id: '23' }, { name: 'Jeremiah', id: '24' },
  { name: 'Lamentations', id: '25' }, { name: 'Ezekiel', id: '26' }, { name: 'Daniel', id: '27' },
  { name: 'Hosea', id: '28' }, { name: 'Joel', id: '29' }, { name: 'Amos', id: '30' },
  { name: 'Obadiah', id: '31' }, { name: 'Jonah', id: '32' }, { name: 'Micah', id: '33' },
  { name: 'Nahum', id: '34' }, { name: 'Habakkuk', id: '35' }, { name: 'Zephaniah', id: '36' },
  { name: 'Haggai', id: '37' }, { name: 'Zechariah', id: '38' }, { name: 'Malachi', id: '39' },
  { name: 'Matthew', id: '40' }, { name: 'Mark', id: '41' }, { name: 'Luke', id: '42' },
  { name: 'John', id: '43' }, { name: 'Acts', id: '44' }, { name: 'Romans', id: '45' },
  { name: '1 Corinthians', id: '46' }, { name: '2 Corinthians', id: '47' }, { name: 'Galatians', id: '48' },
  { name: 'Ephesians', id: '49' }, { name: 'Philippians', id: '50' }, { name: 'Colossians', id: '51' },
  { name: '1 Thessalonians', id: '52' }, { name: '2 Thessalonians', id: '53' }, { name: '1 Timothy', id: '54' },
  { name: '2 Timothy', id: '55' }, { name: 'Titus', id: '56' }, { name: 'Philemon', id: '57' },
  { name: 'Hebrews', id: '58' }, { name: 'James', id: '59' }, { name: '1 Peter', id: '60' },
  { name: '2 Peter', id: '61' }, { name: '1 John', id: '62' }, { name: '2 John', id: '63' },
  { name: '3 John', id: '64' }, { name: 'Jude', id: '65' }, { name: 'Revelation', id: '66' },
];

const getBookId = (bookName: string): string => {
  const book = BIBLE_BOOKS.find((b) => b.name === bookName);
  return book?.id || '1';
};

export default function Scriptures() {
  const [scriptures, setScriptures] = useState<Scripture[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingScripture, setEditingScripture] = useState<Scripture | null>(null);
  const [formData, setFormData] = useState({
    book: '',
    chapter: 1,
    verseStart: 1,
    verseEnd: 1,
    text: '',
    message: '',
    isFeatured: false,
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchScriptures();
  }, []);

  const fetchScriptures = async () => {
    try {
      const q = query(collection(db, 'scriptures'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
      })) as Scripture[];
      setScriptures(data);
    } catch (error) {
      console.error('Error fetching scriptures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const verse = `${formData.book} ${formData.chapter}:${formData.verseStart}${
      formData.verseEnd > formData.verseStart ? `-${formData.verseEnd}` : ''
    }`;

    const scriptureData = {
      book: formData.book,
      bookId: getBookId(formData.book),
      chapter: formData.chapter,
      verseStart: formData.verseStart,
      verseEnd: formData.verseEnd,
      verse,
      text: formData.text,
      message: formData.message,
      isFeatured: formData.isFeatured,
      date: Timestamp.fromDate(new Date(formData.date)),
      updatedAt: Timestamp.now(),
    };

    try {
      if (editingScripture) {
        await updateDoc(doc(db, 'scriptures', editingScripture.id), scriptureData);
      } else {
        await addDoc(collection(db, 'scriptures'), {
          ...scriptureData,
          createdAt: Timestamp.now(),
        });
      }
      setShowModal(false);
      resetForm();
      fetchScriptures();
    } catch (error) {
      console.error('Error saving scripture:', error);
    }
  };

  const handleEdit = (scripture: Scripture) => {
    setEditingScripture(scripture);
    setFormData({
      book: scripture.book,
      chapter: scripture.chapter,
      verseStart: scripture.verseStart,
      verseEnd: scripture.verseEnd,
      text: scripture.text,
      message: scripture.message || '',
      isFeatured: scripture.isFeatured,
      date: scripture.date.toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scripture?')) return;

    try {
      await deleteDoc(doc(db, 'scriptures', id));
      fetchScriptures();
    } catch (error) {
      console.error('Error deleting scripture:', error);
    }
  };

  const toggleFeatured = async (scripture: Scripture) => {
    try {
      await updateDoc(doc(db, 'scriptures', scripture.id), {
        isFeatured: !scripture.isFeatured,
      });
      fetchScriptures();
    } catch (error) {
      console.error('Error updating featured status:', error);
    }
  };

  const resetForm = () => {
    setEditingScripture(null);
    setFormData({
      book: '',
      chapter: 1,
      verseStart: 1,
      verseEnd: 1,
      text: '',
      message: '',
      isFeatured: false,
      date: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Scriptures</h1>
            <p className="text-gray-600">Manage daily scriptures for the app</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus size={20} />
            Add Scripture
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : scriptures.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600">No scriptures yet. Add your first one!</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Reference</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Text Preview</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Date</th>
                  <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Featured</th>
                  <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {scriptures.map((scripture) => (
                  <tr key={scripture.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{scripture.verse}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 line-clamp-1">
                        {scripture.text.substring(0, 60)}...
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600">
                        {scripture.date.toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleFeatured(scripture)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          scripture.isFeatured
                            ? 'bg-yellow-100 text-yellow-600'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        <Star size={18} fill={scripture.isFeatured ? 'currentColor' : 'none'} />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(scripture)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(scripture.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingScripture ? 'Edit Scripture' : 'Add Scripture'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Book
                  </label>
                  <select
                    value={formData.book}
                    onChange={(e) => setFormData({ ...formData, book: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">Select a book</option>
                    {BIBLE_BOOKS.map((book) => (
                      <option key={book.id} value={book.name}>{book.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chapter
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.chapter}
                    onChange={(e) => setFormData({ ...formData, chapter: parseInt(e.target.value) })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verse Start
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.verseStart}
                    onChange={(e) => setFormData({ ...formData, verseStart: parseInt(e.target.value) })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Verse End
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.verseEnd}
                    onChange={(e) => setFormData({ ...formData, verseEnd: parseInt(e.target.value) })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scripture Text
                </label>
                <textarea
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Enter the scripture text..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message/Devotional (optional)
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Add a devotional message..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="isFeatured" className="text-sm text-gray-700">
                  Feature this scripture on the home page
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {editingScripture ? 'Update' : 'Add'} Scripture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
