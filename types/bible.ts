export interface BibleVerse {
  chapter: number;
  verse: number;
  name: string;
  text: string;
}

export interface BibleChapter {
  chapter: number;
  name: string;
  verses: BibleVerse[];
}

export interface BibleBook {
  nr: number;
  name: string;
  chapters: BibleChapter[];
}

export interface KoreanBible {
  translation: string;
  abbreviation: string;
  description: string;
  lang: string;
  language: string;
  direction: string;
  encoding: string;
  books: BibleBook[];
}

export interface SearchResult {
  bookName: string;
  bookNumber: number;
  chapter: number;
  verse: number;
  text: string;
  name: string;
}
