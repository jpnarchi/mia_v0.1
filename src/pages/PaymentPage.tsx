import React, { useState } from 'react';
import { ArrowLeft, CreditCard, Receipt, Building2, FileText } from 'lucide-react';
import type { BookingData } from '../types';

interface PaymentPageProps {
  bookingData?: BookingData;
  onBack?: () => void;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({ bookingData: propBookingData, onBack }) => {
  const [bookingData] = useState<BookingData | null>(() => {
    const pendingBookingData = sessionStorage.getItem('pendingBookingData');
    return pendingBookingData ? JSON.parse(pendingBookingData) : propBookingData || null;
  });

  const [showBillingOptions, setShowBillingOptions] = useState(false);

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No hay datos de reservación
          </h2>
          <button
            onClick={onBack}
            className="inline-flex items-center text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a la reserva
          </button>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total a Pagar</p>
            <p className="text-xl font-bold text-gray-900">
              ${bookingData.room?.totalPrice?.toLocaleString('es-MX')} MXN
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Billing Options */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Receipt className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Opciones de Facturación</h3>
                  <p className="text-sm text-gray-500">Configura tus datos de facturación</p>
                </div>
              </div>
              <button
                onClick={() => setShowBillingOptions(!showBillingOptions)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                {showBillingOptions ? 'Ocultar opciones' : 'Mostrar opciones'}
              </button>
            </div>

            {showBillingOptions && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Razón Social
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nombre o razón social"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">
                      RFC
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        className="pl-10 block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="RFC para facturación"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Correo para Facturación
                  </label>
                  <input
                    type="email"
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    La factura será enviada al correo proporcionado una vez que se procese el pago.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Payment Section */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Página de Pago</h2>
              <p className="text-gray-600 mt-2">
                La integración de pagos está temporalmente deshabilitada
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-blue-50 rounded-lg p-4 text-blue-700">
                <p>
                  Para completar tu reservación, por favor contacta a nuestro equipo de soporte.
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detalles de la Reservación</h3>
                <dl className="grid grid-cols-1 gap-4">
                  <div className="bg-gray-50 px-4 py-3 rounded-lg">
                    <dt className="text-sm text-gray-500">Hotel</dt>
                    <dd className="text-gray-900 font-medium">{bookingData.hotel.name}</dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 rounded-lg">
                    <dt className="text-sm text-gray-500">Fechas</dt>
                    <dd className="text-gray-900 font-medium">
                      {new Date(bookingData.dates.checkIn!).toLocaleDateString()} - {new Date(bookingData.dates.checkOut!).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 rounded-lg">
                    <dt className="text-sm text-gray-500">Tipo de Habitación</dt>
                    <dd className="text-gray-900 font-medium">
                      {bookingData.room.type === 'single' ? 'Sencilla' : 'Doble'}
                    </dd>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 rounded-lg">
                    <dt className="text-sm text-gray-500">Total</dt>
                    <dd className="text-gray-900 font-medium">
                      ${bookingData.room.totalPrice?.toLocaleString('es-MX')} MXN
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};