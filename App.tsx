import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { CameraView } from './components/CameraView';
import { AnalysisView } from './components/AnalysisView';
import { HistoryView } from './components/HistoryView';
import { analyzeMealImage, startChatSession } from './services/geminiService';
import { MealAnalysis, HistoryItem, View, UserProfile, Macros, ChatMessage } from './types';
import { HomeIcon, AnalyticsIcon, SettingsIcon, PlusIcon, AppleIcon, ChatIcon, FireIcon } from './components/Icons';
import { OnboardingView } from './components/OnboardingView';
import { DashboardView } from './components/DashboardView';
import { AnalyticsView } from './components/AnalyticsView';
import { SettingsView } from './components/SettingsView';
import { ChatView } from './components/ChatView';
import { Chat } from '@google/genai';
import { LoginView } from './components/LoginView';
import { SignUpView } from './components/SignUpView';

const getProfileKey = (user: string) => `userProfile_${user}`;
const getHistoryKey = (user: string) => `mealHistory_${user}`;
const getStreakKey = (user: string) => `streakData_${user}`;

interface NavButtonProps {
  label: string;
  view: View;
  currentView: View;
  onClick: () => void;
  children: React.ReactNode;
}

const NavButton: React.FC<NavButtonProps> = ({ label, view, currentView, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 w-20 h-full rounded-lg transition-colors duration-300 ${currentView === view ? 'text-gray-900' : 'text-gray-400 hover:text-gray-800'}`}
    aria-label={label}
  >
    {children}
    <span className="text-xs font-semibold">{label}</span>
  </button>
);


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [mealAnalysis, setMealAnalysis] = useState<MealAnalysis | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);

  // Load data from localStorage on initial render
  useEffect(() => {
    try {
      const activeUser = localStorage.getItem('currentUser');

      if (activeUser) {
        setCurrentUser(activeUser);
        const storedProfile = localStorage.getItem(getProfileKey(activeUser));
        if (storedProfile) {
          setUserProfile(JSON.parse(storedProfile));
          
          const storedHistory = localStorage.getItem(getHistoryKey(activeUser));
          if (storedHistory) setHistory(JSON.parse(storedHistory));
          
          const storedStreakData = localStorage.getItem(getStreakKey(activeUser));
          if (storedStreakData) {
            const { streakCount, lastDate } = JSON.parse(storedStreakData);
            const lastStreakDate = new Date(lastDate);
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);

            if (lastStreakDate.toDateString() !== today.toDateString() && lastStreakDate.toDateString() !== yesterday.toDateString()) {
              setStreak(0); // Reset streak
            } else {
              setStreak(streakCount);
            }
          }
          setCurrentView(View.DASHBOARD);
        } else {
          // User exists but has no profile, go to onboarding
          setCurrentView(View.ONBOARDING);
        }
      } else {
        // No user logged in
        setCurrentView(View.LOGIN);
      }
    } catch (e) {
      console.error("Failed to load from local storage", e);
      setCurrentView(View.LOGIN); // Fallback to login
    } finally {
      setChatSession(startChatSession());
      setIsLoading(false);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (userProfile && currentUser) {
      localStorage.setItem(getProfileKey(currentUser), JSON.stringify(userProfile));
    }
  }, [userProfile, currentUser]);

  useEffect(() => {
    if (!isLoading && currentUser) {
      localStorage.setItem(getHistoryKey(currentUser), JSON.stringify(history));
    }
  }, [history, isLoading, currentUser]);

  useEffect(() => {
    if (!isLoading && currentUser) {
        localStorage.setItem(getStreakKey(currentUser), JSON.stringify({ streakCount: streak, lastDate: new Date().toISOString() }));
    }
  }, [streak, isLoading, currentUser]);

  const handleLogin = (username: string) => {
    setAuthError(null);
    const userProfileData = localStorage.getItem(getProfileKey(username));
    if (userProfileData) {
      localStorage.setItem('currentUser', username);
      setCurrentUser(username);
      const profile = JSON.parse(userProfileData);
      setUserProfile(profile);
      
      const storedHistory = localStorage.getItem(getHistoryKey(username));
      setHistory(storedHistory ? JSON.parse(storedHistory) : []);
      
      const storedStreakData = localStorage.getItem(getStreakKey(username));
      setStreak(storedStreakData ? JSON.parse(storedStreakData).streakCount : 0);
      
      setCurrentView(View.DASHBOARD);
    } else {
      setAuthError('User not found. Please check the username or sign up.');
    }
  };

  const handleSignUp = (username: string) => {
    setAuthError(null);
    if (localStorage.getItem(getProfileKey(username))) {
      setAuthError('Username is already taken. Please choose another one.');
    } else {
      localStorage.setItem('currentUser', username);
      setCurrentUser(username);
      setUserProfile(null);
      setHistory([]);
      setStreak(0);
      setCurrentView(View.ONBOARDING);
    }
  };
  
  const handleLogout = () => {
    setCurrentUser(null);
    setUserProfile(null);
    setHistory([]);
    setStreak(0);
    setChatHistory([]);
    localStorage.removeItem('currentUser');
    setCurrentView(View.LOGIN);
  };
  
  const handleDeleteAccount = async () => {
    if (currentUser) {
      localStorage.removeItem(getProfileKey(currentUser));
      localStorage.removeItem(getHistoryKey(currentUser));
      localStorage.removeItem(getStreakKey(currentUser));
      handleLogout();
    }
  };

  const handleSaveProfile = async (profile: UserProfile) => {
    setUserProfile(profile);
    setCurrentView(View.DASHBOARD);
  };
  
  const handleUpdateProfile = async (profile: UserProfile) => {
     await handleSaveProfile(profile);
  };

  const today = useMemo(() => new Date().toDateString(), []);
  const yesterday = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toDateString();
  }, []);

  const todaysHistory = useMemo(() => {
    return history.filter(item => new Date(item.createdAt).toDateString() === today);
  }, [history, today]);

  const yesterdaysHistory = useMemo(() => {
    return history.filter(item => new Date(item.createdAt).toDateString() === yesterday);
  }, [history, yesterday]);

  const todaysCalories = useMemo(() => {
    return todaysHistory.reduce((total, item) => total + item.analysis.calories, 0);
  }, [todaysHistory]);
  
  const yesterdaysCalories = useMemo(() => {
    return yesterdaysHistory.reduce((total, item) => total + item.analysis.calories, 0);
  }, [yesterdaysHistory]);

  const todaysMacros = useMemo(() => {
    return todaysHistory.reduce((total, item) => {
        total.protein += item.analysis.macros.protein;
        total.carbs += item.analysis.macros.carbs;
        total.fats += item.analysis.macros.fats;
        return total;
    }, { protein: 0, carbs: 0, fats: 0 } as Macros);
  }, [todaysHistory]);

  const yesterdaysMacros = useMemo(() => {
    return yesterdaysHistory.reduce((total, item) => {
        total.protein += item.analysis.macros.protein;
        total.carbs += item.analysis.macros.carbs;
        total.fats += item.analysis.macros.fats;
        return total;
    }, { protein: 0, carbs: 0, fats: 0 } as Macros);
  }, [yesterdaysHistory]);

  const handleCapture = useCallback(async (imageDataUrl: string) => {
    if (!currentUser) return; // Should not happen if user is in the app
    setCapturedImage(imageDataUrl);
    setIsLoading(true);
    setError(null);
    setMealAnalysis(null);
    setCurrentView(View.ANALYSIS);

    try {
      const analysis = await analyzeMealImage(imageDataUrl);
      setMealAnalysis(analysis);
      
      const now = new Date();
      const newHistoryItem: HistoryItem = {
        id: now.getTime().toString(),
        createdAt: now.toISOString(),
        image: imageDataUrl,
        analysis,
      };
      setHistory(prevHistory => [newHistoryItem, ...prevHistory]);

      // Handle Streak Logic
      const yesterday = new Date();
      yesterday.setDate(now.getDate() - 1);
      
      const storedStreakData = localStorage.getItem(getStreakKey(currentUser));
      let newStreak = 1;
      if (storedStreakData) {
        const { streakCount, lastDate } = JSON.parse(storedStreakData);
        const lastStreakDate = new Date(lastDate);
        if (lastStreakDate.toDateString() === yesterday.toDateString()) {
            newStreak = streakCount + 1;
        } else if (lastStreakDate.toDateString() !== now.toDateString()) {
            newStreak = 1;
        } else {
            newStreak = streakCount;
        }
      }
      setStreak(newStreak);

    } catch (err) {
      console.error(err);
      setError('Sorry, I couldn\'t analyze that meal. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  const handleSendMessage = async (message: string) => {
    if (!chatSession || isChatLoading) return;
    
    const userMessage: ChatMessage = { role: 'user', content: message };
    setChatHistory(prev => [...prev, userMessage, { role: 'model', content: '' }]);
    setIsChatLoading(true);

    try {
        const responseStream = await chatSession.sendMessageStream({ message });
        
        let fullResponse = "";
        for await (const chunk of responseStream) {
            fullResponse += chunk.text;
            setChatHistory(prev => {
                const newHistory = [...prev];
                newHistory[newHistory.length - 1] = { role: 'model', content: fullResponse };
                return newHistory;
            });
        }
    } catch (err) {
        console.error("Error sending chat message:", err);
        setChatHistory(prev => {
            const newHistory = [...prev];
            newHistory[newHistory.length - 1] = { role: 'model', content: 'Sorry, something went wrong. Please try again.' };
            return newHistory;
        });
    } finally {
        setIsChatLoading(false);
    }
};

  const showDashboard = () => {
    setCurrentView(View.DASHBOARD);
    setCapturedImage(null);
    setMealAnalysis(null);
    setError(null);
  };
  
  const showHistory = () => setCurrentView(View.HISTORY);

  const deleteHistoryItem = async (id: string) => {
    setHistory(prevHistory => prevHistory.filter(item => item.id !== id));
  };
  
  const clearHistory = async () => {
      setHistory([]);
  };

  const renderView = () => {
    if (isLoading && !currentUser && currentView !== View.LOGIN && currentView !== View.SIGNUP) {
       return <div className="flex-grow flex items-center justify-center"><p>Loading...</p></div>;
    }
      
    switch (currentView) {
      case View.LOGIN:
        return <LoginView onLogin={handleLogin} onNavigateToSignUp={() => setCurrentView(View.SIGNUP)} error={authError} />;
      case View.SIGNUP:
        return <SignUpView onSignUp={handleSignUp} onNavigateToLogin={() => setCurrentView(View.LOGIN)} error={authError} />;
      case View.ONBOARDING:
        return <OnboardingView onSave={handleSaveProfile} />;
    }

    // Fix: The comparison `currentView !== View.ONBOARDING` was causing a type error because
    // the preceding switch statement ensures `currentView` can never be `View.ONBOARDING`
    // at this point in the code. The logic has been simplified to remove the redundant check
    // and correctly force the onboarding view if a user profile is missing.
    if (!userProfile) {
        // This case handles user who signed up but hasn't onboarded yet.
        return <OnboardingView onSave={handleSaveProfile} />;
    }
      
    switch (currentView) {
      case View.DASHBOARD:
        return <DashboardView 
                    userProfile={userProfile}
                    todaysCalories={todaysCalories} 
                    todaysMacros={todaysMacros}
                    todaysMeals={todaysHistory}
                    yesterdaysCalories={yesterdaysCalories}
                    yesterdaysMacros={yesterdaysMacros}
                    yesterdaysMeals={yesterdaysHistory}
                    hasHistory={history.length > 0}
                    onSeeAllHistory={showHistory}
                />;
      case View.CAMERA:
        return <CameraView onCapture={handleCapture} onBack={showDashboard} />;
      case View.ANALYSIS:
        return (
          <AnalysisView
            image={capturedImage}
            analysis={mealAnalysis}
            isLoading={isLoading && !mealAnalysis}
            error={error}
            onDone={showDashboard}
          />
        );
      case View.HISTORY:
        return <HistoryView history={history} onDelete={deleteHistoryItem} onClear={clearHistory} />;
      case View.ANALYTICS:
        return <AnalyticsView history={history} />;
      case View.SETTINGS:
          return <SettingsView userProfile={userProfile} onSaveProfile={handleUpdateProfile} onLogout={handleLogout} onDeleteAccount={handleDeleteAccount} />;
      case View.CHAT:
        return <ChatView 
                messages={chatHistory} 
                onSendMessage={handleSendMessage} 
                isLoading={isChatLoading}
                onBack={showDashboard}
               />;
      default: {
        return <DashboardView 
                    userProfile={userProfile}
                    todaysCalories={todaysCalories} 
                    todaysMacros={todaysMacros}
                    todaysMeals={todaysHistory}
                    yesterdaysCalories={yesterdaysCalories}
                    yesterdaysMacros={yesterdaysMacros}
                    yesterdaysMeals={yesterdaysHistory}
                    hasHistory={history.length > 0}
                    onSeeAllHistory={showHistory}
                />;
      }
    }
  };
  
  const renderHeader = () => {
      const noHeaderViews = [View.LOGIN, View.SIGNUP, View.ONBOARDING, View.CAMERA, View.ANALYSIS, View.CHAT];
      if (noHeaderViews.includes(currentView) || !userProfile) return null;

      return (
         <header className="w-full text-center p-4 bg-gray-50 sticky top-0 z-20 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <AppleIcon />
                <h1 className="text-2xl font-bold text-gray-900">
                Cal AI
                </h1>
            </div>
            <div className="flex items-center gap-4">
                <button aria-label="Chat" className="text-gray-600 hover:text-gray-900" onClick={() => setCurrentView(View.CHAT)}><ChatIcon /></button>
                <button aria-label="Streak" className="flex items-center gap-1 text-gray-600 hover:text-gray-900 font-bold">
                    <FireIcon /> {streak}
                </button>
            </div>
        </header>
      )
  }
  
  const showFooter = userProfile && ![View.LOGIN, View.SIGNUP, View.ONBOARDING, View.CAMERA, View.ANALYSIS, View.CHAT].includes(currentView);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      {renderHeader()}
      
      <main className={`flex-grow flex flex-col ${!showFooter && 'mb-0'} ${currentView !== View.CHAT && 'p-4 md:p-6'}`}>
        {renderView()}
      </main>

      {showFooter && (
        <footer className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-4">
          <nav className="max-w-md mx-auto h-20 rounded-3xl bg-white/80 backdrop-blur-md shadow-lg flex justify-around items-center px-4">
             <NavButton
                label="Home"
                view={View.DASHBOARD}
                currentView={currentView}
                onClick={showDashboard}
              >
                <HomeIcon />
              </NavButton>

              <NavButton
                label="Analytics"
                view={View.ANALYTICS}
                currentView={currentView}
                onClick={() => setCurrentView(View.ANALYTICS)}
              >
                <AnalyticsIcon />
              </NavButton>
            
            <NavButton
              label="Settings"
              view={View.SETTINGS}
              currentView={currentView}
              onClick={() => setCurrentView(View.SETTINGS)}
            >
              <SettingsIcon />
            </NavButton>

            <button
                onClick={() => setCurrentView(View.CAMERA)}
                className="w-14 h-14 bg-gray-900 text-white rounded-2xl flex items-center justify-center shadow-lg transform active:scale-95 transition-transform"
                aria-label="Scan Meal"
            >
                <PlusIcon />
            </button>
          </nav>
        </footer>
      )}
    </div>
  );
};

export default App;