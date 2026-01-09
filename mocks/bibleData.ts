export interface BibleBook {
  id: string;
  name: string;
  shortName: string;
  testament: 'old' | 'new';
  chapters: number;
}

export interface BibleVerse {
  verse: number;
  text: string;
}

export interface BibleChapter {
  bookId: string;
  chapter: number;
  verses: BibleVerse[];
}

export const BIBLE_VERSION = 'KJV';

export const BIBLE_BOOKS: BibleBook[] = [
  { id: 'genesis', name: 'Genesis', shortName: 'Gen', testament: 'old', chapters: 50 },
  { id: 'exodus', name: 'Exodus', shortName: 'Exod', testament: 'old', chapters: 40 },
  { id: 'leviticus', name: 'Leviticus', shortName: 'Lev', testament: 'old', chapters: 27 },
  { id: 'numbers', name: 'Numbers', shortName: 'Num', testament: 'old', chapters: 36 },
  { id: 'deuteronomy', name: 'Deuteronomy', shortName: 'Deut', testament: 'old', chapters: 34 },
  { id: 'joshua', name: 'Joshua', shortName: 'Josh', testament: 'old', chapters: 24 },
  { id: 'judges', name: 'Judges', shortName: 'Judg', testament: 'old', chapters: 21 },
  { id: 'ruth', name: 'Ruth', shortName: 'Ruth', testament: 'old', chapters: 4 },
  { id: '1samuel', name: '1 Samuel', shortName: '1 Sam', testament: 'old', chapters: 31 },
  { id: '2samuel', name: '2 Samuel', shortName: '2 Sam', testament: 'old', chapters: 24 },
  { id: '1kings', name: '1 Kings', shortName: '1 Kgs', testament: 'old', chapters: 22 },
  { id: '2kings', name: '2 Kings', shortName: '2 Kgs', testament: 'old', chapters: 25 },
  { id: '1chronicles', name: '1 Chronicles', shortName: '1 Chr', testament: 'old', chapters: 29 },
  { id: '2chronicles', name: '2 Chronicles', shortName: '2 Chr', testament: 'old', chapters: 36 },
  { id: 'ezra', name: 'Ezra', shortName: 'Ezra', testament: 'old', chapters: 10 },
  { id: 'nehemiah', name: 'Nehemiah', shortName: 'Neh', testament: 'old', chapters: 13 },
  { id: 'esther', name: 'Esther', shortName: 'Esth', testament: 'old', chapters: 10 },
  { id: 'job', name: 'Job', shortName: 'Job', testament: 'old', chapters: 42 },
  { id: 'psalms', name: 'Psalms', shortName: 'Ps', testament: 'old', chapters: 150 },
  { id: 'proverbs', name: 'Proverbs', shortName: 'Prov', testament: 'old', chapters: 31 },
  { id: 'ecclesiastes', name: 'Ecclesiastes', shortName: 'Eccl', testament: 'old', chapters: 12 },
  { id: 'songofsolomon', name: 'Song of Solomon', shortName: 'Song', testament: 'old', chapters: 8 },
  { id: 'isaiah', name: 'Isaiah', shortName: 'Isa', testament: 'old', chapters: 66 },
  { id: 'jeremiah', name: 'Jeremiah', shortName: 'Jer', testament: 'old', chapters: 52 },
  { id: 'lamentations', name: 'Lamentations', shortName: 'Lam', testament: 'old', chapters: 5 },
  { id: 'ezekiel', name: 'Ezekiel', shortName: 'Ezek', testament: 'old', chapters: 48 },
  { id: 'daniel', name: 'Daniel', shortName: 'Dan', testament: 'old', chapters: 12 },
  { id: 'hosea', name: 'Hosea', shortName: 'Hos', testament: 'old', chapters: 14 },
  { id: 'joel', name: 'Joel', shortName: 'Joel', testament: 'old', chapters: 3 },
  { id: 'amos', name: 'Amos', shortName: 'Amos', testament: 'old', chapters: 9 },
  { id: 'obadiah', name: 'Obadiah', shortName: 'Obad', testament: 'old', chapters: 1 },
  { id: 'jonah', name: 'Jonah', shortName: 'Jonah', testament: 'old', chapters: 4 },
  { id: 'micah', name: 'Micah', shortName: 'Mic', testament: 'old', chapters: 7 },
  { id: 'nahum', name: 'Nahum', shortName: 'Nah', testament: 'old', chapters: 3 },
  { id: 'habakkuk', name: 'Habakkuk', shortName: 'Hab', testament: 'old', chapters: 3 },
  { id: 'zephaniah', name: 'Zephaniah', shortName: 'Zeph', testament: 'old', chapters: 3 },
  { id: 'haggai', name: 'Haggai', shortName: 'Hag', testament: 'old', chapters: 2 },
  { id: 'zechariah', name: 'Zechariah', shortName: 'Zech', testament: 'old', chapters: 14 },
  { id: 'malachi', name: 'Malachi', shortName: 'Mal', testament: 'old', chapters: 4 },
  { id: 'matthew', name: 'Matthew', shortName: 'Matt', testament: 'new', chapters: 28 },
  { id: 'mark', name: 'Mark', shortName: 'Mark', testament: 'new', chapters: 16 },
  { id: 'luke', name: 'Luke', shortName: 'Luke', testament: 'new', chapters: 24 },
  { id: 'john', name: 'John', shortName: 'John', testament: 'new', chapters: 21 },
  { id: 'acts', name: 'Acts', shortName: 'Acts', testament: 'new', chapters: 28 },
  { id: 'romans', name: 'Romans', shortName: 'Rom', testament: 'new', chapters: 16 },
  { id: '1corinthians', name: '1 Corinthians', shortName: '1 Cor', testament: 'new', chapters: 16 },
  { id: '2corinthians', name: '2 Corinthians', shortName: '2 Cor', testament: 'new', chapters: 13 },
  { id: 'galatians', name: 'Galatians', shortName: 'Gal', testament: 'new', chapters: 6 },
  { id: 'ephesians', name: 'Ephesians', shortName: 'Eph', testament: 'new', chapters: 6 },
  { id: 'philippians', name: 'Philippians', shortName: 'Phil', testament: 'new', chapters: 4 },
  { id: 'colossians', name: 'Colossians', shortName: 'Col', testament: 'new', chapters: 4 },
  { id: '1thessalonians', name: '1 Thessalonians', shortName: '1 Thess', testament: 'new', chapters: 5 },
  { id: '2thessalonians', name: '2 Thessalonians', shortName: '2 Thess', testament: 'new', chapters: 3 },
  { id: '1timothy', name: '1 Timothy', shortName: '1 Tim', testament: 'new', chapters: 6 },
  { id: '2timothy', name: '2 Timothy', shortName: '2 Tim', testament: 'new', chapters: 4 },
  { id: 'titus', name: 'Titus', shortName: 'Titus', testament: 'new', chapters: 3 },
  { id: 'philemon', name: 'Philemon', shortName: 'Phlm', testament: 'new', chapters: 1 },
  { id: 'hebrews', name: 'Hebrews', shortName: 'Heb', testament: 'new', chapters: 13 },
  { id: 'james', name: 'James', shortName: 'Jas', testament: 'new', chapters: 5 },
  { id: '1peter', name: '1 Peter', shortName: '1 Pet', testament: 'new', chapters: 5 },
  { id: '2peter', name: '2 Peter', shortName: '2 Pet', testament: 'new', chapters: 3 },
  { id: '1john', name: '1 John', shortName: '1 John', testament: 'new', chapters: 5 },
  { id: '2john', name: '2 John', shortName: '2 John', testament: 'new', chapters: 1 },
  { id: '3john', name: '3 John', shortName: '3 John', testament: 'new', chapters: 1 },
  { id: 'jude', name: 'Jude', shortName: 'Jude', testament: 'new', chapters: 1 },
  { id: 'revelation', name: 'Revelation', shortName: 'Rev', testament: 'new', chapters: 22 },
];

export const SAMPLE_CHAPTERS: Record<string, BibleChapter> = {
  'genesis-1': {
    bookId: 'genesis',
    chapter: 1,
    verses: [
      { verse: 1, text: 'In the beginning God created the heavens and the earth.' },
      { verse: 2, text: 'Now the earth was formless and empty, darkness was over the surface of the deep, and the Spirit of God was hovering over the waters.' },
      { verse: 3, text: 'And God said, "Let there be light," and there was light.' },
      { verse: 4, text: 'God saw that the light was good, and he separated the light from the darkness.' },
      { verse: 5, text: 'God called the light "day," and the darkness he called "night." And there was evening, and there was morning—the first day.' },
      { verse: 6, text: 'And God said, "Let there be a vault between the waters to separate water from water."' },
      { verse: 7, text: 'So God made the vault and separated the water under the vault from the water above it. And it was so.' },
      { verse: 8, text: 'God called the vault "sky." And there was evening, and there was morning—the second day.' },
      { verse: 9, text: 'And God said, "Let the water under the sky be gathered to one place, and let dry ground appear." And it was so.' },
      { verse: 10, text: 'God called the dry ground "land," and the gathered waters he called "seas." And God saw that it was good.' },
      { verse: 11, text: 'Then God said, "Let the land produce vegetation: seed-bearing plants and trees on the land that bear fruit with seed in it, according to their various kinds." And it was so.' },
      { verse: 12, text: 'The land produced vegetation: plants bearing seed according to their kinds and trees bearing fruit with seed in it according to their kinds. And God saw that it was good.' },
      { verse: 13, text: 'And there was evening, and there was morning—the third day.' },
      { verse: 14, text: 'And God said, "Let there be lights in the vault of the sky to separate the day from the night, and let them serve as signs to mark sacred times, and days and years,' },
      { verse: 15, text: 'and let them be lights in the vault of the sky to give light on the earth." And it was so.' },
      { verse: 16, text: 'God made two great lights—the greater light to govern the day and the lesser light to govern the night. He also made the stars.' },
      { verse: 17, text: 'God set them in the vault of the sky to give light on the earth,' },
      { verse: 18, text: 'to govern the day and the night, and to separate light from darkness. And God saw that it was good.' },
      { verse: 19, text: 'And there was evening, and there was morning—the fourth day.' },
      { verse: 20, text: 'And God said, "Let the water teem with living creatures, and let birds fly above the earth across the vault of the sky."' },
      { verse: 21, text: 'So God created the great creatures of the sea and every living thing with which the water teems and that moves about in it, according to their kinds, and every winged bird according to its kind. And God saw that it was good.' },
      { verse: 22, text: 'God blessed them and said, "Be fruitful and increase in number and fill the water in the seas, and let the birds increase on the earth."' },
      { verse: 23, text: 'And there was evening, and there was morning—the fifth day.' },
      { verse: 24, text: 'And God said, "Let the land produce living creatures according to their kinds: the livestock, the creatures that move along the ground, and the wild animals, each according to its kind." And it was so.' },
      { verse: 25, text: 'God made the wild animals according to their kinds, the livestock according to their kinds, and all the creatures that move along the ground according to their kinds. And God saw that it was good.' },
      { verse: 26, text: 'Then God said, "Let us make mankind in our image, in our likeness, so that they may rule over the fish in the sea and the birds in the sky, over the livestock and all the wild animals, and over all the creatures that move along the ground."' },
      { verse: 27, text: 'So God created mankind in his own image, in the image of God he created them; male and female he created them.' },
      { verse: 28, text: 'God blessed them and said to them, "Be fruitful and increase in number; fill the earth and subdue it. Rule over the fish in the sea and the birds in the sky and over every living creature that moves on the ground."' },
      { verse: 29, text: 'Then God said, "I give you every seed-bearing plant on the face of the whole earth and every tree that has fruit with seed in it. They will be yours for food.' },
      { verse: 30, text: 'And to all the beasts of the earth and all the birds in the sky and all the creatures that move along the ground—everything that has the breath of life in it—I give every green plant for food." And it was so.' },
      { verse: 31, text: 'God saw all that he had made, and it was very good. And there was evening, and there was morning—the sixth day.' },
    ],
  },
  'psalms-23': {
    bookId: 'psalms',
    chapter: 23,
    verses: [
      { verse: 1, text: 'The Lord is my shepherd, I lack nothing.' },
      { verse: 2, text: 'He makes me lie down in green pastures, he leads me beside quiet waters,' },
      { verse: 3, text: 'he refreshes my soul. He guides me along the right paths for his name\'s sake.' },
      { verse: 4, text: 'Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me.' },
      { verse: 5, text: 'You prepare a table before me in the presence of my enemies. You anoint my head with oil; my cup overflows.' },
      { verse: 6, text: 'Surely your goodness and love will follow me all the days of my life, and I will dwell in the house of the Lord forever.' },
    ],
  },
  'john-1': {
    bookId: 'john',
    chapter: 1,
    verses: [
      { verse: 1, text: 'In the beginning was the Word, and the Word was with God, and the Word was God.' },
      { verse: 2, text: 'He was with God in the beginning.' },
      { verse: 3, text: 'Through him all things were made; without him nothing was made that has been made.' },
      { verse: 4, text: 'In him was life, and that life was the light of all mankind.' },
      { verse: 5, text: 'The light shines in the darkness, and the darkness has not overcome it.' },
      { verse: 6, text: 'There was a man sent from God whose name was John.' },
      { verse: 7, text: 'He came as a witness to testify concerning that light, so that through him all might believe.' },
      { verse: 8, text: 'He himself was not the light; he came only as a witness to the light.' },
      { verse: 9, text: 'The true light that gives light to everyone was coming into the world.' },
      { verse: 10, text: 'He was in the world, and though the world was made through him, the world did not recognize him.' },
      { verse: 11, text: 'He came to that which was his own, but his own did not receive him.' },
      { verse: 12, text: 'Yet to all who did receive him, to those who believed in his name, he gave the right to become children of God—' },
      { verse: 13, text: 'children born not of natural descent, nor of human decision or a husband\'s will, but born of God.' },
      { verse: 14, text: 'The Word became flesh and made his dwelling among us. We have seen his glory, the glory of the one and only Son, who came from the Father, full of grace and truth.' },
    ],
  },
  'matthew-5': {
    bookId: 'matthew',
    chapter: 5,
    verses: [
      { verse: 1, text: 'Now when Jesus saw the crowds, he went up on a mountainside and sat down. His disciples came to him,' },
      { verse: 2, text: 'and he began to teach them.' },
      { verse: 3, text: 'Blessed are the poor in spirit, for theirs is the kingdom of heaven.' },
      { verse: 4, text: 'Blessed are those who mourn, for they will be comforted.' },
      { verse: 5, text: 'Blessed are the meek, for they will inherit the earth.' },
      { verse: 6, text: 'Blessed are those who hunger and thirst for righteousness, for they will be filled.' },
      { verse: 7, text: 'Blessed are the merciful, for they will be shown mercy.' },
      { verse: 8, text: 'Blessed are the pure in heart, for they will see God.' },
      { verse: 9, text: 'Blessed are the peacemakers, for they will be called children of God.' },
      { verse: 10, text: 'Blessed are those who are persecuted because of righteousness, for theirs is the kingdom of heaven.' },
      { verse: 11, text: 'Blessed are you when people insult you, persecute you and falsely say all kinds of evil against you because of me.' },
      { verse: 12, text: 'Rejoice and be glad, because great is your reward in heaven, for in the same way they persecuted the prophets who were before you.' },
      { verse: 13, text: 'You are the salt of the earth. But if the salt loses its saltiness, how can it be made salty again? It is no longer good for anything, except to be thrown out and trampled underfoot.' },
      { verse: 14, text: 'You are the light of the world. A town built on a hill cannot be hidden.' },
      { verse: 15, text: 'Neither do people light a lamp and put it under a bowl. Instead they put it on its stand, and it gives light to everyone in the house.' },
      { verse: 16, text: 'In the same way, let your light shine before others, that they may see your good deeds and glorify your Father in heaven.' },
    ],
  },
  'romans-8': {
    bookId: 'romans',
    chapter: 8,
    verses: [
      { verse: 1, text: 'Therefore, there is now no condemnation for those who are in Christ Jesus,' },
      { verse: 2, text: 'because through Christ Jesus the law of the Spirit who gives life has set you free from the law of sin and death.' },
      { verse: 28, text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
      { verse: 31, text: 'What, then, shall we say in response to these things? If God is for us, who can be against us?' },
      { verse: 37, text: 'No, in all these things we are more than conquerors through him who loved us.' },
      { verse: 38, text: 'For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers,' },
      { verse: 39, text: 'neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord.' },
    ],
  },
  'proverbs-3': {
    bookId: 'proverbs',
    chapter: 3,
    verses: [
      { verse: 1, text: 'My son, do not forget my teaching, but keep my commands in your heart,' },
      { verse: 2, text: 'for they will prolong your life many years and bring you peace and prosperity.' },
      { verse: 3, text: 'Let love and faithfulness never leave you; bind them around your neck, write them on the tablet of your heart.' },
      { verse: 4, text: 'Then you will win favor and a good name in the sight of God and man.' },
      { verse: 5, text: 'Trust in the Lord with all your heart and lean not on your own understanding;' },
      { verse: 6, text: 'in all your ways submit to him, and he will make your paths straight.' },
      { verse: 7, text: 'Do not be wise in your own eyes; fear the Lord and shun evil.' },
    ],
  },
  'philippians-4': {
    bookId: 'philippians',
    chapter: 4,
    verses: [
      { verse: 4, text: 'Rejoice in the Lord always. I will say it again: Rejoice!' },
      { verse: 5, text: 'Let your gentleness be evident to all. The Lord is near.' },
      { verse: 6, text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.' },
      { verse: 7, text: 'And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.' },
      { verse: 8, text: 'Finally, brothers and sisters, whatever is true, whatever is noble, whatever is right, whatever is pure, whatever is lovely, whatever is admirable—if anything is excellent or praiseworthy—think about such things.' },
      { verse: 13, text: 'I can do all this through him who gives me strength.' },
    ],
  },
};

export const WEEKLY_SCRIPTURE = {
  id: 'week-2024-01',
  title: 'Finding Peace in God\'s Promises',
  description: 'This week, we focus on the assurance and peace that comes from trusting in God\'s unchanging love.',
  scriptures: [
    { bookId: 'philippians', bookName: 'Philippians', chapter: 4, verseStart: 6, verseEnd: 7 },
    { bookId: 'proverbs', bookName: 'Proverbs', chapter: 3, verseStart: 5, verseEnd: 6 },
    { bookId: 'romans', bookName: 'Romans', chapter: 8, verseStart: 28, verseEnd: 28 },
  ],
};

export function getChapter(bookId: string, chapter: number): BibleChapter | null {
  const key = `${bookId}-${chapter}`;
  if (SAMPLE_CHAPTERS[key]) {
    return SAMPLE_CHAPTERS[key];
  }
  
  const book = BIBLE_BOOKS.find(b => b.id === bookId);
  if (!book || chapter < 1 || chapter > book.chapters) {
    return null;
  }

  const verses: BibleVerse[] = [];
  const verseCount = Math.floor(Math.random() * 20) + 10;
  
  for (let i = 1; i <= verseCount; i++) {
    verses.push({
      verse: i,
      text: `This is verse ${i} of ${book.name} chapter ${chapter}. The full NIV Bible text will be loaded from an API in production.`,
    });
  }

  return {
    bookId,
    chapter,
    verses,
  };
}

export function getBook(bookId: string): BibleBook | undefined {
  return BIBLE_BOOKS.find(b => b.id === bookId);
}
