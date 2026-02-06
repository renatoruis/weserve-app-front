"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { getChurchSlug } from "@/lib/church";
import { getApiUrl } from "@/lib/api";
import ShareButton from "@/components/ShareButton";

const API_URL = getApiUrl();
const slug = getChurchSlug();

interface BibleVersion {
  id: string;
  bible_id: number;
  label: string;
  abbreviation: string;
  locale: string;
  is_default: boolean;
}

interface BookInfo {
  id: string;
  title: string;
  full_title: string;
  chapters: { id: string; passage_id: string; title: string }[];
}

// Old + New testament book order for sorting
const OT_BOOKS = ["GEN","EXO","LEV","NUM","DEU","JOS","JDG","RUT","1SA","2SA","1KI","2KI","1CH","2CH","EZR","NEH","EST","JOB","PSA","PRO","ECC","SNG","ISA","JER","LAM","EZK","DAN","HOS","JOL","AMO","OBA","JON","MIC","NAM","HAB","ZEP","HAG","ZEC","MAL"];
const NT_BOOKS = ["MAT","MRK","LUK","JHN","ACT","ROM","1CO","2CO","GAL","EPH","PHP","COL","1TH","2TH","1TI","2TI","TIT","PHM","HEB","JAS","1PE","2PE","1JN","2JN","3JN","JUD","REV"];

// Localized book names
const BOOK_NAMES_PT: Record<string, string> = {
  GEN:"Gênesis",EXO:"Êxodo",LEV:"Levítico",NUM:"Números",DEU:"Deuteronômio",JOS:"Josué",JDG:"Juízes",RUT:"Rute",
  "1SA":"1 Samuel","2SA":"2 Samuel","1KI":"1 Reis","2KI":"2 Reis","1CH":"1 Crônicas","2CH":"2 Crônicas",
  EZR:"Esdras",NEH:"Neemias",EST:"Ester",JOB:"Jó",PSA:"Salmos",PRO:"Provérbios",ECC:"Eclesiastes",SNG:"Cânticos",
  ISA:"Isaías",JER:"Jeremias",LAM:"Lamentações",EZK:"Ezequiel",DAN:"Daniel",HOS:"Oseias",JOL:"Joel",AMO:"Amós",
  OBA:"Obadias",JON:"Jonas",MIC:"Miqueias",NAM:"Naum",HAB:"Habacuque",ZEP:"Sofonias",HAG:"Ageu",ZEC:"Zacarias",MAL:"Malaquias",
  MAT:"Mateus",MRK:"Marcos",LUK:"Lucas",JHN:"João",ACT:"Atos",ROM:"Romanos",
  "1CO":"1 Coríntios","2CO":"2 Coríntios",GAL:"Gálatas",EPH:"Efésios",PHP:"Filipenses",COL:"Colossenses",
  "1TH":"1 Tessalonicenses","2TH":"2 Tessalonicenses","1TI":"1 Timóteo","2TI":"2 Timóteo",TIT:"Tito",PHM:"Filemom",
  HEB:"Hebreus",JAS:"Tiago","1PE":"1 Pedro","2PE":"2 Pedro","1JN":"1 João","2JN":"2 João","3JN":"3 João",JUD:"Judas",REV:"Apocalipse",
};

const BOOK_NAMES_EN: Record<string, string> = {
  GEN:"Genesis",EXO:"Exodus",LEV:"Leviticus",NUM:"Numbers",DEU:"Deuteronomy",JOS:"Joshua",JDG:"Judges",RUT:"Ruth",
  "1SA":"1 Samuel","2SA":"2 Samuel","1KI":"1 Kings","2KI":"2 Kings","1CH":"1 Chronicles","2CH":"2 Chronicles",
  EZR:"Ezra",NEH:"Nehemiah",EST:"Esther",JOB:"Job",PSA:"Psalms",PRO:"Proverbs",ECC:"Ecclesiastes",SNG:"Song of Solomon",
  ISA:"Isaiah",JER:"Jeremiah",LAM:"Lamentations",EZK:"Ezekiel",DAN:"Daniel",HOS:"Hosea",JOL:"Joel",AMO:"Amos",
  OBA:"Obadiah",JON:"Jonah",MIC:"Micah",NAM:"Nahum",HAB:"Habakkuk",ZEP:"Zephaniah",HAG:"Haggai",ZEC:"Zechariah",MAL:"Malachi",
  MAT:"Matthew",MRK:"Mark",LUK:"Luke",JHN:"John",ACT:"Acts",ROM:"Romans",
  "1CO":"1 Corinthians","2CO":"2 Corinthians",GAL:"Galatians",EPH:"Ephesians",PHP:"Philippians",COL:"Colossians",
  "1TH":"1 Thessalonians","2TH":"2 Thessalonians","1TI":"1 Timothy","2TI":"2 Timothy",TIT:"Titus",PHM:"Philemon",
  HEB:"Hebrews",JAS:"James","1PE":"1 Peter","2PE":"2 Peter","1JN":"1 John","2JN":"2 John","3JN":"3 John",JUD:"Jude",REV:"Revelation",
};

type View = "versions" | "books" | "chapters" | "reading" | "search" | "bookmarks";

interface Bookmark {
  verseNum: string;
  content: string;
  reference: string;
  bookId: string;
  chapter: string;
  bookName: string;
  versionAbbr: string;
  savedAt: string;
}

function getBookmarks(): Bookmark[] {
  try {
    return JSON.parse(localStorage.getItem("bible-bookmarks") || "[]");
  } catch { return []; }
}

function saveBookmark(bm: Bookmark) {
  const bookmarks = getBookmarks();
  const key = `${bm.bookId}:${bm.chapter}:${bm.verseNum}`;
  if (bookmarks.some(b => `${b.bookId}:${b.chapter}:${b.verseNum}` === key)) return false;
  bookmarks.unshift(bm);
  localStorage.setItem("bible-bookmarks", JSON.stringify(bookmarks));
  return true;
}

function removeBookmark(bookId: string, chapter: string, verseNum: string) {
  const bookmarks = getBookmarks().filter(
    b => !(b.bookId === bookId && b.chapter === chapter && b.verseNum === verseNum)
  );
  localStorage.setItem("bible-bookmarks", JSON.stringify(bookmarks));
}

function isBookmarked(bookId: string, chapter: string, verseNum: string): boolean {
  return getBookmarks().some(b => b.bookId === bookId && b.chapter === chapter && b.verseNum === verseNum);
}

function parseSearchQuery(query: string, bookNames: Record<string, string>): { bookId: string; chapter?: string } | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  // Build reverse map: localized name -> book id
  const reverseMap: Record<string, string> = {};
  for (const [id, name] of Object.entries(bookNames)) {
    reverseMap[name.toLowerCase()] = id;
  }

  // Try to match "Book Chapter" or "Book Chapter:Verse" patterns
  // Handle numbered books like "1 João 3:16"
  const match = q.match(/^(\d?\s*[a-záàâãéèêíóôõúçñ]+)\s*(\d+)?(?::(\d+))?$/i);
  if (!match) return null;

  const bookQuery = match[1].trim();
  const chapter = match[2];

  // Find best matching book
  let bookId: string | null = null;
  for (const [name, id] of Object.entries(reverseMap)) {
    if (name.startsWith(bookQuery) || name === bookQuery) {
      bookId = id;
      break;
    }
  }

  if (!bookId) return null;
  return { bookId, chapter };
}

export default function BiblePage() {
  const t = useTranslations("bible");
  const tSearch = useTranslations("bibleSearch");
  const tBookmarks = useTranslations("bookmarks");
  const tCommon = useTranslations("common");
  const locale = useLocale();

  const [view, setView] = useState<View>("versions");
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [savedVerses, setSavedVerses] = useState<Set<string>>(new Set());
  const [versions, setVersions] = useState<BibleVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<BibleVersion | null>(null);
  const [books, setBooks] = useState<string[]>([]);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [bookInfo, setBookInfo] = useState<BookInfo | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [verses, setVerses] = useState<{ number: string; content: string; reference: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [fontSize, setFontSize] = useState(16);

  const increaseFontSize = () => setFontSize((s) => Math.min(s + 2, 28));
  const decreaseFontSize = () => setFontSize((s) => Math.max(s - 2, 12));

  const bookNames = locale === "pt" ? BOOK_NAMES_PT : BOOK_NAMES_EN;

  // Load versions
  useEffect(() => {
    fetch(`${API_URL}/api/church/${slug}/bible/versions?locale=${locale}`)
      .then((r) => r.json())
      .then((d) => {
        const v = Array.isArray(d) ? d : [];
        setVersions(v);
        // If only one version, auto-select
        if (v.length === 1) {
          selectVersion(v[0]);
        } else {
          const def = v.find((x: BibleVersion) => x.is_default);
          if (def) selectVersion(def);
        }
      })
      .catch(() => {});
  }, [locale]);

  const selectVersion = useCallback(async (v: BibleVersion) => {
    setSelectedVersion(v);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/church/${slug}/bible/${v.bible_id}/books`);
      const data = await res.json();
      setBooks(data.books || []);
      setView("books");
    } catch {
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const selectBook = async (bookId: string) => {
    setSelectedBook(bookId);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/church/${slug}/bible/${selectedVersion!.bible_id}/books/${bookId}`);
      const data = await res.json();
      setBookInfo(data);
      setView("chapters");
    } catch {
      setBookInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const selectChapter = async (_passageId: string, chapterId: string) => {
    setSelectedChapter(chapterId);
    setLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/church/${slug}/bible/${selectedVersion!.bible_id}/chapter/${selectedBook}/${chapterId}`
      );
      const data = await res.json();
      setVerses(data.verses || []);
      setView("reading");
    } catch {
      setVerses([]);
    } finally {
      setLoading(false);
    }
  };

  // Load saved state on mount
  useEffect(() => {
    if (view === "reading" && selectedBook && selectedChapter) {
      const bms = getBookmarks();
      const saved = new Set(
        bms.filter(b => b.bookId === selectedBook && b.chapter === selectedChapter)
          .map(b => b.verseNum)
      );
      setSavedVerses(saved);
    }
  }, [view, selectedBook, selectedChapter]);

  const toggleBookmark = (verse: { number: string; content: string; reference: string }) => {
    if (!selectedBook || !selectedChapter || !selectedVersion) return;
    const key = verse.number;

    if (savedVerses.has(key)) {
      removeBookmark(selectedBook, selectedChapter, verse.number);
      setSavedVerses(prev => { const n = new Set(prev); n.delete(key); return n; });
    } else {
      saveBookmark({
        verseNum: verse.number,
        content: verse.content,
        reference: verse.reference,
        bookId: selectedBook,
        chapter: selectedChapter,
        bookName: bookNames[selectedBook] || selectedBook,
        versionAbbr: selectedVersion.abbreviation,
        savedAt: new Date().toISOString(),
      });
      setSavedVerses(prev => new Set(prev).add(key));
    }
  };

  const goBack = () => {
    if (view === "reading") { setView("chapters"); setVerses([]); }
    else if (view === "chapters") { setView("books"); setBookInfo(null); }
    else if (view === "search") { setView("books"); }
    else if (view === "bookmarks") { setView("books"); }
    else if (view === "books") {
      if (versions.length > 1) { setView("versions"); setBooks([]); }
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedVersion || !searchQuery.trim()) return;

    const result = parseSearchQuery(searchQuery, bookNames);
    if (!result) return;

    setLoading(true);
    try {
      // Load the book info
      const res = await fetch(`${API_URL}/api/church/${slug}/bible/${selectedVersion.bible_id}/books/${result.bookId}`);
      const data = await res.json();
      setSelectedBook(result.bookId);
      setBookInfo(data);

      if (result.chapter && data.chapters) {
        const ch = data.chapters.find((c: any) => c.title === result.chapter);
        if (ch) {
          await selectChapter(ch.passage_id, ch.title);
          return;
        }
      }
      setView("chapters");
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const otBooks = books.filter((b) => OT_BOOKS.includes(b));
  const ntBooks = books.filter((b) => NT_BOOKS.includes(b));

  return (
    <div className="px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        {view !== "versions" && (view !== "books" || versions.length > 1) && (
          <button onClick={goBack} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] active:scale-90">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {view === "reading" && selectedBook
              ? `${bookNames[selectedBook] || selectedBook} ${selectedChapter}`
              : view === "chapters" && selectedBook
              ? bookNames[selectedBook] || selectedBook
              : t("title")}
          </h1>
          {selectedVersion && view !== "versions" && (
            <p className="text-xs text-[var(--color-text-muted)]">{selectedVersion.abbreviation}</p>
          )}
        </div>
        {/* Font size controls */}
        {view === "reading" && (
          <div className="flex items-center gap-1">
            <button
              onClick={decreaseFontSize}
              disabled={fontSize <= 12}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-surface)] shadow-sm border border-[var(--color-border)] text-sm font-bold text-[var(--color-text-muted)] disabled:opacity-30 active:scale-90"
            >
              A-
            </button>
            <button
              onClick={increaseFontSize}
              disabled={fontSize >= 28}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-surface)] shadow-sm border border-[var(--color-border)] text-sm font-bold text-[var(--color-text-muted)] disabled:opacity-30 active:scale-90"
            >
              A+
            </button>
          </div>
        )}
        {/* Bookmarks button */}
        {selectedVersion && view !== "versions" && view !== "bookmarks" && (
          <button
            onClick={() => { setBookmarks(getBookmarks()); setView("bookmarks"); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[var(--color-surface)] shadow-sm border border-[var(--color-border)] text-[var(--color-text-muted)] active:scale-90"
            title={tBookmarks("title")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
            </svg>
          </button>
        )}
        {/* Version switcher */}
        {versions.length > 1 && view !== "versions" && (
          <button
            onClick={() => { setView("versions"); setBooks([]); setBookInfo(null); setVerses([]); }}
            className="px-3 py-1.5 text-xs font-semibold bg-[var(--color-surface)] rounded-lg shadow-sm border border-[var(--color-border)] text-[var(--color-primary)]"
          >
            {selectedVersion?.abbreviation || t("version")}
          </button>
        )}
      </div>

      {/* Search bar (visible when a version is selected) */}
      {selectedVersion && view !== "versions" && view !== "reading" && (
        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={tSearch("placeholder")}
            className="flex-1 px-4 py-2.5 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-[var(--color-primary)] text-[var(--color-heading)] rounded-xl text-sm font-semibold active:scale-95 transition-transform"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>
      )}

      {loading && (
        <p className="text-center text-[var(--color-text-muted)] py-8">{tCommon("loading")}</p>
      )}

      {/* Version selector */}
      {view === "versions" && !loading && (
        <div className="flex flex-col gap-2">
          {versions.length === 0 ? (
            <p className="text-center text-[var(--color-text-muted)] py-8">{t("noVersions")}</p>
          ) : (
            versions.map((v) => (
              <button
                key={v.id}
                onClick={() => selectVersion(v)}
                className="flex items-center justify-between bg-[var(--color-surface)] rounded-2xl p-4 shadow-sm active:scale-[0.98] transition-transform text-left"
              >
                <div>
                  <p className="text-base font-semibold">{v.label}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">{v.abbreviation}</p>
                </div>
                {v.is_default && (
                  <span className="px-2 py-0.5 bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-xs font-semibold rounded-full">
                    {t("default")}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}

      {/* Books list */}
      {view === "books" && !loading && (
        <div>
          {otBooks.length > 0 && (
            <>
              <p className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-wider mb-3">{t("oldTestament")}</p>
              <div className="grid grid-cols-2 gap-2 mb-6">
                {otBooks.map((b) => (
                  <button
                    key={b}
                    onClick={() => selectBook(b)}
                    className="bg-[var(--color-surface)] rounded-xl p-3 shadow-sm text-left active:scale-[0.98] transition-transform"
                  >
                    <p className="text-sm font-medium">{bookNames[b] || b}</p>
                  </button>
                ))}
              </div>
            </>
          )}
          {ntBooks.length > 0 && (
            <>
              <p className="text-xs font-semibold text-[var(--color-accent)] uppercase tracking-wider mb-3">{t("newTestament")}</p>
              <div className="grid grid-cols-2 gap-2">
                {ntBooks.map((b) => (
                  <button
                    key={b}
                    onClick={() => selectBook(b)}
                    className="bg-[var(--color-surface)] rounded-xl p-3 shadow-sm text-left active:scale-[0.98] transition-transform"
                  >
                    <p className="text-sm font-medium">{bookNames[b] || b}</p>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Chapters grid */}
      {view === "chapters" && !loading && bookInfo && (
        <div className="grid grid-cols-5 gap-2">
          {bookInfo.chapters
            .filter((ch) => ch.id !== "INTRO")
            .map((ch) => (
              <button
                key={ch.id}
                onClick={() => selectChapter(ch.passage_id, ch.title)}
                className="aspect-square bg-[var(--color-surface)] rounded-xl shadow-sm flex items-center justify-center text-base font-semibold active:scale-90 transition-transform hover:bg-[var(--color-primary)] hover:text-[var(--color-card-dark)]"
              >
                {ch.title}
              </button>
            ))}
        </div>
      )}

      {/* Reading view — verse by verse */}
      {view === "reading" && !loading && verses.length > 0 && (
        <div className="bg-[var(--color-surface)] rounded-2xl p-5 shadow-sm">
          <div className="space-y-1">
            {verses.map((v) => (
              <div
                key={v.number}
                className={`group flex items-start gap-1 py-0.5 rounded-lg cursor-pointer transition-colors ${
                  savedVerses.has(v.number) ? "bg-[var(--color-primary)]/10" : "hover:bg-[var(--color-surface-alt)]"
                }`}
                onClick={() => toggleBookmark(v)}
              >
                <p
                  className="leading-relaxed text-[var(--color-text)] transition-[font-size] duration-200 flex-1"
                  style={{ fontSize: `${fontSize}px` }}
                >
                  <span
                    className="font-bold text-[var(--color-primary)] align-super mr-1"
                    style={{ fontSize: `${Math.max(fontSize - 4, 10)}px` }}
                  >
                    {v.number}
                  </span>
                  {v.content}
                </p>
                <svg
                  width="14" height="14" viewBox="0 0 24 24"
                  fill={savedVerses.has(v.number) ? "var(--color-primary)" : "none"}
                  stroke={savedVerses.has(v.number) ? "var(--color-primary)" : "currentColor"}
                  strokeWidth="2"
                  className="mt-1.5 opacity-0 group-hover:opacity-60 shrink-0 transition-opacity"
                  style={savedVerses.has(v.number) ? { opacity: 1 } : {}}
                >
                  <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z" />
                </svg>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-4 text-right opacity-60">
            from YouVersion
          </p>
        </div>
      )}

      {/* Bookmarks view */}
      {view === "bookmarks" && !loading && (
        <div>
          <h2 className="text-lg font-bold mb-3">{tBookmarks("title")}</h2>
          {bookmarks.length === 0 ? (
            <p className="text-center text-[var(--color-text-muted)] py-8">{tBookmarks("noBookmarks")}</p>
          ) : (
            <div className="flex flex-col gap-2">
              {bookmarks.map((bm, i) => (
                <div key={i} className="bg-[var(--color-surface)] rounded-xl p-4 shadow-sm relative">
                  <p className="text-xs font-semibold text-[var(--color-primary)] uppercase tracking-wider mb-1">
                    {bm.bookName} {bm.chapter}:{bm.verseNum} ({bm.versionAbbr})
                  </p>
                  <p className="text-sm text-[var(--color-text)] leading-relaxed">{bm.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <ShareButton
                      title={`${bm.bookName} ${bm.chapter}:${bm.verseNum}`}
                      text={`"${bm.content}" — ${bm.reference}`}
                      className="text-xs"
                    />
                    <button
                      onClick={() => {
                        removeBookmark(bm.bookId, bm.chapter, bm.verseNum);
                        setBookmarks(getBookmarks());
                      }}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      {tBookmarks("remove")}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
