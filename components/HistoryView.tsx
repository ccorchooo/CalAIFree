import React, { useMemo } from 'react';
import type { HistoryItem } from '../types';
import { TrashIcon } from './Icons';

interface HistoryViewProps {
  history: HistoryItem[];
  onDelete: (id: string) => void;
  onClear: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ history, onDelete, onClear }) => {

  const groupedHistory = useMemo(() => {
    return history.reduce((acc, item) => {
      const date = new Date(item.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const today = new Date().toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      const yesterday = new Date(Date.now() - 86400000).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      let displayDate = date;
      if (date === today) displayDate = 'Today';
      else if (date === yesterday) displayDate = 'Yesterday';
      
      if (!acc[displayDate]) {
        acc[displayDate] = { items: [], totalCalories: 0 };
      }
      acc[displayDate].items.push(item);
      acc[displayDate].totalCalories += item.analysis.calories;
      return acc;
    }, {} as Record<string, { items: HistoryItem[], totalCalories: number }>);
  }, [history]);

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-gray-500 h-full">
        <p className="text-xl">No meals scanned yet.</p>
        <p>Use the camera to start tracking your meals!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Meal History</h2>
            {history.length > 0 && (
                 <button
                    onClick={onClear}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold"
                    >
                    Clear All
                </button>
            )}
        </div>
      <div className="space-y-6">
        {Object.entries(groupedHistory).map(([date, { items, totalCalories }]) => (
          <div key={date}>
            <div className="flex justify-between items-baseline mb-2">
                <h3 className="text-lg font-bold text-gray-800">{date}</h3>
                <p className="text-sm text-gray-500">Total: <span className="font-bold text-gray-700">{totalCalories} kcal</span></p>
            </div>
            <div className="space-y-4">
                {items.map(item => (
                <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 flex items-center p-3 gap-4">
                    <img src={item.image} alt={item.analysis.mealName} className="w-20 h-20 object-cover rounded-lg" />
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-gray-800">{item.analysis.mealName}</h3>
                      <p className="font-bold text-gray-700">{item.analysis.calories} <span className="font-normal text-gray-500">kcal</span></p>
                      <p className="text-xs text-gray-400">{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Delete item"
                    >
                    <TrashIcon />
                    </button>
                </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
