# Korean Bible (개역한글) - Usage Guide

## Overview

This system provides offline access to the complete Korean Bible (개역한글/개역성경) in your Expo/React Native app.

## Quick Start

```typescript
import { useBible } from '@/hooks/useBible';

function MyComponent() {
  const { getVerse, getChapter, searchVerses } = useBible();

  // Get a single verse
  const verse = getVerse('john', 3, 16);
  console.log(verse?.text); // "하나님이 세상을 이처럼 사랑하사..."

  // Get full chapter
  const chapter = getChapter('genesis', 1);
  console.log(chapter?.verses.length); // Number of verses in Genesis 1

  // Search for keyword
  const handleSearch = async () => {
    const results = await searchVerses('사랑');
    console.log(results); // Array of verses containing "사랑"
  };

  return <View>...</View>;
}
```

## API Reference

### `useBible()` Hook

#### Methods

**`getVerse(book, chapter, verse)`**
Get a single verse.

```typescript
const verse = getVerse('john', 3, 16);
const verse2 = getVerse(43, 3, 16); // Same as above (43 = John)

// Returns:
// {
//   chapter: 3,
//   verse: 16,
//   name: "요한복음 3:16",
//   text: "하나님이 세상을 이처럼 사랑하사..."
// }
```

**`getChapter(book, chapter)`**
Get an entire chapter with all verses.

```typescript
const chapter = getChapter('genesis', 1);

// Returns:
// {
//   chapter: 1,
//   name: "창세기 1",
//   verses: [...]
// }
```

**`getChapterVerses(book, chapter)`**
Get just the verses array from a chapter.

```typescript
const verses = getChapterVerses('matthew', 5);
// Returns: BibleVerse[]
```

**`searchVerses(keyword, options?)`**
Search for verses containing a keyword (async).

```typescript
// Simple search
const results = await searchVerses('사랑');

// Search within a specific book
const results = await searchVerses('믿음', {
  bookNumber: 43, // John
  maxResults: 50
});

// Returns: SearchResult[]
// {
//   bookName: "요한복음",
//   bookNumber: 43,
//   chapter: 3,
//   verse: 16,
//   text: "...",
//   name: "요한복음 3:16"
// }
```

**`getVerseRange(book, chapter, startVerse, endVerse)`**
Get multiple consecutive verses.

```typescript
const verses = getVerseRange('john', 3, 16, 18);
// Returns verses 16, 17, 18 from John 3
```

**`getBook(book)`**
Get an entire book with all chapters.

```typescript
const book = getBook('genesis');
// or
const book = getBook(1);
```

**`getBookInfo(book)`**
Get metadata about a book.

```typescript
const info = getBookInfo('psalms');
// Returns:
// {
//   number: 19,
//   name: "시편",
//   totalChapters: 150,
//   totalVerses: 2461
// }
```

**`formatVerseReference(bookName, chapter, verse?)`**
Format a verse reference string.

```typescript
const ref = formatVerseReference('요한복음', 3, 16);
// Returns: "요한복음 3:16"

const ref2 = formatVerseReference('창세기', 1);
// Returns: "창세기 1"
```

#### Properties

**`allBookNames`** - Array of all 66 book names in Korean
```typescript
const { allBookNames } = useBible();
// ["창세기", "출애굽기", "레위기", ...]
```

**`searchResults`** - Last search results (cached)
```typescript
const { searchResults } = useBible();
```

**`isSearching`** - Boolean indicating if search is in progress
```typescript
const { isSearching } = useBible();
```

**`clearSearchResults()`** - Clear cached search results
```typescript
clearSearchResults();
```

## Book Names

### Supported Book Identifiers

You can use either **English names** (case-insensitive) or **book numbers** (1-66):

#### Old Testament (구약)
- `genesis` / `1` - 창세기
- `exodus` / `2` - 출애굽기
- `leviticus` / `3` - 레위기
- `numbers` / `4` - 민수기
- `deuteronomy` / `5` - 신명기
- `joshua` / `6` - 여호수아
- `judges` / `7` - 사사기
- `ruth` / `8` - 룻기
- `1samuel` / `9` - 사무엘상
- `2samuel` / `10` - 사무엘하
- ... (see `/constants/koreanBookNames.ts` for full list)

#### New Testament (신약)
- `matthew` / `40` - 마태복음
- `mark` / `41` - 마가복음
- `luke` / `42` - 누가복음
- `john` / `43` - 요한복음
- `acts` / `44` - 사도행전
- `romans` / `45` - 로마서
- ... (see `/constants/koreanBookNames.ts` for full list)

### Helper Functions

```typescript
import { getBookNumber, getKoreanBookName } from '@/constants/koreanBookNames';

const bookNum = getBookNumber('john'); // 43
const koreanName = getKoreanBookName('john'); // "요한복음"
```

## Example Components

### Simple Verse Display

```typescript
import { useBible } from '@/hooks/useBible';
import { View, Text } from 'react-native';

export default function VerseDisplay() {
  const { getVerse } = useBible();
  const verse = getVerse('john', 3, 16);

  return (
    <View>
      <Text style={{ fontSize: 14, color: 'gray' }}>{verse?.name}</Text>
      <Text style={{ fontSize: 18 }}>{verse?.text}</Text>
    </View>
  );
}
```

### Chapter Reader

```typescript
import { useBible } from '@/hooks/useBible';
import { ScrollView, Text, View } from 'react-native';

export default function ChapterReader({ book, chapter }: { book: string; chapter: number }) {
  const { getChapterVerses } = useBible();
  const verses = getChapterVerses(book, chapter);

  return (
    <ScrollView>
      {verses.map((verse) => (
        <View key={verse.verse} style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 12, color: 'gray' }}>{verse.verse}</Text>
          <Text style={{ fontSize: 16 }}>{verse.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
```

### Search Feature

```typescript
import { useState } from 'react';
import { useBible } from '@/hooks/useBible';
import { View, TextInput, FlatList, Text, TouchableOpacity } from 'react-native';

export default function BibleSearch() {
  const [query, setQuery] = useState('');
  const { searchVerses, isSearching, searchResults } = useBible();

  const handleSearch = async () => {
    if (query.trim()) {
      await searchVerses(query, { maxResults: 100 });
    }
  };

  return (
    <View>
      <TextInput
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
        placeholder="성경 검색 (예: 사랑, 믿음)"
      />

      {isSearching && <Text>검색 중...</Text>}

      <FlatList
        data={searchResults}
        keyExtractor={(item, index) => `${item.bookNumber}-${item.chapter}-${item.verse}`}
        renderItem={({ item }) => (
          <TouchableOpacity style={{ padding: 12 }}>
            <Text style={{ fontSize: 12, color: 'gray' }}>{item.name}</Text>
            <Text style={{ fontSize: 16 }}>{item.text}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
```

## File Structure

```
├── assets/
│   └── korean-bible.json          # Complete Korean Bible data (13MB)
├── constants/
│   └── koreanBookNames.ts         # Book name mappings
├── hooks/
│   └── useBible.ts                # Main React hook
├── types/
│   └── bible.ts                   # TypeScript types
└── utils/
    └── bibleUtils.ts              # Core utility functions
```

## Performance Notes

- **Bundle size**: ~13MB for complete Bible
- **Offline**: Fully offline, no network required
- **Search**: Optimized with async operations to prevent UI blocking
- **Memory**: Lazy loading, only loads needed verses
- **React Native**: Uses `require()` for asset bundling

## Data Source

Korean Bible (개역한글) from GetBible API:
- URL: https://api.getbible.net/v2/korean.json
- Translation: 개역성경 (Korean Revised Version)
- Encoding: UTF-8
- 66 books, 1,189 chapters, 31,102 verses

## License

Korean Bible text is in the public domain.
