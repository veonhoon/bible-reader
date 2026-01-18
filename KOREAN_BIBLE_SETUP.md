# Korean Bible Setup - Complete ✅

## What's Been Set Up

I've successfully set up a complete Korean Bible (개역한글) data system for your Bible Teacher app. Here's everything that's been created:

### 📁 Files Created

1. **`/assets/korean-bible.json`** (13MB)
   - Complete Korean Bible data downloaded from GetBible API
   - 66 books, 1,189 chapters, 31,102 verses
   - Already bundled and ready for offline use

2. **`/types/bible.ts`**
   - TypeScript type definitions for Bible data structures
   - Types: `BibleVerse`, `BibleChapter`, `BibleBook`, `KoreanBible`, `SearchResult`

3. **`/constants/koreanBookNames.ts`**
   - Mapping of English book names to Korean names
   - Book number references (1-66)
   - Helper functions: `getBookNumber()`, `getKoreanBookName()`

4. **`/utils/bibleUtils.ts`**
   - Core utility functions for Bible operations
   - All the low-level functions for accessing Bible data

5. **`/hooks/useBible.ts`**
   - Main React hook for components
   - Easy-to-use API with all Bible operations
   - State management for searches

6. **`/components/examples/KoreanBibleExample.tsx`**
   - Complete working example component
   - Shows all major features with UI

7. **`/KOREAN_BIBLE_USAGE.md`**
   - Comprehensive documentation
   - API reference and examples

## ✅ Quick Verification Test

To verify everything works, add this to any component:

```typescript
import { useBible } from '@/hooks/useBible';

export default function TestComponent() {
  const { getVerse } = useBible();
  const verse = getVerse('john', 3, 16);

  console.log('Korean Bible Test:', verse?.text);
  // Should log: "하나님이 세상을 이처럼 사랑하사..."

  return <Text>{verse?.text}</Text>;
}
```

## 🚀 How to Use

### Basic Usage

```typescript
import { useBible } from '@/hooks/useBible';

function MyComponent() {
  const { getVerse, getChapter, searchVerses } = useBible();

  // Get a verse
  const verse = getVerse('john', 3, 16);

  // Get full chapter
  const chapter = getChapter('genesis', 1);

  // Search
  const handleSearch = async () => {
    const results = await searchVerses('사랑');
  };
}
```

### Book Identifiers

You can use either:
- **English names**: `'john'`, `'genesis'`, `'matthew'` (case-insensitive)
- **Book numbers**: `43` (John), `1` (Genesis), `40` (Matthew)

```typescript
// Both work the same
getVerse('john', 3, 16);
getVerse(43, 3, 16);
```

## 📖 Korean Book Names Reference

### Old Testament (구약)
- Genesis → 창세기
- Exodus → 출애굽기
- Leviticus → 레위기
- Numbers → 민수기
- Deuteronomy → 신명기
- ... (39 books total)

### New Testament (신약)
- Matthew → 마태복음
- Mark → 마가복음
- Luke → 누가복음
- John → 요한복음
- Acts → 사도행전
- Romans → 로마서
- ... (27 books total)

See `/constants/koreanBookNames.ts` for complete list.

## 🎯 Key Features

✅ **Fully Offline** - No network required, all data bundled
✅ **TypeScript** - Full type safety
✅ **Fast Search** - Optimized keyword search
✅ **Korean Names** - All book names in Korean
✅ **Easy API** - Simple hook-based interface
✅ **Performance** - Async operations prevent UI blocking
✅ **Complete** - All 66 books of the Bible

## 📊 Data Stats

- **Total Size**: 13.5 MB
- **Books**: 66
- **Chapters**: 1,189
- **Verses**: 31,102
- **Translation**: 개역성경 (Korean Revised Version)
- **Encoding**: UTF-8

## 🔧 Available Methods

| Method | Description |
|--------|-------------|
| `getVerse(book, chapter, verse)` | Get a single verse |
| `getChapter(book, chapter)` | Get full chapter |
| `getChapterVerses(book, chapter)` | Get verses array |
| `searchVerses(keyword, options?)` | Search for keyword |
| `getVerseRange(book, ch, start, end)` | Get verse range |
| `getBook(book)` | Get entire book |
| `getBookInfo(book)` | Get book metadata |
| `formatVerseReference(book, ch, v)` | Format reference string |
| `allBookNames` | Array of all book names |

## 💡 Example Use Cases

### 1. Verse of the Day Display
```typescript
const verse = getVerse('john', 3, 16);
```

### 2. Chapter Reader
```typescript
const verses = getChapterVerses('genesis', 1);
```

### 3. Bible Search
```typescript
const results = await searchVerses('사랑', { maxResults: 50 });
```

### 4. Daily Reading Plan
```typescript
const todayVerse = getVerse('psalms', dayOfMonth, 1);
```

## 🎨 Example Component

Check out `/components/examples/KoreanBibleExample.tsx` for a complete working example with:
- Single verse display
- Chapter display
- Search functionality
- Book list

## 📝 Next Steps

1. ✅ Korean Bible data is ready to use
2. Import `useBible` hook in your components
3. Use the example component as reference
4. Check the usage guide for detailed API docs

## 🆘 Troubleshooting

**Issue**: "Cannot find module '@/assets/korean-bible.json'"
- Solution: Make sure the asset path is correct in your `tsconfig.json` or `app.json`

**Issue**: Search is slow
- Solution: Already optimized with async operations. Reduce `maxResults` if needed.

**Issue**: Bundle size concerns
- The Bible data is 13MB which is acceptable for a Bible app
- It's loaded lazily only when needed
- No additional network requests needed

## 📚 Resources

- **Usage Guide**: `/KOREAN_BIBLE_USAGE.md`
- **Example Component**: `/components/examples/KoreanBibleExample.tsx`
- **Type Definitions**: `/types/bible.ts`
- **Book Names**: `/constants/koreanBookNames.ts`

---

**Ready to use!** Import the hook and start building your Bible app features. 🙏
