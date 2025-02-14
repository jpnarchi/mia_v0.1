import React from 'react';
import type { BookingData } from '../types';
import { Calendar, Users, CreditCard, Building2, ArrowRight, Check, Clock, Download, Receipt, CreditCard as PaymentIcon } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { supabase } from '../services/supabaseClient';
import { CallToBackend } from '../components/CallToBackend';

const DOMAIN = "http://localhost:5173";
const getPaymentData = (bookingData: BookingData) => {
  const payment_metadata = {
    confirmation_code: bookingData.confirmationCode
  };

  // Obtener la primera imagen adicional si existe
  const imageToUse = bookingData.hotel.additionalImages?.[0] || 
                     bookingData.hotel.image || 
                     "https://www.tvtime.com/_next/image?url=https%3A%2F%2Fartworks.thetvdb.com%2Fbanners%2Fv4%2Fmovie%2F567%2Fposters%2F668ad17fe053a.jpg";

  // Obtener la URL actual completa
  const currentUrl = window.location.href;

  return {
    line_items: [
      {
        price_data: {
          currency: "mxn",
          product_data: {
            name: bookingData.hotel.name,
            description: `Reservación en ${bookingData.hotel.name} - ${bookingData.room?.type === 'single' ? 'Habitación Sencilla' : 'Habitación Doble'}`,
            images: [imageToUse],
          },
          unit_amount: Math.round((bookingData.room?.totalPrice || 0) * 100),
        },
        quantity: 1,
      }
    ],
    mode: "payment",
    success_url: `${DOMAIN}?success=true&session={CHECKOUT_SESSION_ID}&metadata=${JSON.stringify(payment_metadata)}`,
    cancel_url: currentUrl,  // Aquí usamos la URL actual
  };
};

interface ReservationPanelProps {
  bookingData?: BookingData;
  onProceedToPayment?: () => void;
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return {
    weekday: date.toLocaleDateString('es-MX', { weekday: 'long' }),
    day: date.getDate(),
    month: date.toLocaleDateString('es-MX', { month: 'long' }),
    year: date.getFullYear()
  };
};

export const ReservationPanel: React.FC<ReservationPanelProps> = ({ 
  bookingData,
  onProceedToPayment 
}) => {
  const handleDownloadPDF = () => {
    const element = document.getElementById('reservation-content');
    if (!element) return;

    const opt = {
      margin: 1,
      filename: `reservacion-${bookingData?.confirmationCode || 'borrador'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const handleProceedToPayment = async () => {
    if (!bookingData) return;

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Save booking to database
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
          confirmation_code: bookingData.confirmationCode,
          user_id: user.id,
          hotel_name: bookingData.hotel.name,
          check_in: bookingData.dates.checkIn,
          check_out: bookingData.dates.checkOut,
          room_type: bookingData.room?.type,
          total_price: bookingData.room?.totalPrice,
          status: 'pending'
        })
        .select()
        .single();

      if (bookingError) {
        console.error('Error saving booking:', bookingError);
        throw bookingError;
      }

      // Call the onProceedToPayment callback
      if (onProceedToPayment) {
        onProceedToPayment();
      }
    } catch (error) {
      console.error('Error proceeding to payment:', error);
      // You might want to show an error message to the user here
    }
  };

  if (!bookingData) {
    return (
      <div className="h-full bg-white p-6 rounded-lg shadow-lg flex items-center justify-center">
        <div className="text-center text-[#10244c]">
          <p className="text-lg mb-2">Aún no hay detalles de la reservación</p>
          <p className="text-sm opacity-80">Los detalles se mostrarán aquí conforme avance la conversación</p>
        </div>
      </div>
    );
  }

  const hasAnyData = bookingData.hotel?.name || 
                     bookingData.dates?.checkIn || 
                     bookingData.room?.type || 
                     bookingData.confirmationCode;

  if (!hasAnyData) {
    return (
      <div className="h-full bg-white p-6 rounded-lg shadow-lg flex items-center justify-center">
        <div className="text-center text-[#10244c]">
          <p className="text-lg mb-2">Aún no hay detalles de la reservación</p>
          <p className="text-sm opacity-80">Los detalles se mostrarán aquí conforme avance la conversación</p>
        </div>
      </div>
    );
  }

  const checkInDate = formatDate(bookingData.dates?.checkIn);
  const checkOutDate = formatDate(bookingData.dates?.checkOut);

  return (
    <div className="h-full bg-white p-6 rounded-lg shadow-lg space-y-10 overflow-y-auto">
      {bookingData.confirmationCode && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl overflow-hidden shadow-lg mb-10">
          <div className="p-6">
            <div className="flex flex-col space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <Check className="w-6 h-6 text-green-500" />
                  <div>
                    <h2 className="text-lg font-semibold text-[#10244c]">¡Reservación Creada!</h2>
                    <p className="text-[#10244c]/80">Código: {bookingData.confirmationCode}</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CallToBackend 
                paymentData={getPaymentData(bookingData)}
                className="flex items-center justify-center space-x-3 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <PaymentIcon className="w-5 h-5" />
                <span className="font-semibold">Proceder al Pago</span>
                <ArrowRight className="w-5 h-5" />
              </CallToBackend>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center justify-center space-x-3 px-6 py-3 bg-[#10244c] text-white rounded-xl hover:bg-[#10244c]/90 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Download className="w-5 h-5" />
                <span className="font-semibold">Descargar Reservación</span>
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
      
      <div id="reservation-content" className="space-y-8">
        {bookingData.hotel?.name && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-[#10244c]" />
              <h3 className="text-lg font-semibold text-[#10244c]">Hotel</h3>
            </div>
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              {bookingData.hotel.image && (
                <img 
                  src={bookingData.hotel.image} 
                  alt={bookingData.hotel.name}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h4 className="font-semibold text-lg text-[#10244c]">{bookingData.hotel.name}</h4>
                {bookingData.hotel.location && (
                  <p className="text-[#10244c]/80">{bookingData.hotel.location}</p>
                )}
              </div>
            </div>

            {bookingData.hotel.additionalImages && bookingData.hotel.additionalImages.length > 0 && (
              <div className="grid grid-cols-3 gap-4 mt-4">
                {bookingData.hotel.additionalImages.slice(0, 3).map((imageUrl, index) => (
                  <div key={index} className="aspect-square rounded-lg overflow-hidden shadow-sm">
                    <img
                      src={imageUrl}
                      alt={`${bookingData.hotel.name} - Vista ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {(bookingData.dates?.checkIn || bookingData.dates?.checkOut) && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-[#10244c]" />
              <h3 className="text-lg font-semibold text-[#10244c]">Fechas de Estancia</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-[#10244c]/80 text-sm uppercase tracking-wider">Check-in</p>
                  {checkInDate ? (
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-[#10244c]">{checkInDate.day + 1}</p>
                      <div>
                        <p className="text-lg capitalize text-[#10244c]">{checkInDate.month}</p>
                        <p className="text-sm text-[#10244c]/80 capitalize">{checkInDate.weekday}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-lg text-[#10244c]">Por definir</p>
                  )}
                </div>

                {bookingData.totalNights && (
                  <div className="flex flex-col items-center">
                    <ArrowRight className="w-6 h-6 text-[#10244c]/80" />
                    <div className="mt-2 text-center">
                      <p className="text-sm text-[#10244c]/80">Duración</p>
                      <p className="font-bold text-[#10244c]">{bookingData.totalNights} {bookingData.totalNights === 1 ? 'noche' : 'noches'}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <p className="text-[#10244c]/80 text-sm uppercase tracking-wider">Check-out</p>
                  {checkOutDate ? (
                    <div className="space-y-1">
                      <p className="text-3xl font-bold text-[#10244c]">{checkOutDate.day + 1}</p>
                      <div>
                        <p className="text-lg capitalize text-[#10244c]">{checkOutDate.month}</p>
                        <p className="text-sm text-[#10244c]/80 capitalize">{checkOutDate.weekday}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-lg text-[#10244c]">Por definir</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {bookingData.room?.type && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-[#10244c]" />
              <h3 className="text-lg font-semibold text-[#10244c]">Detalles de la Habitación</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-[#10244c]/80">Tipo de Habitación</p>
                    <p className="text-lg font-medium text-[#10244c]">
                      {bookingData.room.type === 'single' ? 'Sencilla' : 'Doble'}
                    </p>
                  </div>
                  {bookingData.totalNights && (
                    <div>
                      <p className="text-sm text-[#10244c]/80">Duración</p>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-[#10244c]/80" />
                        <p className="text-lg font-medium text-[#10244c]">
                          {bookingData.totalNights} {bookingData.totalNights === 1 ? 'noche' : 'noches'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {bookingData.room.pricePerNight && (
                    <div>
                      <p className="text-sm text-[#10244c]/80">Precio por Noche</p>
                      <p className="text-lg font-medium text-[#10244c]">
                        ${bookingData.room.pricePerNight.toLocaleString('es-MX')} MXN
                      </p>
                    </div>
                  )}
                  {bookingData.room.totalPrice && (
                    <div>
                      <p className="text-sm text-[#10244c]/80">Precio Total</p>
                      <p className="text-xl font-semibold text-[#10244c]">
                        ${bookingData.room.totalPrice.toLocaleString('es-MX')} MXN
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {bookingData.guests?.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-[#10244c]" />
              <h3 className="text-lg font-semibold text-[#10244c]">Huéspedes</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="space-y-2">
                {bookingData.guests.map((guest, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-[#10244c]/10 flex items-center justify-center">
                      <span className="text-[#10244c] font-medium">{guest.charAt(0)}</span>
                    </div>
                    <span className="text-[#10244c]/90">{guest}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};