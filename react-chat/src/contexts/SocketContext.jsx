import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';


export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Map());
  const [typingUsers, setTypingUsers] = useState(new Map());
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      const newSocket = io(API_BASE_URL, {
        auth: {
          token
        }
      });


      newSocket.on('connect', () => {
        console.log('Connected to server');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

 
      newSocket.on('userOnlineStatusChanged', ({ userId, username, isOnline }) => {
        setOnlineUsers(prev => {
          const newMap = new Map(prev);
          if (isOnline) {
            newMap.set(userId, { username, isOnline });
          } else {
            newMap.delete(userId);
          }
          return newMap;
        });
      });

      newSocket.on('userTyping', ({ chatId, userId, username }) => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          const chatTyping = newMap.get(chatId) || new Set();
          chatTyping.add(userId);
          newMap.set(chatId, chatTyping);
          return newMap;
        });
      });

      newSocket.on('userStoppedTyping', ({ chatId, userId }) => {
        setTypingUsers(prev => {
          const newMap = new Map(prev);
          const chatTyping = newMap.get(chatId);
          if (chatTyping) {
            chatTyping.delete(userId);
            if (chatTyping.size === 0) {
              newMap.delete(chatId);
            } else {
              newMap.set(chatId, chatTyping);
            }
          }
          return newMap;
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const joinChat = (chatId) => {
    if (socket) {
      socket.emit('joinChat', { chatId });
    }
  };

  const leaveChat = (chatId) => {
    if (socket) {
      socket.emit('leaveChat', { chatId });
    }
  };

  const sendMessage = (chatId, content, type = 'TEXT') => {
    if (socket) {
      socket.emit('sendMessage', { chatId, content, type });
    }
  };

  const startTyping = (chatId) => {
    if (socket) {
      socket.emit('typing', { chatId, isTyping: true });
    }
  };

  const stopTyping = (chatId) => {
    if (socket) {
      socket.emit('typing', { chatId, isTyping: false });
    }
  };

  const markAsRead = (chatId) => {
    if (socket) {
      socket.emit('markAsRead', { chatId });
    }
  };

  const value = {
    socket,
    onlineUsers,
    typingUsers,
    joinChat,
    leaveChat,
    sendMessage,
    startTyping,
    stopTyping,
    markAsRead
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};