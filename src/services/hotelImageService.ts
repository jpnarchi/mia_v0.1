import axios from 'axios';

interface HotelImage {
  title: string;
  imageUrl: string;
}

export const fetchHotelImages = async (hotelName: string): Promise<HotelImage[]> => {
  try {
    const response = await axios.post(
      'https://google.serper.dev/images',
      {
        q: hotelName,
        gl: 'mx',
        hl: 'es-419'
      },
      {
        headers: {
          'X-API-KEY': '29b890fc6843fbe1dd70cb573990cfd2f1da8e38',
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data && response.data.images) {
      // Only take the first 3 images
      return response.data.images
        .slice(0, 3)
        .map(image => ({
          title: image.title || '',
          imageUrl: image.imageUrl
        }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching hotel images:', error);
    return [];
  }
};