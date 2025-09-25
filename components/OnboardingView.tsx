import React, { useState, useMemo } from 'react';
import { UserProfile, Gender, ActivityLevel, Goal, Macros } from '../types';

interface OnboardingViewProps {
  onSave: (profile: UserProfile) => void;
}

const activityMultipliers: { [key in ActivityLevel]: number } = {
  [ActivityLevel.SEDENTARY]: 1.2,
  [ActivityLevel.LIGHT]: 1.375,
  [ActivityLevel.MODERATE]: 1.55,
  [ActivityLevel.VERY_ACTIVE]: 1.725,
  [ActivityLevel.EXTRA_ACTIVE]: 1.9,
};

const goalAdjustments: { [key in Goal]: number } = {
    [Goal.LOSE]: -500,
    [Goal.MAINTAIN]: 0,
    [Goal.GAIN]: 300,
};

const calculateBmrAndTdee = (
    profile: Omit<UserProfile, 'calorieGoal' | 'macroGoals'>, 
): { bmr: number, tdee: number } => {
  const { age, weight, height, gender, activityLevel } = profile;

  if(!age || !weight || !height) return { bmr: 0, tdee: 0};

  let bmr: number;
  if (gender === Gender.MALE) {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  const tdee = bmr * activityMultipliers[activityLevel];
  return { bmr, tdee };
};

const calculateMacroGoals = (calorieGoal: number): Macros => {
    // Standard 40% Carbs, 30% Protein, 30% Fat split
    const carbs = Math.round((calorieGoal * 0.40) / 4);
    const protein = Math.round((calorieGoal * 0.30) / 4);
    const fats = Math.round((calorieGoal * 0.30) / 9);
    return { protein, carbs, fats };
};


const FormLabel: React.FC<{ htmlFor: string, children: React.ReactNode }> = ({htmlFor, children}) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
);

const TextInput: React.FC<{id: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string}> = ({id, value, onChange, placeholder}) => (
    <input 
        type="number" 
        id={id} 
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800"
    />
);

const SelectInput: React.FC<{id: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, children: React.ReactNode}> = ({id, value, onChange, children}) => (
    <select 
        id={id}
        value={value}
        onChange={onChange}
        className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 appearance-none"
    >
        {children}
    </select>
);

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onSave }) => {
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(ActivityLevel.LIGHT);
  const [goal, setGoal] = useState<Goal>(Goal.MAINTAIN);

  const recommendedCalories = useMemo(() => {
    const { tdee } = calculateBmrAndTdee({ 
        age: Number(age), 
        weight: Number(weight), 
        height: Number(height), 
        gender, 
        activityLevel 
    });
    if (tdee === 0) return 2000;
    const goalAdjustedTdee = tdee + goalAdjustments[goal];
    return Math.round(goalAdjustedTdee / 10) * 10;
  }, [age, weight, height, gender, activityLevel, goal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMacroGoals = calculateMacroGoals(recommendedCalories);
    onSave({
      age: Number(age),
      weight: Number(weight),
      height: Number(height),
      gender,
      activityLevel,
      calorieGoal: recommendedCalories,
      macroGoals: finalMacroGoals,
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white p-6 rounded-2xl shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-1">Welcome!</h2>
        <p className="text-center text-gray-500 mb-6">Let's set up your daily calorie goal.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <FormLabel htmlFor="age">Age</FormLabel>
                    <TextInput id="age" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g., 25" />
                </div>
                 <div>
                    <FormLabel htmlFor="weight">Weight (kg)</FormLabel>
                    <TextInput id="weight" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="e.g., 70" />
                </div>
                 <div>
                    <FormLabel htmlFor="height">Height (cm)</FormLabel>
                    <TextInput id="height" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="e.g., 180" />
                </div>
            </div>

            <div>
                <FormLabel htmlFor="gender">Gender</FormLabel>
                <SelectInput id="gender" value={gender} onChange={(e) => setGender(e.target.value as Gender)}>
                    <option value={Gender.MALE}>Male</option>
                    <option value={Gender.FEMALE}>Female</option>
                </SelectInput>
            </div>

            <div>
                <FormLabel htmlFor="activity">Activity Level</FormLabel>
                <SelectInput id="activity" value={activityLevel} onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}>
                    <option value={ActivityLevel.SEDENTARY}>Sedentary (little or no exercise)</option>
                    <option value={ActivityLevel.LIGHT}>Lightly Active (1-3 days/week)</option>
                    <option value={ActivityLevel.MODERATE}>Moderately Active (3-5 days/week)</option>
                    <option value={ActivityLevel.VERY_ACTIVE}>Very Active (6-7 days/week)</option>
                    <option value={ActivityLevel.EXTRA_ACTIVE}>Extra Active (very hard exercise & physical job)</option>
                </SelectInput>
            </div>
            
            <div>
                <FormLabel htmlFor="goal">Your Goal</FormLabel>
                <SelectInput id="goal" value={goal} onChange={(e) => setGoal(e.target.value as Goal)}>
                    <option value={Goal.LOSE}>Lose Weight</option>
                    <option value={Goal.MAINTAIN}>Maintain Weight</option>
                    <option value={Goal.GAIN}>Gain Weight</option>
                </SelectInput>
            </div>

            <div className="text-center bg-gray-100 p-4 rounded-lg border border-gray-200">
                <p className="text-gray-500">Recommended Daily Goal</p>
                <p className="text-3xl font-bold text-gray-800">{recommendedCalories} <span className="text-xl">kcal</span></p>
            </div>

            <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-300" disabled={!age || !weight || !height}>
                Save & Start Tracking
            </button>
        </form>
    </div>
  );
};