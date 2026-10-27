import { CommentItem } from '../types/news';
export type { CommentItem };

const STORAGE_KEY = 'kolom24_guest_comments';

export const initialComments: CommentItem[] = [
  {
    id: 'comm-init-1',
    articleId: 'lead-1',
    articleTitle: 'অন্তর্বর্তী সরকারের রোডম্যাপ ঘোষণা: ২০২৬ সালের মধ্যে নির্বাচন কমিশন সংস্কার সম্পন্ন করার প্রত্যয়',
    name: 'মো. রফিকুল ইসলাম',
    address: 'মিরপুর-১০, ঢাকা',
    phone: '01711-234567',
    text: 'সুষ্ঠু ও নিরপেক্ষ নির্বাচনের জন্য প্রাতিষ্ঠানিক সংস্কার অত্যন্ত জরুরি। আশা করি দ্রুত কার্যকর পদক্ষেপ দৃশ্যমান হবে।',
    time: '১ ঘণ্টা আগে',
    date: '৮ অক্টোবর ২০২৬',
    likes: 14,
    status: 'approved',
  },
  {
    id: 'comm-init-2',
    articleId: 'lead-1',
    articleTitle: 'অন্তর্বর্তী সরকারের রোডম্যাপ ঘোষণা: ২০২৬ সালের মধ্যে নির্বাচন কমিশন সংস্কার সম্পন্ন করার প্রত্যয়',
    name: 'ফারহানা ইয়াসমিন',
    address: 'খুলনা সদর',
    phone: '01923-456789',
    text: 'দেশের গণতান্ত্রিক ব্যবস্থার উন্নয়নে এ ধরনের ইতিবাচক উদ্যোগ অবশ্যই প্রশংসনীয়।',
    time: '২ ঘণ্টা আগে',
    date: '৮ অক্টোবর ২০২৬',
    likes: 8,
    status: 'approved',
  },
  {
    id: 'comm-init-3',
    articleId: 'lead-1',
    articleTitle: 'অন্তর্বর্তী সরকারের রোডম্যাপ ঘোষণা: ২০২৬ সালের মধ্যে নির্বাচন কমিশন সংস্কার সম্পন্ন করার প্রত্যয়',
    name: 'কাজী আশরাফুল আলম',
    address: 'নবাবগঞ্জ, দিনাজপুর',
    phone: '01819-876543',
    text: 'তৃণমূল ভোটারদের মতামত ও নিরাপত্তা নিশ্চিত করা না গেলে কোনো সংস্কারই দীর্ঘস্থায়ী হবে না।',
    time: '১০ মিনিট আগে',
    date: '৮ অক্টোবর ২০২৬',
    likes: 2,
    status: 'pending', // Pending moderation
  },
  {
    id: 'comm-init-4',
    articleId: 'art-nat-1',
    articleTitle: 'পদ্মা সেতুতে বিশ্বমানের আলোকসজ্জা উদ্বোধন',
    name: 'সোহেল রানা',
    address: 'শিবচর, মাদারীপুর',
    phone: '01678-901234',
    text: 'পদ্মা সেতু আমাদের জাতীয় গর্ব। রাতের আলোয় সেতুটি আরও দৃষ্টিনন্দন হয়ে উঠেছে।',
    time: '২৫ মিনিট আগে',
    date: '৮ অক্টোবর ২০২৬',
    likes: 1,
    status: 'pending', // Pending moderation
  },
];

export function getStoredComments(): CommentItem[] {
  if (typeof window === 'undefined') return initialComments;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialComments));
      return initialComments;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : initialComments;
  } catch {
    return initialComments;
  }
}

export function saveStoredComments(comments: CommentItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
    window.dispatchEvent(new CustomEvent('kolom24_comments_updated', { detail: comments }));
  } catch (err) {
    console.error('Failed to save comments', err);
  }
}

export function addGuestComment(comment: Omit<CommentItem, 'id' | 'status' | 'likes' | 'time'>): CommentItem {
  const all = getStoredComments();
  const newComment: CommentItem = {
    ...comment,
    id: `comm-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    status: 'pending', // Strictly saved to moderation queue as pending
    likes: 0,
    time: 'এইমাত্র',
  };
  const updated = [newComment, ...all];
  saveStoredComments(updated);
  return newComment;
}

export function approveComment(commentId: string): void {
  const all = getStoredComments();
  const updated = all.map(c => c.id === commentId ? { ...c, status: 'approved' as const } : c);
  saveStoredComments(updated);
}

export function rejectComment(commentId: string): void {
  const all = getStoredComments();
  const updated = all.map(c => c.id === commentId ? { ...c, status: 'rejected' as const } : c);
  saveStoredComments(updated);
}

export function deleteComment(commentId: string): void {
  const all = getStoredComments();
  const updated = all.filter(c => c.id !== commentId);
  saveStoredComments(updated);
}

export function getApprovedCommentsForArticle(articleId: string): CommentItem[] {
  const all = getStoredComments();
  return all.filter(c => c.articleId === articleId && c.status === 'approved');
}

export function getPendingComments(): CommentItem[] {
  const all = getStoredComments();
  return all.filter(c => c.status === 'pending');
}
