import React from 'react';
import type { MealAnalysis } from '../types';
import { LoadingSpinner, BackIcon, ShareIcon, MoreOptionsIcon, CaloriesIcon, ProteinIcon, CarbsIcon, FatsIcon, HealthScoreIcon } from './Icons';

interface AnalysisViewProps {
  image: string | null;
  analysis: MealAnalysis | null;
  isLoading: boolean;
  error: string | null;
  onDone: () => void;
}

const Shimmer: React.FC = () => (
    <div className="space-y-4 animate-pulse p-6">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="space-y-2 pt-4">
            <div className="h-6 bg-gray-200 rounded w-full"></div>
            <div className="h-6 bg-gray-200 rounded w-5/6"></div>
        </div>
    </div>
);

export const AnalysisView: React.FC<AnalysisViewProps> = ({ image, analysis, isLoading, error, onDone }) => {
    
  const healthScoreColor = (score: number) => {
    if (score <= 3) return 'bg-red-500';
    if (score <= 7) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="w-full h-full flex flex-col bg-white fixed inset-0">
      <div className="relative flex-shrink-0">
        {image && (
          <img src={image} alt="Captured meal" className="w-full h-80 object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <header className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
            <button
            onClick={onDone}
            className="bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition-colors"
            aria-label="Back"
            >
            <BackIcon />
            </button>
            <div className="flex gap-2">
                 <button className="bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition-colors" aria-label="Share">
                    <ShareIcon />
                </button>
                <button className="bg-black/30 text-white p-3 rounded-full hover:bg-black/50 transition-colors" aria-label="More options">
                    <MoreOptionsIcon />
                </button>
            </div>
        </header>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gray-300 text-gray-700 px-4 py-1 rounded-full text-sm font-semibold">
            Nutrition
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto pt-8 pb-32">
        <div className="max-w-2xl mx-auto px-4 space-y-6">
            {isLoading && (
                <div className="text-center py-10">
                    <LoadingSpinner />
                    <p className="mt-4 text-lg text-gray-600">Analyzing your meal...</p>
                    <p className="text-sm text-gray-400">This might take a moment.</p>
                </div>
            )}

            {error && (
            <div className="text-center text-red-500 bg-red-100 p-4 rounded-lg">
                <h2 className="text-xl font-bold mb-2">Analysis Failed</h2>
                <p>{error}</p>
                <button onClick={onDone} className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg">Try Again</button>
            </div>
            )}

            {analysis && !isLoading && (
                <>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            <h2 className="text-3xl font-bold text-gray-900">{analysis.mealName}</h2>
                        </div>
                        <div className="flex items-center gap-2 border border-gray-200 rounded-full p-1">
                            <button className="w-8 h-8 rounded-full bg-gray-100 text-lg">-</button>
                            <span className="font-bold px-2">1</span>
                             <button className="w-8 h-8 rounded-full bg-gray-100 text-lg">+</button>
                        </div>
                    </div>
                
                    <div className="bg-white border border-gray-200 p-4 rounded-2xl space-y-4">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-red-100 rounded-full"><CaloriesIcon /></div>
                           <div>
                               <p className="text-gray-500">Calories</p>
                               <p className="text-2xl font-bold">{analysis.calories} <span className="text-base font-normal">kcal</span></p>
                           </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                             <div className="flex flex-col items-center gap-2">
                                <div className="p-2 bg-pink-100 rounded-full"><ProteinIcon /></div>
                                <p className="font-bold">{analysis.macros.protein}g</p>
                                <p className="text-sm text-gray-500">Protein</p>
                             </div>
                             <div className="flex flex-col items-center gap-2">
                                <div className="p-2 bg-yellow-100 rounded-full"><CarbsIcon /></div>
                                <p className="font-bold">{analysis.macros.carbs}g</p>
                                <p className="text-sm text-gray-500">Carbs</p>
                             </div>
                             <div className="flex flex-col items-center gap-2">
                                <div className="p-2 bg-blue-100 rounded-full"><FatsIcon /></div>
                                <p className="font-bold">{analysis.macros.fats}g</p>
                                <p className="text-sm text-gray-500">Fats</p>
                             </div>
                        </div>
                    </div>
                     <div className="bg-white border border-gray-200 p-4 rounded-2xl">
                         <div className="flex items-center gap-4">
                           <div className="p-3 bg-green-100 rounded-full"><HealthScoreIcon /></div>
                           <div>
                               <p className="text-gray-500">Health Score</p>
                               <p className="text-2xl font-bold">{analysis.healthScore} <span className="text-base font-normal">/ 10</span></p>
                           </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
                            <div className={`${healthScoreColor(analysis.healthScore)} h-2.5 rounded-full`} style={{ width: `${analysis.healthScore * 10}%` }}></div>
                        </div>
                     </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-2">Ingredients</h3>
                        <div className="flex flex-wrap gap-2">
                            {analysis.ingredients.map((ingredient, index) => (
                            <span key={index} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">{ingredient}</span>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
      </div>

       <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm p-4 border-t border-gray-200">
          <div className="max-w-2xl mx-auto flex gap-4">
              <button className="w-full py-4 text-center rounded-2xl font-bold text-gray-800 bg-gray-200 hover:bg-gray-300 transition-colors">Fix Results</button>
              <button onClick={onDone} className="w-full py-4 text-center rounded-2xl font-bold text-white bg-gray-900 hover:bg-gray-700 transition-colors">Done</button>
          </div>
       </div>

    </div>
  );
};