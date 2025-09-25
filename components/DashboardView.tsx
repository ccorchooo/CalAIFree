import React, { useState } from 'react';
import type { UserProfile, HistoryItem, Macros } from '../types';
import { CaloriesIcon, ProteinIcon, CarbsIcon, FatsIcon } from './Icons';

interface DashboardViewProps {
    userProfile: UserProfile;
    todaysCalories: number;
    todaysMacros: Macros;
    todaysMeals: HistoryItem[];
    yesterdaysCalories: number;
    yesterdaysMacros: Macros;
    yesterdaysMeals: HistoryItem[];
    hasHistory: boolean;
    onSeeAllHistory: () => void;
}

const CalorieProgressArc: React.FC<{ consumed: number, goal: number }> = ({ consumed, goal }) => {
    const radius = 85;
    const circumference = 2 * Math.PI * radius;
    const progress = goal > 0 ? Math.min(consumed / goal, 1) : 0;
    const arcLength = circumference * 0.75; 
    const strokeDashoffset = arcLength * (1 - progress);
    const remaining = goal - consumed;

    return (
        <div className="relative w-72 h-72">
            <svg className="w-full h-full" viewBox="0 0 200 200">
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#86efac" />
                        <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                </defs>
                <circle
                    className="text-gray-200"
                    strokeWidth="20"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="100"
                    cy="100"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * 0.25}
                    strokeLinecap="round"
                    transform="rotate(135 100 100)"
                />
                <circle
                    strokeWidth="20"
                    strokeDasharray={arcLength}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="url(#gradient)"
                    fill="transparent"
                    r={radius}
                    cx="100"
                    cy="100"
                    transform="rotate(135 100 100)"
                    style={{transition: 'stroke-dashoffset 0.5s ease-in-out'}}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-gray-900">{remaining > 0 ? remaining : 0}</span>
                <span className="text-lg text-gray-500">Calories left</span>
                <div className="absolute bottom-12">
                   <CaloriesIcon />
                </div>
            </div>
        </div>
    );
};

const MacroCard: React.FC<{ title: string, consumed: number, goal: number, icon: React.ReactNode, color: string }> = ({ title, consumed, goal, icon, color }) => {
    const radius = 28;
    const circumference = 2 * Math.PI * radius;
    const progress = goal > 0 ? Math.min(consumed / goal, 1) : 0;
    const strokeDashoffset = circumference * (1 - progress);
    const remaining = goal - consumed;
    const isOver = remaining < 0;

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex-1">
            <div className="flex justify-between items-start">
                 <div className="space-y-1">
                    <p className="font-bold text-lg text-gray-800">{isOver ? `${Math.abs(remaining)}g` : `${remaining}g`}</p>
                    <p className="text-sm text-gray-500">{isOver ? `${title} over` : `${title} left`}</p>
                </div>
                <div className="relative w-16 h-16">
                    <svg className="w-full h-full" viewBox="0 0 64 64">
                         <circle className="text-gray-200" strokeWidth="6" stroke="currentColor" fill="transparent" r={radius} cx="32" cy="32"/>
                         <circle className={color} strokeWidth="6" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx="32" cy="32" transform="rotate(-90 32 32)"/>
                    </svg>
                     <div className="absolute inset-0 flex items-center justify-center">
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    );
};


export const DashboardView: React.FC<DashboardViewProps> = ({ 
    userProfile, 
    todaysCalories, 
    todaysMacros, 
    todaysMeals,
    yesterdaysCalories,
    yesterdaysMacros,
    yesterdaysMeals,
    hasHistory, 
    onSeeAllHistory 
}) => {
    const [activeTab, setActiveTab] = useState<'today' | 'yesterday'>('today');
    
    const caloriesToShow = activeTab === 'today' ? todaysCalories : yesterdaysCalories;
    const macrosToShow = activeTab === 'today' ? todaysMacros : yesterdaysMacros;
    const mealsToShow = activeTab === 'today' ? todaysMeals : yesterdaysMeals;

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-6">
            <div className="w-full flex mb-2 border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('today')}
                    className={`flex-1 text-center py-2 text-lg transition-colors duration-200 ${activeTab === 'today' ? 'font-bold text-gray-900 border-b-2 border-gray-900' : 'text-gray-500'}`}
                >
                    Today
                </button>
                 <button 
                    onClick={() => setActiveTab('yesterday')}
                    className={`flex-1 text-center py-2 text-lg transition-colors duration-200 ${activeTab === 'yesterday' ? 'font-bold text-gray-900 border-b-2 border-gray-900' : 'text-gray-500'}`}
                >
                    Yesterday
                </button>
            </div>
            
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-200 w-full flex flex-col items-center">
                 <CalorieProgressArc consumed={caloriesToShow} goal={userProfile.calorieGoal} />
            </div>

            <div className="flex gap-4 w-full">
                <MacroCard title="Protein" consumed={macrosToShow.protein} goal={userProfile.macroGoals.protein} icon={<ProteinIcon />} color="text-pink-500" />
                <MacroCard title="Carbs" consumed={macrosToShow.carbs} goal={userProfile.macroGoals.carbs} icon={<CarbsIcon />} color="text-yellow-500" />
                <MacroCard title="Fats" consumed={macrosToShow.fats} goal={userProfile.macroGoals.fats} icon={<FatsIcon />} color="text-blue-500" />
            </div>
            
            <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-lg font-bold text-gray-800">Recently uploaded</h2>
                    {hasHistory && (
                        <button 
                            onClick={onSeeAllHistory}
                            className="text-sm font-semibold text-gray-600 hover:text-gray-900"
                        >
                            See All
                        </button>
                    )}
                </div>

                {mealsToShow.length > 0 ? (
                    <div className="space-y-3">
                        {mealsToShow.map(item => (
                            <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <img src={item.image} alt={item.analysis.mealName} className="w-16 h-16 object-cover rounded-lg" />
                                    <div>
                                        <p className="font-semibold text-gray-800">{item.analysis.mealName}</p>
                                        <p className="font-bold text-gray-600">{item.analysis.calories} kcal</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                        <p className="text-gray-500">You haven't scanned any meals {activeTab}.</p>
                        <p className="text-sm text-gray-400">Tap the scan button to start!</p>
                    </div>
                )}
            </div>
        </div>
    );
};
