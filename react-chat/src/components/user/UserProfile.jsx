// frontend/src/components/User/UserProfile.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startingChat, setStartingChat] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`/users/${username}`);
      setProfileUser(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast.error('Usuario no encontrado');
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (currentUser.username === username) {
      navigate('/chat');
      return;
    }

    setStartingChat(true);
    try {
      const response = await axios.post(`/chat/start/${username}`);
      navigate('/chat');
      toast.success(`Chat iniciado con ${username}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Error al iniciar el chat');
    } finally {
      setStartingChat(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.349 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Usuario no encontrado</h1>
          <p className="text-gray-600 mb-6">El usuario @{username} no existe o no está disponible.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.username === username;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Volver</span>
            </button>
            
            <div className="flex items-center space-x-4">
              {currentUser && !isOwnProfile && (
                <button
                  onClick={handleStartChat}
                  disabled={startingChat}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                >
                  {startingChat ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>Iniciar Chat</span>
                    </>
                  )}
                </button>
              )}
              
              {!currentUser && (
                <button
                  onClick={() => navigate('/login')}
                  className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-8">
            <div className="text-center">
              {/* Avatar */}
              <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">
                  {profileUser.username.substring(0, 2).toUpperCase()}
                </span>
              </div>

              {/* User Info */}
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                @{profileUser.username}
              </h1>
              
              <div className="flex items-center justify-center space-x-2 mb-6">
                <div className={`w-3 h-3 rounded-full ${profileUser.isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                <span className={`text-sm ${profileUser.isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                  {profileUser.isOnline ? 'En línea' : 'Desconectado'}
                </span>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                {isOwnProfile ? (
                  <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-2">Este es tu perfil</h3>
                    <p className="text-blue-700 text-sm mb-4">
                      Comparte este enlace para que otros usuarios puedan iniciar conversaciones contigo
                    </p>
                    
                    <div className="bg-white rounded-lg p-3 mb-4">
                      <p className="text-sm font-mono text-blue-600 break-all">
                        {window.location.href}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: `Chat conmigo - ${profileUser.username}`,
                            text: `¡Inicia una conversación conmigo!`,
                            url: window.location.href
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          toast.success('¡Enlace copiado al portapapeles!');
                        }
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Compartir Enlace
                    </button>
                  </div>
                ) : currentUser ? (
                  <div className="bg-green-50 rounded-lg p-6">
                    <h3 className="font-semibold text-green-900 mb-2">¡Inicia una conversación!</h3>
                    <p className="text-green-700 text-sm mb-4">
                      Haz clic en el botón para empezar a chatear con @{profileUser.username}
                    </p>
                    
                    <button
                      onClick={handleStartChat}
                      disabled={startingChat}
                      className="bg-green-500 hover:bg-green-600 disabled:bg-green-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 w-full"
                    >
                      {startingChat ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>Iniciar Chat con @{profileUser.username}</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">¿Quieres chatear?</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Inicia sesión o crea una cuenta para empezar a chatear con @{profileUser.username}
                    </p>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => navigate('/login')}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Iniciar Sesión
                      </button>
                      <button
                        onClick={() => navigate('/register')}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Crear Cuenta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;