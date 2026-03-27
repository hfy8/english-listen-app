import { create } from 'zustand';
import { storage } from '../utils/storage';
import type { UserProfile, LearningProgress, UserRewards, AppSettings, WrongWord } from '../utils/storage';
import type { Word, LevelId, ThemeId } from '../data/vocabulary';

export interface PracticeSession {
  words: Word[];
  currentIndex: number;
  answers: { wordId: string; correct: boolean; userAnswer: string }[];
  startTime: number;
  isFinished: boolean;
}

interface AppState {
  // User
  profile: UserProfile;
  progress: LearningProgress;
  rewards: UserRewards;
  settings: AppSettings;

  // Practice session
  session: PracticeSession | null;
  currentLevel: LevelId | null;
  currentTheme: ThemeId | null;

  // UI state
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[];

  // Actions - Profile
  updateProfile: (profile: Partial<UserProfile>) => void;

  // Actions - Progress
  addCompletedWord: (wordId: string) => void;
  addWrongWord: (word: WrongWord) => void;
  removeWrongWord: (wordId: string) => void;
  updateWrongWordCount: (wordId: string, count: number) => void;
  updateStreak: () => void;

  // Actions - Rewards
  addPoints: (points: number) => void;
  addBadge: (badge: string) => void;
  addSticker: (sticker: string) => void;
  recordTestResult: (perfect: boolean) => void;

  // Actions - Settings
  updateSettings: (settings: Partial<AppSettings>) => void;

  // Actions - Session
  startSession: (words: Word[]) => void;
  answerWord: (wordId: string, correct: boolean, userAnswer: string) => void;
  nextWord: () => void;
  finishSession: () => void;

  // Actions - Level/Theme
  setCurrentLevel: (level: LevelId | null) => void;
  setCurrentTheme: (theme: ThemeId | null) => void;

  // Actions - Toast
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  profile: storage.getProfile(),
  progress: storage.getProgress(),
  rewards: storage.getRewards(),
  settings: storage.getSettings(),
  session: null,
  currentLevel: null,
  currentTheme: null,
  toasts: [],

  updateProfile: (partial) => {
    const updated = { ...get().profile, ...partial };
    set({ profile: updated });
    storage.setProfile(updated);
  },

  addCompletedWord: (wordId) => {
    const prog = get().progress;
    if (!prog.completedWords.includes(wordId)) {
      const updated = { ...prog, completedWords: [...prog.completedWords, wordId] };
      set({ progress: updated });
      storage.setProgress(updated);
    }
  },

  addWrongWord: (wrong) => {
    const prog = get().progress;
    const existing = prog.wrongWords.find((w) => w.word === wrong.word);
    if (existing) {
      // Already in wrong list, update
      const updated = {
        ...prog,
        wrongWords: prog.wrongWords.map((w) =>
          w.word === wrong.word ? { ...w, count: 0, wrongAnswer: wrong.wrongAnswer, lastWrongDate: wrong.lastWrongDate } : w
        ),
      };
      set({ progress: updated });
      storage.setProgress(updated);
    } else {
      const updated = { ...prog, wrongWords: [...prog.wrongWords, wrong] };
      set({ progress: updated });
      storage.setProgress(updated);
    }
  },

  removeWrongWord: (wordId) => {
    const prog = get().progress;
    const updated = {
      ...prog,
      wrongWords: prog.wrongWords.filter((w) => w.word !== wordId),
    };
    set({ progress: updated });
    storage.setProgress(updated);
  },

  updateWrongWordCount: (wordId, count) => {
    const prog = get().progress;
    const updated = {
      ...prog,
      wrongWords: prog.wrongWords.map((w) => (w.word === wordId ? { ...w, count } : w)),
    };
    set({ progress: updated });
    storage.setProgress(updated);
  },

  updateStreak: () => {
    const today = new Date().toISOString().split('T')[0];
    const lastLogin = storage.getLastLogin();
    let prog = get().progress;

    if (lastLogin === today) return; // already logged today

    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const newStreak = lastLogin === yesterday ? prog.streakDays + 1 : 1;

    prog = { ...prog, streakDays: newStreak, lastPracticeDate: today };
    set({ progress: prog });
    storage.setProgress(prog);
    storage.setLastLogin(today);

    // Streak bonus
    if (newStreak > prog.streakDays) {
      get().addPoints(5);
      get().showToast(`🔥 连续学习 ${newStreak} 天！+5 积分`, 'success');
    }
  },

  addPoints: (points) => {
    const rew = get().rewards;
    const newPoints = rew.points + points;
    const newBadges = checkBadgeUnlock(rew.badges, newPoints, rew.perfectTests);
    const updated = { ...rew, points: newPoints, badges: newBadges };
    set({ rewards: updated });
    storage.setRewards(updated);
  },

  addBadge: (badge) => {
    const rew = get().rewards;
    if (!rew.badges.includes(badge)) {
      const updated = { ...rew, badges: [...rew.badges, badge] };
      set({ rewards: updated });
      storage.setRewards(updated);
      get().showToast(`🏆 获得新徽章！`, 'success');
    }
  },

  addSticker: (sticker) => {
    const rew = get().rewards;
    const updated = {
      ...rew,
      stickers: { ...rew.stickers, [sticker]: (rew.stickers[sticker] || 0) + 1 },
    };
    set({ rewards: updated });
    storage.setRewards(updated);
  },

  recordTestResult: (perfect) => {
    const rew = get().rewards;
    const updated = {
      ...rew,
      totalTests: rew.totalTests + 1,
      perfectTests: perfect ? rew.perfectTests + 1 : rew.perfectTests,
    };
    set({ rewards: updated });
    storage.setRewards(updated);
  },

  updateSettings: (partial) => {
    const updated = { ...get().settings, ...partial };
    set({ settings: updated });
    storage.setSettings(updated);
  },

  startSession: (words) => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    set({
      session: {
        words: shuffled,
        currentIndex: 0,
        answers: [],
        startTime: Date.now(),
        isFinished: false,
      },
    });
  },

  answerWord: (wordId, correct, userAnswer) => {
    const sess = get().session;
    if (!sess) return;
    set({
      session: {
        ...sess,
        answers: [...sess.answers, { wordId, correct, userAnswer }],
      },
    });
  },

  nextWord: () => {
    const sess = get().session;
    if (!sess) return;
    const nextIndex = sess.currentIndex + 1;
    if (nextIndex >= sess.words.length) {
      set({ session: { ...sess, isFinished: true } });
    } else {
      set({ session: { ...sess, currentIndex: nextIndex } });
    }
  },

  finishSession: () => {
    set({ session: null });
  },

  setCurrentLevel: (level) => set({ currentLevel: level }),
  setCurrentTheme: (theme) => set({ currentTheme: theme }),

  showToast: (message, type = 'info') => {
    const id = Date.now().toString();
    set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
    setTimeout(() => get().removeToast(id), 2500);
  },

  removeToast: (id) => {
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
  },
}));

// Badge unlock logic
function checkBadgeUnlock(existing: string[], points: number, perfectTests: number): string[] {
  const newBadges = [...existing];
  const badgeRules: [string, number, number?][] = [
    ['first_lesson', 0], // unlocked by first lesson
    ['learner_100', 100],
    ['streak_3', 0], // streak_3 checked separately
    ['streak_7', 0], // streak_7 checked separately
    ['streak_30', 0],
    ['word_master', 0], // word_master: completed a level
    ['perfect_3', 0, 3],
    ['persistence', 1000],
    ['doctor', 0], // completed all levels
    ['super_king', 5000],
  ];

  badgeRules.forEach(([badge, minPoints, minPerfects]) => {
    if (!newBadges.includes(badge)) {
      if (minPerfects !== undefined && perfectTests >= minPerfects) {
        newBadges.push(badge);
      } else if (minPoints > 0 && points >= minPoints) {
        newBadges.push(badge);
      }
    }
  });

  return newBadges;
}

export default useStore;
