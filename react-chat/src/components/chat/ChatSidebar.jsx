import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSocket } from '../../contexts/SocketContext';

const ChatSidebar = ({ 
  chats, 
  activeChat, 
  user, 
  onChatSelect, 
  onStartChat, 
  onLogout, 
  onGenerateShareLink,
  onClose 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { onlineUsers } = useSocket();

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(`/users/search?q=${query}`);
      setSearchResults(response.data.filter(searchUser => searchUser.id !== user.id));
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error al buscar usuarios');
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = (username) => {
    onStartChat(username);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const getChatPartner = (chat) => {
    return chat.initiator.id === user.id ? chat.participant : chat.initiator;
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const getLastMessage = (chat) => {
    if (chat.messages && chat.messages.length > 0) {
      const lastMessage = chat.messages[0];
      const isOwn = lastMessage.sender.id === user.id;
      const prefix = isOwn ? 'Tú: ' : '';
      return `${prefix}${lastMessage.content.substring(0, 45)}${lastMessage.content.length > 45 ? '...' : ''}`;
    }
    return 'Sin mensajes aún';
  };

  const getLastMessageTime = (chat) => {
    if (chat.messages && chat.messages.length > 0) {
      return formatDistanceToNow(new Date(chat.messages[0].createdAt), { 
        addSuffix: true, 
        locale: es 
      });
    }
    return formatDistanceToNow(new Date(chat.createdAt), { 
      addSuffix: true, 
      locale: es 
    });
  };

  return (
    <div className="h-full flex flex-col bg-white shadow-lg w-80 min-w-80">
      <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm ring-2 ring-white ring-opacity-30">
            <span className="text-black font-bold text-base">
              {user.username.substring(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-white text-lg leading-tight">{user.username}</h2>
            <div className="flex items-center space-x-1 mt-1">
              <div className="w-2 h-2 bg-green-400 rounded-full shadow-sm"></div>
              <span className="text-xs text-blue-100 font-medium">En línea</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="lg:hidden p-2 text-white hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="flex-shrink-0 p-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`flex flex-col items-center justify-center p-3 rounded-xl text-xs font-medium transition-all ${
              showSearch 
                ? 'bg-blue-100 text-blue-700 shadow-sm' 
                : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm border border-gray-200'
            }`}
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Buscar</span>
          </button>
          
          <button
            onClick={onGenerateShareLink}
            className="flex flex-col items-center justify-center p-3 rounded-xl text-xs font-medium bg-white text-gray-600 hover:bg-gray-100 transition-all shadow-sm border border-gray-200"
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span>Compartir</span>
          </button>

          <button
            onClick={onLogout}
            className="flex flex-col items-center justify-center p-3 rounded-xl text-xs font-medium bg-white text-red-600 hover:bg-red-50 transition-all shadow-sm border border-gray-200"
          >
            <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Salir</span>
          </button>
        </div>
      </div>

      {showSearch && (
        <div className="flex-shrink-0 p-4 bg-white border-b border-gray-200">
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm placeholder-gray-400"
              autoFocus
            />
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {(isSearching || searchResults.length > 0 || (searchQuery.length >= 2 && searchResults.length === 0)) && (
            <div className="mt-3 bg-gray-50 rounded-xl border border-gray-200 shadow-sm max-h-56 overflow-y-auto">
              {isSearching ? (
                <div className="p-6 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-3 text-sm font-medium">Buscando usuarios...</p>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <svg className="w-10 h-10 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.467-.881-6.08-2.33" />
                  </svg>
                  <p className="text-sm font-medium">No se encontraron usuarios</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {searchResults.map((searchUser) => (
                    <div
                      key={searchUser.id}
                      onClick={() => handleUserSelect(searchUser.username)}
                      className="flex items-center space-x-3 p-4 hover:bg-white cursor-pointer transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-white text-sm font-semibold">
                            {searchUser.username.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        {isUserOnline(searchUser.id) && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {searchUser.username}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{searchUser.email}</p>
                      </div>
                      <div className="flex-shrink-0">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">No hay conversaciones</h3>
            <p className="text-sm text-gray-500 mb-6">Busca usuarios para empezar a chatear</p>
            <button
              onClick={() => setShowSearch(true)}
              className="inline-flex items-center space-x-2 px-5 py-3 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Buscar usuarios</span>
            </button>
          </div>
        ) : (
          <div>
            {chats.map((chat, index) => {
              const partner = getChatPartner(chat);
              const isActive = activeChat && activeChat.id === chat.id;
              
              return (
                <div
                  key={chat.id}
                  onClick={() => onChatSelect(chat)}
                  className={`relative cursor-pointer transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-50 border-r-4 border-transparent'
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-4">
                      <div className="relative flex-shrink-0">
                        <div className={`w-13 h-13 rounded-full flex items-center justify-center shadow-sm ${
                          isActive ? 'bg-blue-500' : 'bg-gradient-to-br from-gray-400 to-gray-500'
                        }`}>
                          <span className="text-white font-bold text-sm">
                            {partner?.username?.substring(0, 2).toUpperCase() || '??'}
                          </span>
                        </div>
                        {partner && isUserOnline(partner.id) && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className={`text-base font-bold truncate ${
                            isActive ? 'text-blue-600' : 'text-gray-900'
                          }`}>
                            {partner?.username || 'Usuario desconocido'}
                          </h3>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-3 font-medium">
                            {getLastMessageTime(chat)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 truncate mb-2 leading-relaxed">
                          {getLastMessage(chat)}
                        </p>
                        
                        <div className="flex items-center">
                          {partner && isUserOnline(partner.id) ? (
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-xs text-green-600 font-medium">En línea</span>
                            </div>
                          ) : partner?.lastSeen ? (
                            <span className="text-xs text-gray-400">
                              Visto {formatDistanceToNow(new Date(partner.lastSeen), { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">Desconectado</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {index < chats.length - 1 && (
                    <div className="mx-4 border-b border-gray-100"></div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 p-4 bg-gray-50 border-t border-gray-200">
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-xs text-gray-500 font-medium mb-2">Tu enlace personal:</p>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-white px-3 py-2.5 rounded-lg border text-xs font-mono text-blue-600 truncate shadow-sm">
                {window.location.origin}/user/{user.username}
              </div>
              <button
                onClick={onGenerateShareLink}
                className="flex-shrink-0 p-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
                title="Copiar enlace"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;