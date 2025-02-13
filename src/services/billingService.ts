import { BillingOption, Invoice } from '../types';
import { supabase } from './supabaseClient';
import { Receipt, FileText, Calendar, Users, Building2, Layers, DollarSign, Percent, MoreHorizontal as CombineHorizontal, Building } from 'lucide-react';

export const billingOptions: BillingOption[] = [
  // Basic Options
  {
    id: 'purchase',
    title: 'Facturación por compra',
    description: 'Factura el monto total de la compra',
    icon: Receipt,
    allowsComments: false,
    category: 'basic'
  },
  {
    id: 'purchase_with_comments',
    title: 'Facturación por compra con comentarios',
    description: 'Factura el monto total con comentarios personalizados',
    icon: FileText,
    allowsComments: true,
    category: 'basic'
  },
  {
    id: 'reservation',
    title: 'Facturación por reserva',
    description: 'Factura el monto total de la reserva',
    icon: Calendar,
    allowsComments: false,
    category: 'basic'
  },
  {
    id: 'reservation_with_comments',
    title: 'Facturación por reserva con comentarios',
    description: 'Factura la reserva con comentarios personalizados',
    icon: FileText,
    allowsComments: true,
    category: 'basic'
  },

  // Advanced Options
  {
    id: 'partial_purchase',
    title: 'Facturación por parcialidad',
    description: 'Factura una parte del monto total',
    icon: DollarSign,
    allowsComments: false,
    category: 'advanced'
  },
  {
    id: 'partial_nights',
    title: 'Facturación por noches',
    description: 'Factura por noches específicas de la estancia',
    icon: Calendar,
    allowsComments: false,
    category: 'advanced'
  },
  {
    id: 'per_traveler',
    title: 'Facturación por viajero',
    description: 'Factura separada por cada viajero',
    icon: Users,
    allowsComments: false,
    category: 'advanced'
  },
  {
    id: 'per_service',
    title: 'Facturación por servicio',
    description: 'Factura separada por tipo de servicio',
    icon: Building2,
    allowsComments: false,
    category: 'advanced'
  },
  {
    id: 'custom_tax',
    title: 'IVA personalizado',
    description: 'Factura con IVA diferente al 16%',
    icon: Percent,
    allowsComments: false,
    category: 'advanced'
  },

  // Combined Options
  {
    id: 'combined_traveler_service',
    title: 'Viajero + Servicio',
    description: 'Combina facturación por viajero y servicio',
    icon: CombineHorizontal,
    allowsComments: false,
    category: 'combined'
  },
  {
    id: 'combined_provider',
    title: 'Por proveedor',
    description: 'Facturación combinada por proveedor',
    icon: Building,
    allowsComments: false,
    category: 'combined'
  }
];

export const createInvoice = async (
  bookingId: string,
  invoiceType: Invoice['invoice_type'],
  billingDetails: Invoice['billing_details'],
  amount: number,
  taxPercentage: number = 16
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        user_id: user.id,
        booking_id: bookingId,
        invoice_type: invoiceType,
        amount,
        tax_percentage: taxPercentage,
        billing_details: billingDetails,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

export const fetchInvoices = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        booking:bookings (
          confirmation_code,
          hotel_name,
          check_in,
          check_out
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};