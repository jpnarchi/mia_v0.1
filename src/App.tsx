import React, { useState, useEffect } from 'react';
import { AuthModal } from './components/AuthModal';
import { ChatMessage } from './components/ChatMessage';
import { Navigation } from './components/Navigation';
import { sendMessageToN8N } from './services/n8nService';
import { supabase } from './services/supabaseClient';
import type { User, Message, AuthState, BookingData } from './types';
import { Menu, X, MessageSquare, Lock, Plane, MapPin, Calendar, Hotel, Building2, ArrowRight } from 'lucide-react';
import { ReservationPanel } from './components/ReservationPanel';
import { PaymentPage } from './pages/PaymentPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { ProfilePage } from './pages/ProfilePage';
import { BookingsReportPage } from './pages/BookingsReportPage';

const ResponsiveChat = () => {
  const [currentPage, setCurrentPage] = useState<'chat' | 'profile' | 'registration' | 'payment' | 'bookings'>('chat');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [showPaymentPage, setShowPaymentPage] = useState(false);
  const [showRegistrationPage, setShowRegistrationPage] = useState(false);
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    promptCount: 0
  });

  useEffect(() => {
    // Add event listener for payment page navigation
    const handleShowPaymentPage = (event: CustomEvent<{ bookingData: BookingData }>) => {
      setBookingData(event.detail.bookingData);
      setCurrentPage('payment');
    };

    window.addEventListener('showPaymentPage', handleShowPaymentPage as EventListener);

    return () => {
      window.removeEventListener('showPaymentPage', handleShowPaymentPage as EventListener);
    };
  }, []);

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setAuthState({
          user: {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.full_name || session.user.email!.split('@')[0]
          },
          isAuthenticated: true,
          promptCount: 0
        });
      }
    });

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setAuthState({
          user: {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata.full_name || session.user.email!.split('@')[0]
          },
          isAuthenticated: true,
          promptCount: 0
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          promptCount: 0
        });
        setCurrentPage('chat');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        setAuthState({
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata.full_name || data.user.email!.split('@')[0]
          },
          isAuthenticated: true,
          promptCount: 0
        });
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        setAuthState({
          user: {
            id: data.user.id,
            email: data.user.email!,
            name: name
          },
          isAuthenticated: true,
          promptCount: 0
        });
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error registering:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setAuthState({
        user: null,
        isAuthenticated: false,
        promptCount: 0
      });
      setMessages([]);
      setBookingData(null);
      setCurrentPage('chat');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleLoginClick = () => {
    setIsModalOpen(true);
  };

  const handleRegisterClick = () => {
    setCurrentPage('registration');
  };

  const handleRegistrationComplete = () => {
    setCurrentPage('chat');
  };

  const handleProfileClick = () => {
    setCurrentPage('profile');
  };

  const handleChatClick = () => {
    setCurrentPage('chat');
  };

  const handleBackToChat = () => {
    setCurrentPage('chat');
  };

  const handleBookingsClick = () => {
    setCurrentPage('bookings');
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Check if user has reached prompt limit
    if (!authState.isAuthenticated && authState.promptCount >= 2) {
      setShowRegistrationPage(true);
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      timestamp: new Date(),
      isUser: true
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Increment prompt count for unauthenticated users
    if (!authState.isAuthenticated) {
      setAuthState(prev => ({
        ...prev,
        promptCount: prev.promptCount + 1
      }));
    }

    try {
      const response = await sendMessageToN8N(inputMessage, authState.user?.id);
      
      if (response.data?.bookingData) {
        setBookingData(response.data.bookingData);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.output || 'Lo siento, hubo un error al procesar tu mensaje.',
        timestamp: new Date(),
        isUser: false
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Lo siento, hubo un error al procesar tu mensaje.',
        timestamp: new Date(),
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToPayment = () => {
    setCurrentPage('payment');
  };

  const showWelcomeMessage = messages.length === 0;
  const promptLimitReached = !authState.isAuthenticated && authState.promptCount >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-blue-400 to-blue-300">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Navigation 
          user={authState.user} 
          onLogout={handleLogout}
          onRegister={handleRegisterClick}
          onLogin={handleLoginClick}
          onProfileClick={handleProfileClick}
          onChatClick={handleChatClick}
          onBookingsClick={handleBookingsClick}
        />
      </div>
      
      <AuthModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onNavigateToRegister={handleRegisterClick}
      />

      {currentPage === 'registration' ? (
        <RegistrationPage onComplete={handleRegistrationComplete} />
      ) : currentPage === 'payment' && bookingData ? (
        <PaymentPage bookingData={bookingData} onBack={handleBackToChat} />
      ) : currentPage === 'profile' ? (
        <ProfilePage onBack={handleBackToChat} />
      ) : currentPage === 'bookings' ? (
        <BookingsReportPage onBack={handleBackToChat} />
      ) : (
        <div className="flex min-h-screen pt-16">
          {/* Chat Panel - Left Side */}
          <div className={`${showWelcomeMessage ? 'w-full' : 'w-1/2'} transition-all duration-500 ${!showWelcomeMessage && 'fixed left-0 h-[calc(100vh-4rem)]'}`}>
            {showWelcomeMessage ? (
              <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
                <div className="relative w-full max-w-7xl mx-auto px-4">
                  <div className="grid grid-cols-2 items-center gap-8">
                    {/* Content Section - Left */}
                    <div className="relative z-10 text-white space-y-8">
                      <h1 className="text-6xl font-bold mb-4">
                        ¡Hola! Soy MIA!
                      </h1>
                      <h2 className="text-3xl font-light mb-12">
                        Tu Agente de Inteligencia<br />
                        para Viajes Corporativos.
                      </h2>

                      <div className="grid grid-cols-4 gap-3 mb-12">
                        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 transform hover:scale-105 transition-all duration-300">
                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium">Empresas</span>
                          </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 transform hover:scale-105 transition-all duration-300">
                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                              <Plane className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium">Vuelos</span>
                          </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 transform hover:scale-105 transition-all duration-300">
                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                              <Hotel className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium">Hoteles</span>
                          </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 transform hover:scale-105 transition-all duration-300">
                          <div className="flex flex-col items-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-sm font-medium">Reservas</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="relative">
                          <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="¿A dónde te gustaría viajar?"
                            className="w-full p-6 rounded-xl border-2 border-white/20 bg-white/10 text-white placeholder-white/70 focus:outline-none focus:border-white/40 transition-colors text-lg shadow-lg"
                          />
                          <MapPin className="absolute right-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white/50" />
                        </div>
                        <button
                          onClick={handleSendMessage}
                          className="w-full flex items-center justify-center space-x-3 bg-white text-blue-600 px-8 py-6 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 text-lg shadow-lg transform hover:-translate-y-1 hover:shadow-xl"
                        >
                          <span>Comenzar mi Viaje</span>
                          <ArrowRight className="w-6 h-6" />
                        </button>
                      </div>
                    </div>

                    {/* SVG Section - Right */}
                    <div className="flex items-center justify-center">
                      <div className="w-[500px] h-[500px]">
                        <svg viewBox="0 0 493 539" className="w-full h-full fill-white">
                          <path d="M205.1,500.5C205.1,500.5,205,500.6,205.1,500.5C140.5,436.1,71.7,369.1,71.7,291.1c0-86.6,84.2-157.1,187.6-157.1S447,204.4,447,291.1c0,74.8-63.4,139.6-150.8,154.1c0,0,0,0,0,0l-8.8-53.1c61.3-10.2,105.8-52.6,105.8-100.9c0-56.9-60-103.2-133.7-103.2s-133.7,46.3-133.7,103.2c0,49.8,48,93.6,111.7,101.8c0,0,0,0,0,0L205.1,500.5L205.1,500.5z"/>
                          <path d="M341,125.5c-2.9,0-5.8-0.7-8.6-2.1c-70.3-37.3-135.9-1.7-138.7-0.2c-8.8,4.9-20,1.8-24.9-7.1c-4.9-8.8-1.8-20,7-24.9c3.4-1.9,85.4-47.1,173.8-0.2c9,4.8,12.4,15.9,7.6,24.8C353.9,122,347.6,125.5,341,125.5z"/>
                          <path d="M248.8,263.8c-38.1-26-73.7-0.8-75.2,0.2c-6.4,4.6-8.7,14-5.3,21.8c1.9,4.5,5.5,7.7,9.8,8.9c4,1.1,8.2,0.3,11.6-2.1c0.9-0.6,21.4-14.9,43.5,0.2c2.2,1.5,4.6,2.3,7.1,2.4c0.2,0,0.4,0,0.6,0c0,0,0,0,0,0c5.9,0,11.1-3.7,13.5-9.7C257.8,277.6,255.4,268.3,248.8,263.8z"/>
                          <path d="M348.8,263.8c-38.1-26-73.7-0.8-75.2,0.2c-6.4,4.6-8.7,14-5.3,21.8c1.9,4.5,5.5,7.7,9.8,8.9c4,1.1,8.2,0.3,11.6-2.1c0.9-0.6,21.4-14.9,43.5,0.2c2.2,1.5,4.6,2.3,7.1,2.4c0.2,0,0.4,0,0.6,0c0,0,0,0,0,0c5.9,0,11.1-3.7,13.5-9.7C357.8,277.6,355.4,268.3,348.8,263.8z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col h-full bg-gradient-to-br from-blue-500 via-blue-400 to-blue-300">
                {/* Chat Messages Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <div className="max-w-3xl mx-auto space-y-4">
                    {messages.map((message) => (
                      <ChatMessage
                        key={message.id}
                        content={message.content}
                        isUser={message.isUser}
                      />
                    ))}
                    {isLoading && (
                      <ChatMessage
                        content="Escribiendo..."
                        isUser={false}
                        isLoading={true}
                      />
                    )}
                    {promptLimitReached && (
                      <div className="bg-white/10 backdrop-blur-lg border-l-4 border-yellow-400 p-4 rounded-lg shadow-md">
                        <div className="flex items-center">
                          <Lock className="h-5 w-5 text-yellow-400 mr-2" />
                          <p className="text-sm text-white">
                            Has alcanzado el límite de mensajes. Por favor regístrate para continuar.
                          </p>
                        </div>
                        <button
                          onClick={() => setCurrentPage('registration')}
                          className="mt-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                        >
                          Registrarse ahora
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chat Input Area */}
                <div className="border-t border-white/10 backdrop-blur-lg p-6">
                  <div className="max-w-3xl mx-auto">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder={promptLimitReached ? "Regístrate para continuar..." : "Escribe tu mensaje..."}
                          disabled={promptLimitReached}
                          className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent disabled:bg-white/5 disabled:text-white/50 transition-all duration-200"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/50">
                          <MessageSquare className="w-5 h-5" />
                        </div>
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={promptLimitReached || !inputMessage.trim()}
                        className={`px-8 py-4 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2
                          ${promptLimitReached || !inputMessage.trim() 
                            ? 'bg-white/10 text-white/50 cursor-not-allowed' 
                            : 'bg-white text-blue-600 hover:bg-blue-50 transform hover:-translate-y-0.5 hover:shadow-lg'}`}
                      >
                        <span>Enviar</span>
                        <ArrowRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reservation Panel - Right Side */}
          {!showWelcomeMessage && (
            <div className="w-1/2 ml-[50%] min-h-[calc(100vh-4rem)] p-6 bg-gradient-to-br from-blue-500 via-blue-400 to-blue-300">
              <ReservationPanel
                bookingData={bookingData}
                onProceedToPayment={handleProceedToPayment}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResponsiveChat;