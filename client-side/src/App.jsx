import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom'; // Removed useNavigate as logout is handled by context
import { useAuth } from './context/AuthContext'; 
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';
import UserProfileDropdown from './components/UserProfileDropdown'; 

function App() {
  const { isAuthenticated, logout, currentUser, loadingAuth } = useAuth();

 

  if (loadingAuth) {
    return ( 
      <div className="min-h-screen bg-slate-100 flex justify-center items-center">
        <div className="text-xl font-semibold text-gray-700">Loading application...</div>
      </div>
    );
  }

  return (
    <div> 
      <header className="bg-white shadow-md">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-indigo-600">
                Task Manager
              </Link>
             
            </div>
            <div className="flex items-center">
              <ul className="flex space-x-4 items-center"> 
                {isAuthenticated && (
                  <li>
                    <Link 
                      to="/dashboard" 
                      className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Dashboard
                    </Link>
                  </li>
                )}
                {!isAuthenticated && (
                  <li>
                    <Link 
                      to="/login" 
                      className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Login
                    </Link>
                  </li>
                )}
                {!isAuthenticated && (
                  <li>
                    <Link 
                      to="/register" 
                      className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Register
                    </Link>
                  </li>
                )}
                {isAuthenticated && currentUser && ( // Ensure currentUser exists before rendering dropdown
                  <li>
                    <UserProfileDropdown user={currentUser} onLogout={logout} />
                  </li>
                )}
              </ul>
            </div>
          </div>
        </nav>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Routes remain the same */}
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <LoginPage /> : <Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/dashboard" replace />} 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
            } 
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

// ProtectedRoute remains the same
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loadingAuth } = useAuth();

  if (loadingAuth) {
    return ( 
      <div className="min-h-screen bg-slate-100 flex justify-center items-center">
        <div className="text-xl font-semibold text-gray-700">Checking authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default App;