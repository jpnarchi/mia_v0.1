import React from 'react';
import { CheckCircle, ArrowLeft } from 'lucide-react';

interface SuccessPageProps {
  onBack?: () => void;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({ onBack }) => {
  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      sessionStorage.removeItem('pendingBookingData');
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            ¡Reservación Completada!
          </h1>
          
          <div className="text-gray-600 space-y-2 mb-6">
            <p>Tu reservación ha sido registrada exitosamente.</p>
            <p className="text-sm">
              Recibirás un correo con los detalles de tu reservación.
            </p>
          </div>

          <button
            onClick={handleBackClick}
            className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver al Inicio</span>
          </button>
        </div>
      </div>
    </div>
  );
};