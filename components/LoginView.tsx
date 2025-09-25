import React, { useState } from 'react';

interface LoginViewProps {
  onLogin: (username: string) => void;
  onNavigateToSignUp: () => void;
  error: string | null;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onNavigateToSignUp, error }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim().toLowerCase());
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col justify-center h-full">
      <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-1">Welcome Back!</h2>
        <p className="text-center text-gray-500 mb-6">Log in to continue.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input 
              type="text" 
              id="username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800"
              autoCapitalize="none"
              autoCorrect="off"
            />
          </div>
          
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <button type="submit" className="w-full bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-300" disabled={!username.trim()}>
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don't have an account?{' '}
          <button onClick={onNavigateToSignUp} className="font-semibold text-gray-800 hover:underline">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};
