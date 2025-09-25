import React, { useMemo } from 'react';
import { HistoryItem, Macros } from '../types';
import { HealthScoreIcon } from './Icons';

// Helper to get dates for the last 7 days
const getLast7Days = () => {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d);
  }
  return dates;
};

// A single bar for the bar chart
const ChartBar: React.FC<{ day: string; calories: number; maxCalories: number }> = ({ day, calories, maxCalories }) => {
  const heightPercentage = maxCalories > 0 ? (calories / maxCalories) * 100 : 0;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-8 h-48 bg-gray-100 rounded-full flex flex-col justify-end">
        <div
          className="bg-gradient-to-t from-blue-400 to-green-400 rounded-full w-full"
          style={{ height: `${heightPercentage}%`, transition: 'height 0.5s ease-out' }}
        ></div>
      </div>
      <span className="text-xs font-medium text-gray-500">{day}</span>
    </div>
  );
};

// Donut chart for macros
const MacroDonutChart: React.FC<{ macros: Macros }> = ({ macros }) => {
    const total = macros.protein + macros.carbs + macros.fats;
    if (total === 0) {
      return <div className="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center"><span className="text-gray-500">No data</span></div>;
    }

    const proteinPercent = macros.protein / total;
    const carbsPercent = macros.carbs / total;

    const radius = 45;
    const circumference = 2 * Math.PI * radius;

    const proteinAngle = proteinPercent * 360;
    const carbsAngle = carbsPercent * 360;

    return (
        <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r={radius} fill="transparent" strokeWidth="10" className="text-gray-200" stroke="currentColor" />
                
                <circle cx="50" cy="50" r={radius} fill="transparent" strokeWidth="10" 
                        className="text-pink-500" stroke="currentColor" 
                        strokeDasharray={`${proteinPercent * circumference} ${circumference}`}
                        transform="rotate(-90 50 50)" />
                
                <circle cx="50" cy="50" r={radius} fill="transparent" strokeWidth="10" 
                        className="text-yellow-500" stroke="currentColor" 
                        strokeDasharray={`${carbsPercent * circumference} ${circumference}`}
                        transform={`rotate(${-90 + proteinAngle} 50 50)`} />
                
                 <circle cx="50" cy="50" r={radius} fill="transparent" strokeWidth="10" 
                        className="text-blue-500" stroke="currentColor" 
                        strokeDasharray={`${(1 - proteinPercent - carbsPercent) * circumference} ${circumference}`}
                        transform={`rotate(${-90 + proteinAngle + carbsAngle} 50 50)`} />
            </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold">{total.toFixed(0)}g</span>
                <span className="text-sm text-gray-500">Total Macros</span>
            </div>
        </div>
    );
};

export const AnalyticsView: React.FC<{ history: HistoryItem[] }> = ({ history }) => {
  const analyticsData = useMemo(() => {
    if (history.length === 0) {
      return null;
    }

    // 7-Day Calorie Data
    const last7Days = getLast7Days();
    const dailyCalories = last7Days.map(date => {
      const dayStr = date.toDateString();
      const dayName = date.toLocaleDateString(undefined, { weekday: 'short' });
      const totalCalories = history
        .filter(item => new Date(item.createdAt).toDateString() === dayStr)
        .reduce((sum, item) => sum + item.analysis.calories, 0);
      return { day: dayName, calories: totalCalories };
    });
    const maxCalories = Math.max(...dailyCalories.map(d => d.calories), 1);

    // Average Macro Data
    const totalMacros = history.reduce((acc, item) => {
        acc.protein += item.analysis.macros.protein;
        acc.carbs += item.analysis.macros.carbs;
        acc.fats += item.analysis.macros.fats;
        return acc;
    }, { protein: 0, carbs: 0, fats: 0 });
    const totalMacroGrams = totalMacros.protein + totalMacros.carbs + totalMacros.fats;

    // Average Health Score
    const totalHealthScore = history.reduce((sum, item) => sum + item.analysis.healthScore, 0);
    const averageHealthScore = totalHealthScore / history.length;

    return { dailyCalories, maxCalories, totalMacros, totalMacroGrams, averageHealthScore };
  }, [history]);

  if (!analyticsData) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-gray-500 h-full">
        <p className="text-xl">Not enough data.</p>
        <p>Scan some meals to see your analytics!</p>
      </div>
    );
  }

  const { dailyCalories, maxCalories, totalMacros, totalMacroGrams, averageHealthScore } = analyticsData;

  const getMacroPercentage = (macro: number) => {
      if (totalMacroGrams === 0) return '0%';
      return `${((macro / totalMacroGrams) * 100).toFixed(0)}%`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Your Analytics</h2>
      
      {/* 7-Day Calorie Intake */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Last 7 Days Calorie Intake</h3>
        <div className="flex justify-around items-end h-56">
          {dailyCalories.map(data => (
            <ChartBar key={data.day} day={data.day} calories={data.calories} maxCalories={maxCalories} />
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Macronutrient Breakdown */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Average Macro Breakdown</h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <MacroDonutChart macros={totalMacros} />
            <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-pink-500"></div><div>Protein: <span className="font-bold">{getMacroPercentage(totalMacros.protein)}</span></div></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-500"></div><div>Carbs: <span className="font-bold">{getMacroPercentage(totalMacros.carbs)}</span></div></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><div>Fats: <span className="font-bold">{getMacroPercentage(totalMacros.fats)}</span></div></div>
            </div>
          </div>
        </div>

        {/* Average Health Score */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-center items-center">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Average Health Score</h3>
             <div className="flex items-center gap-4 text-green-500">
                <HealthScoreIcon />
                <span className="text-5xl font-bold">{averageHealthScore.toFixed(1)}</span>
                <span className="text-2xl text-gray-400 self-end">/ 10</span>
            </div>
            <p className="text-sm text-gray-500 mt-2">Based on {history.length} scanned meal{history.length > 1 ? 's' : ''}.</p>
        </div>
      </div>
    </div>
  );
};
