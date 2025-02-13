import React from 'react';
import { XCircle, ArrowLeft } from 'lucide-react';

interface CancelPageProps {
  onBack?: () => void;
}

export const CancelPage: React.FC<CancelPageProps> = ({ onBack }) => {
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
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Reservación Cancelada
          </h1>
          
          <p className="text-gray-600 mb-8">
            La reservación ha sido cancelada. Puedes intentarlo nuevamente cuando lo desees.
          </p>

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