import { fetchHotelImages } from './hotelImageService';
import type { BookingData } from '../types';

const N8N_WEBHOOK_URL = 'https://noktos.app.n8n.cloud/webhook/9a240546-3ce3-4b39-9dd2-c006239f560b';

const generateSessionId = () => {
  return Array.from({ length: 32 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
};

const sessionId = generateSessionId();

const createEmptyBookingData = (): BookingData => ({
  confirmationCode: null,
  hotel: {
    name: null,
    location: null,
    image: null,
    additionalImages: []
  },
  dates: {
    checkIn: null,
    checkOut: null
  },
  room: {
    type: null,
    pricePerNight: null,
    totalPrice: null
  },
  guests: [],
  totalNights: null
});

let currentBookingData: BookingData = createEmptyBookingData();

const extractBookingConfirmation = (message: string) => {
  const confirmationPattern = /¡Se ha creado la reserva para .* exitosamente!/;
  if (!confirmationPattern.test(message)) return null;

  const extractValue = (pattern: RegExp, text: string) => {
    const match = text.match(pattern);
    return match ? match[1].trim() : null;
  };

  const namePattern = /Reserva a nombre de: (.*)/;
  const hotelPattern = /Hotel: (.*)/;
  const datesPattern = /Fechas de estancia: del (\d{2}-\d{2}-\d{4}) al (\d{2}-\d{2}-\d{4})/;
  const roomTypePattern = /Tipo de habitación: (.*)/;
  const totalNightsPattern = /Total de Noches: (\d+)/;
  const pricePerNightPattern = /Precio por Noche: \$?([\d,]+(?:\.\d{2})?)/;
  const totalPricePattern = /Precio total: \$?([\d,]+(?:\.\d{2})?)/;
  const guestsPattern = /Número de personas: (\d+)/;

  const name = extractValue(namePattern, message);
  const hotel = extractValue(hotelPattern, message);
  const datesMatch = message.match(datesPattern);
  const roomType = extractValue(roomTypePattern, message);
  const totalNights = extractValue(totalNightsPattern, message);
  const pricePerNight = extractValue(pricePerNightPattern, message);
  const totalPrice = extractValue(totalPricePattern, message);
  const guests = extractValue(guestsPattern, message);

  if (datesMatch) {
    const [_, checkIn, checkOut] = datesMatch;
    const formatDate = (dateStr: string) => {
      const [day, month, year] = dateStr.split('-');
      return `${year}-${month}-${day}`;
    };

    return {
      confirmationCode: `RES${Date.now().toString().slice(-6)}`,
      hotel: {
        name: hotel,
        location: null,
        image: null,
        additionalImages: []
      },
      dates: {
        checkIn: formatDate(checkIn),
        checkOut: formatDate(checkOut)
      },
      room: {
        type: roomType?.toLowerCase().includes('sencilla') ? 'single' : 'double',
        pricePerNight: parseFloat(pricePerNight?.replace(/,/g, '') || '0'),
        totalPrice: parseFloat(totalPrice?.replace(/,/g, '') || '0')
      },
      guests: name ? [name] : [],
      totalNights: parseInt(totalNights || '0', 10)
    };
  }

  return null;
};

const extractHotelName = (message: string): string | null => {
  const match = message.match(/Genial, comencemos con tu reserva para ([^.]+)\./);
  return match ? match[1].trim() : null;
};

const extractDates = (message: string): { checkIn: string | null, checkOut: string | null } | null => {
  const datePattern = /Perfecto, tu estancia ha sido confirmada del (\d{2}-\d{2}-\d{4}) al (\d{2}-\d{2}-\d{4})/;
  const match = message.match(datePattern);
  
  if (match) {
    const [_, checkIn, checkOut] = match;
    const formatDate = (dateStr: string) => {
      const [day, month, year] = dateStr.split('-');
      return `${year}-${month}-${day}`;
    };
    
    return {
      checkIn: formatDate(checkIn),
      checkOut: formatDate(checkOut)
    };
  }
  
  return null;
};

const calculateNights = (checkIn: string, checkOut: string): number => {
  const [checkInYear, checkInMonth, checkInDay] = checkIn.split('-').map(Number);
  const [checkOutYear, checkOutMonth, checkOutDay] = checkOut.split('-').map(Number);
  
  const startDate = new Date(checkInYear, checkInMonth - 1, checkInDay);
  const endDate = new Date(checkOutYear, checkOutMonth - 1, checkOutDay);
  
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

export const sendMessageToN8N = async (message: string, userId?: string) => {
  try {
    // Check for booking confirmation first
    const bookingConfirmation = extractBookingConfirmation(message);
    if (bookingConfirmation) {
      currentBookingData = bookingConfirmation;
      
      // Fetch hotel images if we have a hotel name
      if (bookingConfirmation.hotel.name) {
        const hotelImages = await fetchHotelImages(bookingConfirmation.hotel.name);
        currentBookingData.hotel.additionalImages = hotelImages.map(img => img.imageUrl);
      }
    } else {
      // If no booking confirmation, check for dates
      const dates = extractDates(message);
      if (dates) {
        const totalNights = calculateNights(dates.checkIn!, dates.checkOut!);
        currentBookingData = {
          ...currentBookingData,
          dates,
          totalNights
        };
      }

      // Check for hotel name change
      const hotelName = extractHotelName(message);
      if (hotelName && hotelName !== currentBookingData.hotel.name) {
        // Reset booking data when hotel changes
        currentBookingData = createEmptyBookingData();
        currentBookingData.hotel.name = hotelName;
        
        // Fetch new hotel images
        const hotelImages = await fetchHotelImages(hotelName);
        currentBookingData.hotel.additionalImages = hotelImages.map(img => img.imageUrl);
      }
    }

    // Prepare the request payload
    const payload = {
      message,
      userId,
      sessionId,
      timestamp: new Date().toISOString(),
      output: message,
      type: null,
      data: {
        bookingData: currentBookingData
      }
    };

    // Make the request to N8N
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Error al enviar mensaje a n8n: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error('Respuesta inválida de n8n');
    }

    const output = data[0]?.output ?? message;
    
    // Check for booking confirmation in the response
    const responseBookingConfirmation = extractBookingConfirmation(output);
    if (responseBookingConfirmation) {
      currentBookingData = responseBookingConfirmation;
      
      // Fetch hotel images if we have a hotel name
      if (responseBookingConfirmation.hotel.name) {
        const hotelImages = await fetchHotelImages(responseBookingConfirmation.hotel.name);
        currentBookingData.hotel.additionalImages = hotelImages.map(img => img.imageUrl);
      }
    } else {
      // If no booking confirmation, check for dates in the response
      const outputDates = extractDates(output);
      if (outputDates) {
        const totalNights = calculateNights(outputDates.checkIn!, outputDates.checkOut!);
        currentBookingData = {
          ...currentBookingData,
          dates: outputDates,
          totalNights
        };
      }

      // Check for hotel name change in the response
      const responseHotelName = extractHotelName(output);
      if (responseHotelName && responseHotelName !== currentBookingData.hotel.name) {
        // Reset booking data when hotel changes
        currentBookingData = createEmptyBookingData();
        currentBookingData.hotel.name = responseHotelName;
        
        // Fetch new hotel images
        const hotelImages = await fetchHotelImages(responseHotelName);
        currentBookingData.hotel.additionalImages = hotelImages.map(img => img.imageUrl);
      }
    }

    return {
      output,
      type: data[0]?.type ?? null,
      data: {
        bookingData: currentBookingData
      }
    };
  } catch (error: any) {
    console.error('Error en n8nService:', error);
    throw error;
  }
};