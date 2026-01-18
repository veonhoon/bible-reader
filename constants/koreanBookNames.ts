/**
 * Korean Bible book names mapping
 * Maps English book names/abbreviations to Korean names and book numbers
 */

export const KOREAN_BOOK_NAMES: Record<string, { korean: string; number: number }> = {
  // Old Testament - 구약
  genesis: { korean: '창세기', number: 1 },
  exodus: { korean: '출애굽기', number: 2 },
  leviticus: { korean: '레위기', number: 3 },
  numbers: { korean: '민수기', number: 4 },
  deuteronomy: { korean: '신명기', number: 5 },
  joshua: { korean: '여호수아', number: 6 },
  judges: { korean: '사사기', number: 7 },
  ruth: { korean: '룻기', number: 8 },
  '1samuel': { korean: '사무엘상', number: 9 },
  '2samuel': { korean: '사무엘하', number: 10 },
  '1kings': { korean: '열왕기상', number: 11 },
  '2kings': { korean: '열왕기하', number: 12 },
  '1chronicles': { korean: '역대상', number: 13 },
  '2chronicles': { korean: '역대하', number: 14 },
  ezra: { korean: '에스라', number: 15 },
  nehemiah: { korean: '느헤미야', number: 16 },
  esther: { korean: '에스더', number: 17 },
  job: { korean: '욥기', number: 18 },
  psalms: { korean: '시편', number: 19 },
  proverbs: { korean: '잠언', number: 20 },
  ecclesiastes: { korean: '전도서', number: 21 },
  song: { korean: '아가', number: 22 },
  isaiah: { korean: '이사야', number: 23 },
  jeremiah: { korean: '예레미야', number: 24 },
  lamentations: { korean: '예레미야애가', number: 25 },
  ezekiel: { korean: '에스겔', number: 26 },
  daniel: { korean: '다니엘', number: 27 },
  hosea: { korean: '호세아', number: 28 },
  joel: { korean: '요엘', number: 29 },
  amos: { korean: '아모스', number: 30 },
  obadiah: { korean: '오바댜', number: 31 },
  jonah: { korean: '요나', number: 32 },
  micah: { korean: '미가', number: 33 },
  nahum: { korean: '나훔', number: 34 },
  habakkuk: { korean: '하박국', number: 35 },
  zephaniah: { korean: '스바냐', number: 36 },
  haggai: { korean: '학개', number: 37 },
  zechariah: { korean: '스가랴', number: 38 },
  malachi: { korean: '말라기', number: 39 },

  // New Testament - 신약
  matthew: { korean: '마태복음', number: 40 },
  mark: { korean: '마가복음', number: 41 },
  luke: { korean: '누가복음', number: 42 },
  john: { korean: '요한복음', number: 43 },
  acts: { korean: '사도행전', number: 44 },
  romans: { korean: '로마서', number: 45 },
  '1corinthians': { korean: '고린도전서', number: 46 },
  '2corinthians': { korean: '고린도후서', number: 47 },
  galatians: { korean: '갈라디아서', number: 48 },
  ephesians: { korean: '에베소서', number: 49 },
  philippians: { korean: '빌립보서', number: 50 },
  colossians: { korean: '골로새서', number: 51 },
  '1thessalonians': { korean: '데살로니가전서', number: 52 },
  '2thessalonians': { korean: '데살로니가후서', number: 53 },
  '1timothy': { korean: '디모데전서', number: 54 },
  '2timothy': { korean: '디모데후서', number: 55 },
  titus: { korean: '디도서', number: 56 },
  philemon: { korean: '빌레몬서', number: 57 },
  hebrews: { korean: '히브리서', number: 58 },
  james: { korean: '야고보서', number: 59 },
  '1peter': { korean: '베드로전서', number: 60 },
  '2peter': { korean: '베드로후서', number: 61 },
  '1john': { korean: '요한일서', number: 62 },
  '2john': { korean: '요한이서', number: 63 },
  '3john': { korean: '요한삼서', number: 64 },
  jude: { korean: '유다서', number: 65 },
  revelation: { korean: '요한계시록', number: 66 },
};

// Reverse mapping for quick lookup by book number
export const BOOK_NUMBER_TO_KOREAN: Record<number, string> = Object.values(
  KOREAN_BOOK_NAMES
).reduce((acc, { korean, number }) => {
  acc[number] = korean;
  return acc;
}, {} as Record<number, string>);

// Helper function to get book number from English name
export const getBookNumber = (bookName: string): number | null => {
  const normalized = bookName.toLowerCase().replace(/\s+/g, '');
  return KOREAN_BOOK_NAMES[normalized]?.number || null;
};

// Helper function to get Korean name from English name
export const getKoreanBookName = (bookName: string): string | null => {
  const normalized = bookName.toLowerCase().replace(/\s+/g, '');
  return KOREAN_BOOK_NAMES[normalized]?.korean || null;
};
