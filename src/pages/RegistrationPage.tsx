import React, { useState } from 'react';
import { Building2, Phone, Mail, User, Briefcase, MapPin, Lock, CheckCircle2, ArrowRight, Hotel, Calendar, MapPinOff, ArrowLeft } from 'lucide-react';
import { registerUser } from '../services/authService';

interface RegistrationFormData {
  companyName: string;
  rfc: string;
  industry: string;
  customIndustry?: string;
  city: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface QuestionnaireData {
  preferredHotel: string;
  frequentChanges: 'yes' | 'no' | '';
  avoidLocations: string;
}

interface RegistrationPageProps {
  onComplete: () => void;
}

export const RegistrationPage: React.FC<RegistrationPageProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'company' | 'personal' | 'questionnaire'>('company');
  const [questionStep, setQuestionStep] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'right' | 'left'>('right');
  const [formData, setFormData] = useState<RegistrationFormData>({
    companyName: '',
    rfc: '',
    industry: '',
    city: '',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [questionnaireData, setQuestionnaireData] = useState<QuestionnaireData>({
    preferredHotel: '',
    frequentChanges: '',
    avoidLocations: ''
  });

  const [passwordError, setPasswordError] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegistrationComplete = async () => {
    try {
      if (isRegistering) return;
      setIsRegistering(true);
      setRegistrationError('');
      
      const result = await registerUser(formData, questionnaireData);
      if (result.success) {
        onComplete();
      }
    } catch (error: any) {
      console.error('Error during registration:', error);
      setRegistrationError(
        error.message || 'Error al registrar. Por favor intenta de nuevo.'
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('personal');
  };

  const handlePersonalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password.length < 8) {
      setPasswordError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    
    setPasswordError('');
    setStep('questionnaire');
  };

  const handleNextQuestion = () => {
    setSlideDirection('right');
    setQuestionStep(prev => prev + 1);
  };

  const handlePrevQuestion = () => {
    setSlideDirection('left');
    setQuestionStep(prev => prev - 1);
  };

  const questions = [
    {
      title: "¿Cuál es tu marca de hotel preferida?",
      icon: Hotel,
      content: (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 transform hover:scale-105 transition-all duration-300">
            <textarea
              value={questionnaireData.preferredHotel}
              onChange={(e) => setQuestionnaireData({ ...questionnaireData, preferredHotel: e.target.value })}
              className="w-full h-32 bg-white/10 backdrop-blur rounded-lg border-2 border-white/20 text-white placeholder-white/60 p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="Ej: Marriott, Hilton, etc."
            />
          </div>
          <p className="text-blue-200 text-sm">
            Conocer tus preferencias nos ayuda a ofrecerte mejores recomendaciones
          </p>
        </div>
      )
    },
    {
      title: "¿Realizas cambios frecuentemente?",
      icon: Calendar,
      content: (
        <div className="grid grid-cols-2 gap-6 max-w-xl mx-auto">
          <button
            type="button"
            onClick={() => {
              setQuestionnaireData({ ...questionnaireData, frequentChanges: 'yes' });
              setTimeout(handleNextQuestion, 500);
            }}
            className={`group relative overflow-hidden rounded-xl p-8 transition-all duration-300 ${
              questionnaireData.frequentChanges === 'yes'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <div className="relative z-10 flex flex-col items-center space-y-4">
              <CheckCircle2 className="w-12 h-12" />
              <span className="text-lg font-medium">Sí</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
          <button
            type="button"
            onClick={() => {
              setQuestionnaireData({ ...questionnaireData, frequentChanges: 'no' });
              setTimeout(handleNextQuestion, 500);
            }}
            className={`group relative overflow-hidden rounded-xl p-8 transition-all duration-300 ${
              questionnaireData.frequentChanges === 'no'
                ? 'bg-blue-600 text-white'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <div className="relative z-10 flex flex-col items-center space-y-4">
              <MapPinOff className="w-12 h-12" />
              <span className="text-lg font-medium">No</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </div>
      )
    },
    {
      title: "¿Hay lugares que prefieres evitar?",
      icon: MapPinOff,
      content: (
        <div className="space-y-6">
          <div className="bg-white/5 backdrop-blur-lg rounded-xl p-8 transform hover:scale-105 transition-all duration-300">
            <textarea
              value={questionnaireData.avoidLocations}
              onChange={(e) => setQuestionnaireData({ ...questionnaireData, avoidLocations: e.target.value })}
              className="w-full h-32 bg-white/10 backdrop-blur rounded-lg border-2 border-white/20 text-white placeholder-white/60 p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
              placeholder="Menciona lugares o tipos de alojamiento que prefieres evitar"
            />
          </div>
          <p className="text-blue-200 text-sm">
            Esta información nos ayuda a filtrar opciones que no te interesan
          </p>
        </div>
      )
    }
  ];

  const renderQuestionnaire = () => (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/20 via-blue-800/20 to-transparent" />
      
      <div className="relative w-full max-w-4xl mx-auto px-4">
        {/* Progress Indicator */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-full max-w-md">
          <div className="flex justify-between mb-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === questionStep
                    ? 'bg-blue-500 scale-125'
                    : index < questionStep
                    ? 'bg-blue-400'
                    : 'bg-blue-300/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Question Content */}
        <div className="relative overflow-hidden">
          <div
            className={`transform transition-all duration-500 ease-in-out ${
              slideDirection === 'right'
                ? 'translate-x-0 opacity-100'
                : '-translate-x-full opacity-0'
            }`}
          >
            <div className="text-center space-y-8">
              {/* Icon */}
              <div className="flex justify-center">
                {React.createElement(questions[questionStep].icon, {
                  className: "w-24 h-24 text-blue-500"
                })}
              </div>

              {/* Title */}
              <h2 className="text-4xl font-bold text-white">
                {questions[questionStep].title}
              </h2>

              {/* Content */}
              <div className="mt-12">
                {questions[questionStep].content}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between items-center mt-12 max-w-md mx-auto">
                {questionStep > 0 ? (
                  <button
                    onClick={handlePrevQuestion}
                    className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Anterior</span>
                  </button>
                ) : (
                  <div /> /* Spacer */
                )}

                {questionStep < questions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
                  >
                    <span>Siguiente</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleRegistrationComplete}
                    disabled={isRegistering}
                    className={`flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${
                      isRegistering ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isRegistering ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Registrando...</span>
                      </>
                    ) : (
                      <>
                        <span>Finalizar</span>
                        <CheckCircle2 className="w-5 h-5" />
                      </>
                    )}
                  </button>
                )}
              </div>

              {registrationError && (
                <div className="mt-4 text-red-300 bg-red-900/50 p-4 rounded-lg">
                  {registrationError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-blue-600">
          {step === 'company' ? 'Información de la Empresa' : 
           step === 'personal' ? 'Información Personal' : 
           'Preferencias'}
        </span>
        <span className="text-sm font-medium text-gray-500">
          Paso {step === 'company' ? '1' : step === 'personal' ? '2' : '3'} de 3
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full">
        <div 
          className="h-full bg-blue-600 rounded-full transition-all duration-500"
          style={{ 
            width: step === 'company' ? '33.33%' : 
                   step === 'personal' ? '66.66%' : '100%' 
          }}
        />
      </div>
    </div>
  );

  const renderCompanyForm = () => (
    <form onSubmit={handleCompanySubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre de la Persona/Empresa */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre de la Persona/Empresa <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Building2 className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* RFC */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            RFC (Opcional)
          </label>
          <input
            type="text"
            value={formData.rfc}
            onChange={(e) => setFormData({ ...formData, rfc: e.target.value })}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Industria o Sector */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Industria o Sector <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Briefcase className="h-5 w-5 text-gray-400" />
            </div>
            <select
              required
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="">Selecciona una industria</option>
              <option value="tecnologia">Tecnología</option>
              <option value="finanzas">Finanzas</option>
              <option value="retail">Retail</option>
              <option value="manufactura">Manufactura</option>
              <option value="otros">Otros</option>
            </select>
          </div>
        </div>

        {formData.industry === 'otros' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Especifica tu industria <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.customIndustry}
              onChange={(e) => setFormData({ ...formData, customIndustry: e.target.value })}
              className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        )}

        {/* Ciudad Principal de Operaciones */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ciudad Principal de Operaciones <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              required
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <span>Continuar</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );

  const renderPersonalForm = () => (
    <form onSubmit={handlePersonalSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre Completo */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre Completo <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Correo Electrónico */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo Electrónico <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Teléfono */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contraseña <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Mínimo 8 caracteres"
            />
          </div>
        </div>

        {/* Confirmar Contraseña */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirmar Contraseña <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {passwordError && (
        <div className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
          {passwordError}
        </div>
      )}

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setStep('company')}
          className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Regresar
        </button>
        <button
          type="submit"
          className="flex-1 flex items-center justify-center space-x-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <span>Continuar</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );

  const renderContent = () => {
    switch (step) {
      case 'company':
        return (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Información de la Empresa</h2>
              <p className="mt-2 text-gray-600">Cuéntanos sobre tu organización</p>
            </div>
            {renderCompanyForm()}
          </>
        );
      case 'personal':
        return (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Información Personal</h2>
              <p className="mt-2 text-gray-600">Datos de acceso a tu cuenta</p>
            </div>
            {renderPersonalForm()}
          </>
        );
      case 'questionnaire':
        return renderQuestionnaire();
    }
  };

  if (step === 'questionnaire') {
    return renderQuestionnaire();
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="md:grid md:grid-cols-5">
            {/* Left Panel - Decorative */}
            <div className="hidden md:block md:col-span-2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 relative">
              <div className="absolute inset-0 opacity-10 bg-pattern"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-6">
                  Únete a la Experiencia de Viaje
                </h2>
                <p className="text-blue-100 mb-8 leading-relaxed">
                  Descubre un mundo de posibilidades con nuestro asistente inteligente de viajes.
                </p>
                <div className="space-y-6">
                  <div className="flex items-center space-x-3 text-white">
                    <CheckCircle2 className="w-6 h-6 text-blue-300" />
                    <span>Reservas personalizadas</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white">
                    <CheckCircle2 className="w-6 h-6 text-blue-300" />
                    <span>Asistencia 24/7</span>
                  </div>
                  <div className="flex items-center space-x-3 text-white">
                    <CheckCircle2 className="w-6 h-6 text-blue-300" />
                    <span>Ofertas exclusivas</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Panel - Form */}
            <div className="md:col-span-3 p-8 lg:p-12">
              <div className="max-w-2xl mx-auto">
                {renderProgressBar()}
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};