import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo/Home */}
          <Link to={isAuthenticated ? '/dashboard' : '/'} className="text-2xl font-bold hover:text-blue-100 transition">
            🤖 Personality Simulator
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="hover:text-blue-100 transition font-medium"
                >
                  Dashboard
                </Link>
                <Link 
                  to="/create-personality" 
                  className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded transition font-medium"
                >
                  + Create
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-sm">Welcome, {user?.first_name || user?.email}</span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded transition font-medium"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/" 
                  className="hover:text-blue-100 transition font-medium"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded transition font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
