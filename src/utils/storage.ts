const KEYS = {
  USER_PROFILE: 'user_profile',
  LEARNING_PROGRESS: 'learning_progress',
  USER_REWARDS: 'user_rewards',
  APP_SETTINGS: 'app_settings',
  LAST_LOGIN_DATE: 'last_login_date',
  PRACTICE_PARAMS: 'practice_params',
} as const;

export interface PendingPracticeParams {
  words: { id: string; word: string; chinese: string; phonetic: string; theme: string; level: string }[];
  level: string;
  theme: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  level: number;
}

export interface WrongWord {
  word: string;
  chinese: string;
  phonetic: string;
  wrongAnswer: string;
  level: string;
  theme: string;
  count: number; // 连续答对次数
  lastWrongDate: string;
}

export interface LearningProgress {
  completedWords: string[];
  wrongWords: WrongWord[];
  totalAnswered: number;
  totalCorrect: number;
  streakDays: number;
  lastPracticeDate: string | null;
}

export interface UserRewards {
  points: number;
  badges: string[];
  stickers: Record<string, number>;
  totalCorrect: number;
  totalTests: number;
  perfectTests: number;
}

export interface AppSettings {
  sound: boolean;
  music: boolean;
  ttsSpeed: number;
  dailyGoal: number;
  showPhonetic: boolean;
  showHint: boolean;
}

export const defaultRewards: UserRewards = {
  points: 0,
  badges: [],
  stickers: {},
  totalCorrect: 0,
  totalTests: 0,
  perfectTests: 0,
};

export const defaultProgress: LearningProgress = {
  completedWords: [],
  wrongWords: [],
  totalAnswered: 0,
  totalCorrect: 0,
  streakDays: 0,
  lastPracticeDate: null,
};

export const defaultSettings: AppSettings = {
  sound: true,
  music: false,
  ttsSpeed: 0.8,
  dailyGoal: 10,
  showPhonetic: true,
  showHint: true,
};

export const defaultProfile: UserProfile = {
  name: '小朋友',
  avatar: '🧒',
  level: 1,
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

// User Profile
export const storage = {
  getProfile: () => getItem<UserProfile>(KEYS.USER_PROFILE, defaultProfile),
  setProfile: (profile: UserProfile) => setItem(KEYS.USER_PROFILE, profile),

  getProgress: () => getItem<LearningProgress>(KEYS.LEARNING_PROGRESS, defaultProgress),
  setProgress: (progress: LearningProgress) => setItem(KEYS.LEARNING_PROGRESS, progress),

  getRewards: () => getItem<UserRewards>(KEYS.USER_REWARDS, defaultRewards),
  setRewards: (rewards: UserRewards) => setItem(KEYS.USER_REWARDS, rewards),

  getSettings: () => getItem<AppSettings>(KEYS.APP_SETTINGS, defaultSettings),
  setSettings: (settings: AppSettings) => setItem(KEYS.APP_SETTINGS, settings),

  getLastLogin: () => localStorage.getItem(KEYS.LAST_LOGIN_DATE),
  setLastLogin: (date: string) => localStorage.setItem(KEYS.LAST_LOGIN_DATE, date),

  // Practice params — persisted to survive WebView recreation
  getPracticeParams: (): PendingPracticeParams | null => {
    const fallback: PendingPracticeParams | null = null;
    return getItem<PendingPracticeParams | null>(KEYS.PRACTICE_PARAMS, fallback);
  },
  setPracticeParams: (params: PendingPracticeParams) =>
    setItem(KEYS.PRACTICE_PARAMS, params),
  clearPracticeParams: () => {
    try { localStorage.removeItem(KEYS.PRACTICE_PARAMS); } catch { /* noop */ }
  },

  clearAll: () => {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};

export default storage;
