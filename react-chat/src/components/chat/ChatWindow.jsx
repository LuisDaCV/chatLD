
import React, { useState, useEffect, useRef } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useSocket } from '../../contexts/SocketContext';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';

const ChatWindow = ({ chat, user }) => {
  const [messages, setMessages] = useState([]);
  const [partner, setPartner] = useState(null);
  const messagesEndRef = useRef(null);
  const { onlineUsers, typingUsers, markAsRead } = useSocket();

  useEffect(() => {
    if (chat) {
      const sortedMessages = [...(chat.messages || [])].sort((a, b) =>
        new Date(a.createdAt) - new Date(b.createdAt)
      );
      setMessages(sortedMessages);
      setPartner(chat.initiator.id === user.id ? chat.participant : chat.initiator);
      markAsRead(chat.id);
    }
  }, [chat, user.id, markAsRead]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const getChatTypingUsers = () => {
    const typingSet = typingUsers.get(chat?.id);
    if (!typingSet || typingSet.size === 0) return [];

    return Array.from(typingSet).filter(userId => userId !== user.id);
  };

  const formatMessageTime = (date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now - messageDate) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(messageDate, 'HH:mm');
    } else if (diffInHours < 168) { // 7 days
      return format(messageDate, 'EEE HH:mm', { locale: es });
    } else {
      return format(messageDate, 'dd/MM/yy HH:mm');
    }
  };

  const isMessageRead = (message) => {
    if (message.sender.id === user.id) {
      // Check if partner has read the message
      return message.readStatus && message.readStatus.some(
        status => status.userId === partner?.id
      );
    }
    return true;
  };

  const groupMessagesByDate = (messages) => {
    const groups = [];
    let currentDate = null;
    let currentGroup = [];

    messages.forEach(message => {
      const messageDate = format(new Date(message.createdAt), 'yyyy-MM-dd');

      if (messageDate !== currentDate) {
        if (currentGroup.length > 0) {
          groups.push({
            date: currentDate,
            messages: currentGroup
          });
        }
        currentDate = messageDate;
        currentGroup = [message];
      } else {
        currentGroup.push(message);
      }
    });

    if (currentGroup.length > 0) {
      groups.push({
        date: currentDate,
        messages: currentGroup
      });
    }

    return groups;
  };

  const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateStr = format(date, 'yyyy-MM-dd');
    const todayStr = format(today, 'yyyy-MM-dd');
    const yesterdayStr = format(yesterday, 'yyyy-MM-dd');

    if (dateStr === todayStr) {
      return 'Hoy';
    } else if (dateStr === yesterdayStr) {
      return 'Ayer';
    } else {
      return format(date, 'dd \'de\' MMMM \'de\' yyyy', { locale: es });
    }
  };

  if (!chat || !partner) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-500">Cargando chat...</p>
        </div>
      </div>
    );
  }

  const messageGroups = groupMessagesByDate(messages);
  const typingUsersList = getChatTypingUsers();

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {partner.username.substring(0, 2).toUpperCase()}
              </span>
            </div>
            {isUserOnline(partner.id) && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-900">{partner.username}</h2>
            <p className="text-sm text-gray-500">
              {isUserOnline(partner.id) ? (
                <span className="text-green-500">En línea</span>
              ) : partner.lastSeen ? (
                `Última vez ${formatDistanceToNow(new Date(partner.lastSeen), { addSuffix: true, locale: es })}`
              ) : (
                'Desconectado'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
            title="Información del chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messageGroups.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-gray-500">¡Inicia la conversación!</p>
            <p className="text-sm text-gray-400 mt-1">Envía el primer mensaje a {partner.username}</p>
          </div>
        ) : (
          messageGroups.map((group, groupIndex) => (
            <div key={group.date}>
              <div className="flex justify-center mb-4">
                <span className="px-3 py-1 bg-gray-100 text-gray-500 text-sm rounded-full">
                  {formatDateHeader(group.date)}
                </span>
              </div>

              {group.messages.map((message, index) => {
                const isOwn = message.sender.id === user.id;
                const isRead = isMessageRead(message);

                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${isOwn
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                      }`}>
                      <p className="text-sm">{message.content}</p>

                      <div className={`flex items-center justify-end mt-1 space-x-1 text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                        <span>{formatMessageTime(message.createdAt)}</span>
                        {isOwn && (
                          <div className="flex items-center space-x-1">
                            <svg
                              className={`w-4 h-4 ${isRead ? 'text-blue-200' : 'text-blue-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              {isRead && (
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L4 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              )}
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}

        {typingUsersList.length > 0 && (
          <TypingIndicator usernames={[partner.username]} />
        )}

        <div ref={messagesEndRef} />
      </div>

      <MessageInput chatId={chat.id} />
    </div>
  );
};

export default ChatWindow;