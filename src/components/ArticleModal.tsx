import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Eye, 
  Share2, 
  Bookmark, 
  Volume2, 
  VolumeX, 
  ThumbsUp, 
  MessageSquare, 
  Send, 
  Facebook, 
  Twitter, 
  Copy, 
  Check, 
  ArrowLeft,
  Layers
} from 'lucide-react';
import { Article, Comment } from '../types/news';
import { useSiteConfig } from '../context/SiteConfigContext';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  onSelectRelated: (article: Article) => void;
  relatedArticles: Article[];
  darkMode: boolean;
  lang: 'bn' | 'en';
}

export const ArticleModal: React.FC<ArticleModalProps> = ({
  article,
  onClose,
  onSelectRelated,
  relatedArticles,
  darkMode,
  lang,
}) => {
  const { siteName } = useSiteConfig();
  if (!article) return null;

  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 'c1',
      author: 'কবির আহমেদ',
      text: 'আদালতের কার্যক্রম সুষ্ঠুভাবে পরিচালিত হওয়া এবং সাধারণ মানুষের ন্যায়বিচার পাওয়ার অধিকার নিশ্চিত হওয়া সবার প্রত্যাশা।',
      time: '১০ মিনিট আগে',
      likes: 14,
    },
    {
      id: 'c2',
      author: 'ফারহানা ইসলাম',
      text: 'খবরটির বিস্তারিত বর্ণনার জন্য ধন্যবাদ সম্পাদকীয় টিমকে। নিরপেক্ষ সাংবাদিকতা অব্যাহত থাকুক।',
      time: '২৫ মিনিট আগে',
      likes: 8,
    },
  ]);
  const [newComment, setNewComment] = useState('');
  const [commenterName, setCommenterName] = useState('');

  // Speech synthesis for audio reader
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isPlayingAudio && article) {
      window.speechSynthesis.cancel();
      const textToRead = `${article.title}. ${article.excerpt || article.content.substring(0, 350)}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'bn-BD';
      utterance.rate = 0.95;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      window.speechSynthesis.cancel();
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isPlayingAudio, article]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const item: Comment = {
      id: Date.now().toString(),
      author: commenterName.trim() || 'পাঠক',
      text: newComment.trim(),
      time: 'এইমাত্র',
      likes: 0,
    };
    setComments([item, ...comments]);
    setNewComment('');
  };

  const getFontSizeClass = () => {
    if (fontSize === 'large') return 'text-lg md:text-xl leading-relaxed';
    if (fontSize === 'xlarge') return 'text-xl md:text-2xl leading-loose';
    return 'text-base md:text-lg leading-relaxed';
  };

  const seriesArticles = article?.seriesName
    ? [article, ...relatedArticles.filter(a => a.seriesName?.trim() === article.seriesName?.trim() && a.id !== article.id)]
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className={`relative w-full max-w-4xl rounded-lg shadow-2xl overflow-hidden my-auto border transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Top Bar */}
        <div className={`sticky top-0 z-20 px-4 py-3 flex items-center justify-between border-b backdrop-blur-md ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
        }`}>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-bangla font-semibold text-red-600 px-2 py-0.5 rounded bg-red-50 dark:bg-red-950/40">
              {article.category}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Font Size Adjuster */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded px-1.5 py-1 text-xs font-bangla">
              <span className="text-slate-400 text-[10px] mr-1">ফন্ট:</span>
              <button
                onClick={() => setFontSize('normal')}
                className={`px-1.5 py-0.5 rounded ${fontSize === 'normal' ? 'bg-white dark:bg-slate-700 shadow-xs font-bold' : ''}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-1.5 py-0.5 rounded ${fontSize === 'large' ? 'bg-white dark:bg-slate-700 shadow-xs font-bold' : ''}`}
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('xlarge')}
                className={`px-1.5 py-0.5 rounded ${fontSize === 'xlarge' ? 'bg-white dark:bg-slate-700 shadow-xs font-bold' : ''}`}
              >
                A++
              </button>
            </div>

            {/* Audio Reader Simulation */}
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bangla font-medium transition-colors ${
                isPlayingAudio 
                  ? 'bg-red-600 text-white' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-red-600" />}
              <span>{isPlayingAudio ? 'থামুন' : 'অডিও শুনুন'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Audio Player Active Ribbon */}
        {isPlayingAudio && (
          <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between text-xs font-bangla animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>{siteName} স্মার্ট ভয়েস রিডার: সংবাদটি পাঠ করা হচ্ছে...</span>
            </div>
            <div className="w-32 bg-red-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-white h-full w-2/3 animate-pulse" />
            </div>
          </div>
        )}

        {/* Article Body Content */}
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
          {/* Shoulder, Headline & Sub-Headline */}
          <div className="space-y-2">
            {article.shoulder && (
              <span className="inline-block px-2.5 py-0.5 rounded bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 font-extrabold font-solaiman uppercase tracking-wider text-xs border border-red-300 dark:border-red-800">
                {article.shoulder}
              </span>
            )}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-bangla text-slate-900 dark:text-white leading-tight">
              {lang === 'bn' ? article.title : (article.titleEn || article.title)}
            </h1>
            {article.subHeadline && (
              <p className="text-base md:text-lg font-bold font-solaiman text-slate-600 dark:text-slate-300 leading-snug">
                {article.subHeadline}
              </p>
            )}
          </div>

          {/* CHAIN NEWS / SERIES BANNER */}
          {article.seriesName && (
            <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/40 space-y-3 font-solaiman">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-indigo-600 text-white"><Layers className="w-4 h-4" /></span>
                  <span className="font-extrabold text-indigo-950 dark:text-indigo-200 text-sm">
                    ধারাবাহিক সংবাদ সিরিজ: {article.seriesName}
                  </span>
                </div>
                {article.seriesPart && (
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-xs font-bold">
                    {article.seriesPart}
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-800 dark:text-indigo-300">
                এই ধারাবাহিক অনুসন্ধানের অন্যান্য পর্বগুলো পড়তে নিচে ক্লিক করুন:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {seriesArticles.map((sArt) => (
                  <button
                    key={sArt.id}
                    onClick={() => onSelectRelated(sArt)}
                    className={`p-2.5 rounded-lg border text-left text-xs flex items-start justify-between gap-2 transition-all ${
                      sArt.id === article.id 
                        ? 'bg-indigo-600 text-white border-indigo-700 font-bold shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-indigo-200 dark:border-indigo-700/60 hover:border-indigo-400 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <span className={`text-[10px] ${sArt.id === article.id ? 'text-indigo-200' : 'text-indigo-600 dark:text-indigo-400'} font-bold`}>
                        {sArt.seriesPart || 'পর্ব'}
                      </span>
                      <div className="line-clamp-2 leading-snug">{sArt.title}</div>
                    </div>
                    {sArt.id === article.id && (
                      <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded shrink-0">বর্তমান পর্ব</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Author Byline & Date */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-bangla">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center text-red-600 font-bold text-sm">
                ক২৪
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-slate-200">{article.author}</p>
                <div className="flex items-center gap-2 text-[11px]">
                  <span>প্রকাশ: {article.date}</span>
                  <span>•</span>
                  <span>{article.timeAgo}</span>
                </div>
              </div>
            </div>

            {/* Social Sharing */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs"
                title="Copy Link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'কপি হয়েছে' : 'লিংক'}</span>
              </button>
              <a
                href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                title="Share on Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}`}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                title="Share on X"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Featured Image */}
          <div className="space-y-2">
            <div className="relative rounded-lg overflow-hidden aspect-16/10 bg-slate-100 dark:bg-slate-800 shadow-xs">
              <img
                src={article.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
                alt={article.title}
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80';
                }}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            {article.imageCaption && (
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bangla italic">
                {article.imageCaption}
              </p>
            )}
          </div>

          {/* Excerpt Lead Paragraph */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-md border-l-4 border-red-600">
            <p className="font-bangla font-semibold text-slate-800 dark:text-slate-200 leading-relaxed text-sm md:text-base">
              {lang === 'bn' ? article.excerpt : (article.excerptEn || article.excerpt)}
            </p>
          </div>

          {/* Full Article Content */}
          <div className={`font-bangla font-normal text-slate-800 dark:text-slate-200 space-y-4 ${getFontSizeClass()}`}>
            {article.content.split('\n').map((line, idx) => {
              const trimmed = line.trim();
              if (!trimmed) return <div key={idx} className="h-2" />;
              if (trimmed.startsWith('## ')) {
                return (
                  <h2 key={idx} className="text-xl md:text-2xl font-bold pt-3 pb-1 border-b border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                    {trimmed.replace(/^##\s+/, '')}
                  </h2>
                );
              }
              if (trimmed.startsWith('### ')) {
                return (
                  <h3 key={idx} className="text-lg md:text-xl font-bold pt-2 text-red-600 dark:text-red-400">
                    {trimmed.replace(/^###\s+/, '')}
                  </h3>
                );
              }
              if (trimmed.startsWith('> ') || trimmed.startsWith('❝')) {
                return (
                  <blockquote key={idx} className="border-l-4 border-red-600 bg-red-50 dark:bg-red-950/20 pl-4 pr-3 py-2 my-2 italic rounded-r">
                    {trimmed.replace(/^[>❝]\s*/, '')}
                  </blockquote>
                );
              }
              if (trimmed.startsWith('• ') || trimmed.startsWith('- ')) {
                return <li key={idx} className="ml-5 list-disc py-0.5">{trimmed.replace(/^[•\-]\s*/, '')}</li>;
              }
              if (/^\d+\.\s+/.test(trimmed)) {
                return <li key={idx} className="ml-5 list-decimal py-0.5">{trimmed.replace(/^\d+\.\s*/, '')}</li>;
              }
              if (trimmed.startsWith('📌')) {
                return (
                  <div key={idx} className="p-3 my-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 rounded-md text-sm font-semibold">
                    {trimmed}
                  </div>
                );
              }
              return (
                <p key={idx} className="first-letter:text-2xl first-letter:font-bold first-letter:text-red-600 first-letter:mr-1 leading-relaxed text-justify">
                  {trimmed}
                </p>
              );
            })}

            {article.source && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 italic">
                তথ্যসূত্র ও কৃতজ্ঞতা: {article.source}
              </div>
            )}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bangla text-slate-400">ট্যাগ:</span>
              {article.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-bangla rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Comments Section */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-5">
            <h3 className="text-lg font-bold font-bangla text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-red-600" />
              <span>মন্তব্য সমূহ ({comments.length})</span>
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleAddComment} className="space-y-3">
              <input
                type="text"
                placeholder="আপনার নাম (ঐচ্ছিক)"
                value={commenterName}
                onChange={(e) => setCommenterName(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bangla rounded border border-slate-200 dark:border-slate-700 bg-transparent"
              />
              <textarea
                rows={3}
                placeholder="এই সংবাদের বিষয়ে আপনার মতামত লিখুন..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-3 text-xs md:text-sm font-bangla rounded border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-1 focus:ring-red-600 focus:outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold font-bangla rounded flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>মন্তব্য প্রকাশ করুন</span>
              </button>
            </form>

            {/* Comment List */}
            <div className="space-y-3 pt-2">
              {comments.map((c) => (
                <div 
                  key={c.id} 
                  className="p-3 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1 font-bangla"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{c.author}</span>
                    <span className="text-slate-400 text-[10px]">{c.time}</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300">{c.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Related Stories */}
          {relatedArticles.length > 0 && (
            <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4">
              <h3 className="text-lg font-bold font-bangla text-slate-900 dark:text-white">
                আরও পড়ুন
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {relatedArticles.slice(0, 3).map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelated(rel)}
                    className="group cursor-pointer space-y-2 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="aspect-16/10 rounded overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <img
                        src={rel.imageUrl?.trim() || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80'}
                        alt={rel.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <h4 className="text-xs font-bold font-bangla leading-snug text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 line-clamp-2">
                      {rel.title}
                    </h4>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
