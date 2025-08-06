import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import WelcomeScreen from './WelcomeScreen';
import toast from 'react-hot-toast';

const Chat = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { socket, joinChat, leaveChat } = useSocket();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUserChats();
  }, []);

  useEffect(() => {
    if (username && user) {
      startChatWithUser(username);
    }
  }, [username, user]);

  useEffect(() => {
    if (socket) {
      socket.on('newMessage', handleNewMessage);
      socket.on('messagesMarkedAsRead', handleMessagesMarkedAsRead);

      return () => {
        socket.off('newMessage', handleNewMessage);
        socket.off('messagesMarkedAsRead', handleMessagesMarkedAsRead);
      };
    }
  }, [socket, activeChat]); 

  const fetchUserChats = async () => {
    try {
      const response = await axios.get('/chat/my-chats');
      setChats(response.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Error al cargar los chats');
    }
  };

  const startChatWithUser = async (targetUsername) => {
    setLoading(true);
    try {
      const response = await axios.post(`/chat/start/${targetUsername}`);
      const chat = response.data;

      setActiveChat(chat);
      joinChat(chat.id);

      setChats(prevChats => {
        const existingIndex = prevChats.findIndex(c => c.id === chat.id);
        if (existingIndex >= 0) {
          const newChats = [...prevChats];
          newChats[existingIndex] = chat;
          return newChats;
        } else {
          return [chat, ...prevChats];
        }
      });

      if (username) {
        navigate('/chat', { replace: true });
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error(error.response?.data?.message || 'Error al iniciar el chat');
    } finally {
      setLoading(false);
    }
  };

  const handleNewMessage = ({ message, chatId }) => {
    console.log('Nuevo mensaje recibido:', message);

    if (activeChat && activeChat.id === chatId) {
      setActiveChat(prev => ({
        ...prev,
        messages: [...prev.messages, message] 
      }));
    }

    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,

            messages: [message],
            updatedAt: message.createdAt
          };
        }
        return chat;
      }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    });

    if (!activeChat || activeChat.id !== chatId) {
      toast.success(`Nuevo mensaje de ${message.sender.username}`);
    }
  };

  const handleMessagesMarkedAsRead = ({ chatId }) => {
    if (activeChat && activeChat.id === chatId) {
      setActiveChat(prev => ({
        ...prev,
        messages: prev.messages.map(msg => ({
          ...msg,
          readStatus: [...(msg.readStatus || []), { userId: user.id, readAt: new Date() }]
        }))
      }));
    }
  };

  const handleChatSelect = (chat) => {
    if (activeChat) {
      leaveChat(activeChat.id);
    }
    setActiveChat(chat);
    joinChat(chat.id);
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    if (activeChat) {
      leaveChat(activeChat.id);
    }
    logout();
  };

  const generateShareLink = () => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/user/${user.username}`;

    if (navigator.share) {
      navigator.share({
        title: `Chat conmigo - ${user.username}`,
        text: `¡Inicia una conversación conmigo!`,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success('¡Enlace copiado al portapapeles!');
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex">
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform lg:translate-x-0 lg:static lg:inset-0 transition duration-300 ease-in-out lg:block`}>
        <ChatSidebar
          chats={chats}
          activeChat={activeChat}
          user={user}
          onChatSelect={handleChatSelect}
          onStartChat={startChatWithUser}
          onLogout={handleLogout}
          onGenerateShareLink={generateShareLink}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col">
        <div className="lg:hidden bg-white shadow-sm px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Chat</h1>
          <div className="w-10" />
        </div>

        <div className="flex-1 flex">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : activeChat ? (
            <ChatWindow
              chat={activeChat}
              user={user}
              setActiveChat={setActiveChat} 
            />
          ) : (
            <WelcomeScreen user={user} onGenerateShareLink={generateShareLink} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;