import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Chat from './components/chat/Chat';
import UserProfile from './components/user/UserProfile';
import './App.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/chat" /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={user ? <Navigate to="/chat" /> : <Register />} 
      />
      <Route 
        path="/chat" 
        element={user ? <Chat /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/chat/:username" 
        element={user ? <Chat /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/user/:username" 
        element={<UserProfile />} 
      />
      <Route 
        path="/" 
        element={user ? <Navigate to="/chat" /> : <Navigate to="/login" />} 
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="App">
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;