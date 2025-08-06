import React from 'react';

const WelcomeScreen = ({ user, onGenerateShareLink }) => {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="max-w-md text-center px-6">

        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>


        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ChatLD
          </h1>
          <p className="text-lg text-gray-600 mb-1">
            ¡Hola, {user.username}!
          </p>
          <p className="text-sm text-gray-500">
            Selecciona un chat o comparte tu enlace
          </p>
        </div>

        <div className="space-y-4">

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Tu enlace de chat
            </h3>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-4 border">
              <p className="text-sm font-mono text-blue-600 break-all">
                {window.location.origin}/user/{user.username}
              </p>
            </div>
            
            <button
              onClick={onGenerateShareLink}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
            >
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Copiar enlace</span>
              </div>
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-1" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12H9m6-4H9m6 8H9" />
              </svg>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Comenzar a chatear
            </h3>
            
            <p className="text-sm text-gray-600">
              Busca usuarios en el panel lateral o espera a que alguien te contacte
            </p>
          </div>
        </div>

        <div className="mt-8">
          <p className="text-xs text-gray-400">
            Chat en tiempo real • Estado en línea • Notificaciones
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;