export interface Macros {
  protein: number; // in grams
  carbs: number; // in grams
  fats: number; // in grams
}

export interface MealAnalysis {
  mealName: string;
  ingredients: string[];
  calories: number;
  macros: Macros;
  healthScore: number; // A score from 1 to 10
  reasoning: string;
}

export interface HistoryItem {
  id: string;
  image: string;
  analysis: MealAnalysis;
  createdAt: string; // ISO date string
}

export enum Gender {
    MALE = 'male',
    FEMALE = 'female',
}

export enum ActivityLevel {
    SEDENTARY = 'sedentary', // little or no exercise
    LIGHT = 'light', // light exercise/sports 1-3 days/week
    MODERATE = 'moderate', // moderate exercise/sports 3-5 days/week
    VERY_ACTIVE = 'very_active', // hard exercise/sports 6-7 days a week
    EXTRA_ACTIVE = 'extra_active', // very hard exercise/sports & physical job
}

export enum Goal {
    LOSE = 'lose',
    MAINTAIN = 'maintain',
    GAIN = 'gain',
}

export interface UserProfile {
    age: number;
    weight: number; // in kg
    height: number; // in cm
    gender: Gender;
    activityLevel: ActivityLevel;
    calorieGoal: number;
    macroGoals: Macros;
}

export enum View {
  LOGIN = 'login',
  SIGNUP = 'signup',
  ONBOARDING = 'onboarding',
  DASHBOARD = 'dashboard',
  CAMERA = 'camera',
  ANALYSIS = 'analysis',
  HISTORY = 'history',
  ANALYTICS = 'analytics',
  SETTINGS = 'settings',
  CHAT = 'chat',
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
