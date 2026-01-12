import { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import Layout from '../components/Layout';
import { Upload, Check, AlertCircle, Loader2, BookOpen } from 'lucide-react';

interface ParsedScripture {
  reference: string;
  book: string;
  bookId: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  text: string;
  isValid: boolean;
  error?: string;
}

// Book name to ID mapping for Bible API
const BIBLE_BOOKS: { [key: string]: string } = {
  'genesis': '1', 'gen': '1',
  'exodus': '2', 'exod': '2', 'ex': '2',
  'leviticus': '3', 'lev': '3',
  'numbers': '4', 'num': '4',
  'deuteronomy': '5', 'deut': '5', 'dt': '5',
  'joshua': '6', 'josh': '6',
  'judges': '7', 'judg': '7',
  'ruth': '8',
  '1 samuel': '9', '1 sam': '9', '1sam': '9',
  '2 samuel': '10', '2 sam': '10', '2sam': '10',
  '1 kings': '11', '1 kgs': '11', '1kgs': '11',
  '2 kings': '12', '2 kgs': '12', '2kgs': '12',
  '1 chronicles': '13', '1 chr': '13', '1chr': '13',
  '2 chronicles': '14', '2 chr': '14', '2chr': '14',
  'ezra': '15',
  'nehemiah': '16', 'neh': '16',
  'esther': '17', 'esth': '17',
  'job': '18',
  'psalms': '19', 'psalm': '19', 'ps': '19', 'psa': '19',
  'proverbs': '20', 'prov': '20', 'pr': '20',
  'ecclesiastes': '21', 'eccl': '21', 'ecc': '21',
  'song of solomon': '22', 'song': '22', 'sos': '22', 'song of songs': '22',
  'isaiah': '23', 'isa': '23',
  'jeremiah': '24', 'jer': '24',
  'lamentations': '25', 'lam': '25',
  'ezekiel': '26', 'ezek': '26', 'ez': '26',
  'daniel': '27', 'dan': '27',
  'hosea': '28', 'hos': '28',
  'joel': '29',
  'amos': '30',
  'obadiah': '31', 'obad': '31',
  'jonah': '32', 'jon': '32',
  'micah': '33', 'mic': '33',
  'nahum': '34', 'nah': '34',
  'habakkuk': '35', 'hab': '35',
  'zephaniah': '36', 'zeph': '36',
  'haggai': '37', 'hag': '37',
  'zechariah': '38', 'zech': '38',
  'malachi': '39', 'mal': '39',
  'matthew': '40', 'matt': '40', 'mt': '40',
  'mark': '41', 'mk': '41',
  'luke': '42', 'lk': '42',
  'john': '43', 'jn': '43',
  'acts': '44',
  'romans': '45', 'rom': '45',
  '1 corinthians': '46', '1 cor': '46', '1cor': '46',
  '2 corinthians': '47', '2 cor': '47', '2cor': '47',
  'galatians': '48', 'gal': '48',
  'ephesians': '49', 'eph': '49',
  'philippians': '50', 'phil': '50',
  'colossians': '51', 'col': '51',
  '1 thessalonians': '52', '1 thess': '52', '1thess': '52',
  '2 thessalonians': '53', '2 thess': '53', '2thess': '53',
  '1 timothy': '54', '1 tim': '54', '1tim': '54',
  '2 timothy': '55', '2 tim': '55', '2tim': '55',
  'titus': '56', 'tit': '56',
  'philemon': '57', 'phlm': '57',
  'hebrews': '58', 'heb': '58',
  'james': '59', 'jas': '59',
  '1 peter': '60', '1 pet': '60', '1pet': '60',
  '2 peter': '61', '2 pet': '61', '2pet': '61',
  '1 john': '62', '1 jn': '62', '1jn': '62',
  '2 john': '63', '2 jn': '63', '2jn': '63',
  '3 john': '64', '3 jn': '64', '3jn': '64',
  'jude': '65',
  'revelation': '66', 'rev': '66',
};

const BOOK_NAMES: { [key: string]: string } = {
  '1': 'Genesis', '2': 'Exodus', '3': 'Leviticus', '4': 'Numbers', '5': 'Deuteronomy',
  '6': 'Joshua', '7': 'Judges', '8': 'Ruth', '9': '1 Samuel', '10': '2 Samuel',
  '11': '1 Kings', '12': '2 Kings', '13': '1 Chronicles', '14': '2 Chronicles',
  '15': 'Ezra', '16': 'Nehemiah', '17': 'Esther', '18': 'Job', '19': 'Psalms',
  '20': 'Proverbs', '21': 'Ecclesiastes', '22': 'Song of Solomon', '23': 'Isaiah',
  '24': 'Jeremiah', '25': 'Lamentations', '26': 'Ezekiel', '27': 'Daniel',
  '28': 'Hosea', '29': 'Joel', '30': 'Amos', '31': 'Obadiah', '32': 'Jonah',
  '33': 'Micah', '34': 'Nahum', '35': 'Habakkuk', '36': 'Zephaniah', '37': 'Haggai',
  '38': 'Zechariah', '39': 'Malachi', '40': 'Matthew', '41': 'Mark', '42': 'Luke',
  '43': 'John', '44': 'Acts', '45': 'Romans', '46': '1 Corinthians', '47': '2 Corinthians',
  '48': 'Galatians', '49': 'Ephesians', '50': 'Philippians', '51': 'Colossians',
  '52': '1 Thessalonians', '53': '2 Thessalonians', '54': '1 Timothy', '55': '2 Timothy',
  '56': 'Titus', '57': 'Philemon', '58': 'Hebrews', '59': 'James', '60': '1 Peter',
  '61': '2 Peter', '62': '1 John', '63': '2 John', '64': '3 John', '65': 'Jude',
  '66': 'Revelation',
};

export default function ImportScriptures() {
  const [inputText, setInputText] = useState('');
  const [parsedScriptures, setParsedScriptures] = useState<ParsedScripture[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importedCount, setImportedCount] = useState(0);

  const parseReference = (text: string): { book: string; bookId: string; chapter: number; verseStart: number; verseEnd: number } | null => {
    // Clean the text
    const cleaned = text.trim().toLowerCase();
    if (!cleaned) return null;

    // More flexible regex - handles various formats:
    // "John 3:16", "1 John 3:16-17", "Psalm 23:1-6", "Romans 8:28"
    // Also handles "John 3.16", "John 3 16", "John 3v16", "John chapter 3 verse 16"
    const match = cleaned.match(/^(\d?\s?[a-z]+(?:\s+of\s+[a-z]+)?)\s*(?:chapter\s*)?(\d+)\s*[:.v\s]\s*(?:verse\s*)?(\d+)(?:\s*[-–—to]\s*(\d+))?/i);

    if (!match) return null;

    const bookName = match[1].trim();
    const chapter = parseInt(match[2]);
    const verseStart = parseInt(match[3]);
    const verseEnd = match[4] ? parseInt(match[4]) : verseStart;

    const bookId = BIBLE_BOOKS[bookName];
    if (!bookId) return null;

    const properBookName = BOOK_NAMES[bookId];

    return {
      book: properBookName,
      bookId,
      chapter,
      verseStart,
      verseEnd,
    };
  };

  // Split input into individual scripture references
  const splitIntoReferences = (input: string): string[] => {
    // First, normalize line endings and split by newlines
    const lines = input.split(/[\r\n]+/);

    const references: string[] = [];

    for (const line of lines) {
      // Skip empty lines
      if (!line.trim()) continue;

      // Split by common delimiters: comma, semicolon, bullet points, numbers with periods/parentheses
      // But be careful not to split "1 John" or "2 Peter"
      const parts = line
        .split(/[;•·]|,\s*(?=[1-3]?\s?[A-Za-z])|(?:^|\s)(?:\d+[.)]\s*)|(?:\s*[-–—]\s*(?=[1-3]?\s?[A-Za-z]))/g)
        .map(p => p.trim())
        .filter(p => p.length > 0);

      references.push(...parts);
    }

    return references;
  };

  const fetchScriptureText = async (book: string, chapter: number, verseStart: number, verseEnd: number): Promise<string> => {
    try {
      // Using bible-api.com which supports CORS
      const verseRange = verseStart === verseEnd
        ? `${book} ${chapter}:${verseStart}`
        : `${book} ${chapter}:${verseStart}-${verseEnd}`;

      const response = await fetch(
        `https://bible-api.com/${encodeURIComponent(verseRange)}?translation=kjv`
      );

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // The API returns text with the full passage
      return data.text.trim();
    } catch (error) {
      console.error('Error fetching scripture:', error);
      throw error;
    }
  };

  const handleParse = async () => {
    setIsParsing(true);
    setParsedScriptures([]);
    setImportedCount(0);

    // Use flexible splitting to extract references
    const references = splitIntoReferences(inputText);
    const results: ParsedScripture[] = [];

    for (const ref of references) {
      const parsed = parseReference(ref);

      if (!parsed) {
        results.push({
          reference: ref.trim(),
          book: '',
          bookId: '',
          chapter: 0,
          verseStart: 0,
          verseEnd: 0,
          text: '',
          isValid: false,
          error: 'Could not parse reference',
        });
        continue;
      }

      try {
        const text = await fetchScriptureText(
          parsed.book,
          parsed.chapter,
          parsed.verseStart,
          parsed.verseEnd
        );

        const verseRef = parsed.verseStart === parsed.verseEnd
          ? `${parsed.book} ${parsed.chapter}:${parsed.verseStart}`
          : `${parsed.book} ${parsed.chapter}:${parsed.verseStart}-${parsed.verseEnd}`;

        results.push({
          reference: verseRef,
          ...parsed,
          text,
          isValid: true,
        });
      } catch (error) {
        results.push({
          reference: ref.trim(),
          ...parsed,
          text: '',
          isValid: false,
          error: 'Failed to fetch scripture text',
        });
      }
    }

    setParsedScriptures(results);
    setIsParsing(false);
  };

  const handleImport = async () => {
    const validScriptures = parsedScriptures.filter(s => s.isValid);
    if (validScriptures.length === 0) return;

    setIsImporting(true);

    try {
      const total = validScriptures.length;
      // Automatically spread across 7 days starting today
      const daysToSpread = 7;
      const scripturesPerDay = Math.ceil(total / daysToSpread);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let currentDate = new Date(today);
      let scripturesAddedToday = 0;

      for (let i = 0; i < validScriptures.length; i++) {
        const scripture = validScriptures[i];

        // Move to next day if we've added enough scriptures for today
        if (scripturesAddedToday >= scripturesPerDay) {
          currentDate.setDate(currentDate.getDate() + 1);
          scripturesAddedToday = 0;
        }

        const verseRef = scripture.verseStart === scripture.verseEnd
          ? `${scripture.book} ${scripture.chapter}:${scripture.verseStart}`
          : `${scripture.book} ${scripture.chapter}:${scripture.verseStart}-${scripture.verseEnd}`;

        await addDoc(collection(db, 'scriptures'), {
          book: scripture.book,
          bookId: scripture.bookId,
          chapter: scripture.chapter,
          verseStart: scripture.verseStart,
          verseEnd: scripture.verseEnd,
          verse: verseRef,
          text: scripture.text,
          message: '',
          isFeatured: i === 0, // Feature the first one
          date: Timestamp.fromDate(new Date(currentDate)),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        scripturesAddedToday++;
      }

      setImportedCount(total);
      setInputText('');
      setParsedScriptures([]);
    } catch (error) {
      console.error('Error importing scriptures:', error);
      alert('Error importing scriptures. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = parsedScriptures.filter(s => s.isValid).length;
  const invalidCount = parsedScriptures.filter(s => !s.isValid).length;

  return (
    <Layout>
      <div className="space-y-6 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import Scriptures</h1>
          <p className="text-gray-600">
            Paste scripture references (one per line) and they'll be automatically fetched and scheduled.
          </p>
        </div>

        {importedCount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <Check className="text-green-600" size={20} />
            <span className="text-green-800">
              Successfully imported {importedCount} scriptures!
            </span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste Scripture References
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Paste scriptures in any format - one per line, comma-separated, or however you have them:

John 3:16
Romans 8:28, Psalm 23:1-6, 1 Corinthians 13:4-7

1. Philippians 4:13
2. Proverbs 3:5-6
3. Isaiah 40:31

Or just paste a list from anywhere!`}
              rows={10}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
            />
          </div>

          <button
            onClick={handleParse}
            disabled={!inputText.trim() || isParsing}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isParsing ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Parsing & Fetching Scriptures...
              </>
            ) : (
              <>
                <BookOpen size={20} />
                Parse & Preview
              </>
            )}
          </button>
        </div>

        {parsedScriptures.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Preview ({validCount} valid{invalidCount > 0 ? `, ${invalidCount} invalid` : ''})
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {parsedScriptures.map((scripture, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    scripture.isValid
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {scripture.isValid ? (
                      <Check className="text-green-600 mt-0.5" size={18} />
                    ) : (
                      <AlertCircle className="text-red-600 mt-0.5" size={18} />
                    )}
                    <div className="flex-1">
                      <p className={`font-medium ${scripture.isValid ? 'text-green-900' : 'text-red-900'}`}>
                        {scripture.reference}
                      </p>
                      {scripture.isValid ? (
                        <p className="text-sm text-green-800 mt-1 line-clamp-2">
                          "{scripture.text}"
                        </p>
                      ) : (
                        <p className="text-sm text-red-700 mt-1">
                          {scripture.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {validCount > 0 && (
              <button
                onClick={handleImport}
                disabled={isImporting}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload size={20} />
                    Import {validCount} Scriptures
                  </>
                )}
              </button>
            )}
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Flexible Input</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Paste from anywhere - empty lines are ignored</li>
            <li>• Comma or semicolon separated: <code className="bg-blue-100 px-1 rounded">John 3:16, Romans 8:28; Psalm 23:1-6</code></li>
            <li>• Numbered lists: <code className="bg-blue-100 px-1 rounded">1. John 3:16</code> or <code className="bg-blue-100 px-1 rounded">1) John 3:16</code></li>
            <li>• Abbreviations work: <code className="bg-blue-100 px-1 rounded">Rom 8:28</code>, <code className="bg-blue-100 px-1 rounded">Ps 91:1</code>, <code className="bg-blue-100 px-1 rounded">1 Cor 13:4</code></li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
