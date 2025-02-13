import React from 'react';
import { Receipt, FileText, Calendar, Download, ArrowRight } from 'lucide-react';
import type { Invoice } from '../types';

interface InvoiceHistoryProps {
  invoices: Invoice[];
  isLoading: boolean;
}

export const InvoiceHistory: React.FC<InvoiceHistoryProps> = ({ invoices, isLoading }) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInvoiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      purchase: 'Compra',
      purchase_with_comments: 'Compra con comentarios',
      reservation: 'Reservación',
      reservation_with_comments: 'Reservación con comentarios',
      partial_purchase: 'Parcialidad',
      partial_nights: 'Por noches',
      per_traveler: 'Por viajero',
      per_service: 'Por servicio',
      custom_tax: 'IVA personalizado',
      combined_traveler_service: 'Viajero + Servicio',
      combined_provider: 'Por proveedor'
    };
    return labels[type] || type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay facturas</h3>
        <p className="text-gray-500">
          Las facturas aparecerán aquí una vez que las generes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <div
          key={invoice.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">
                  {invoice.billing_details.business_name}
                </h4>
                <p className="text-sm text-gray-500">
                  {getInvoiceTypeLabel(invoice.invoice_type)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-gray-900">
                ${invoice.amount.toLocaleString('es-MX')} MXN
              </p>
              <p className="text-sm text-gray-500">
                IVA {invoice.tax_percentage}%
              </p>
            </div>
          </div>

          {invoice.booking && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-500 space-x-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>
                    {formatDate(invoice.booking.check_in)} - {formatDate(invoice.booking.check_out)}
                  </span>
                </div>
                <span>•</span>
                <span>{invoice.booking.hotel_name}</span>
              </div>
            </div>
          )}

          <div className="mt-4 flex justify-end space-x-3">
            <button className="flex items-center space-x-2 text-gray-500 hover:text-gray-700">
              <Download className="w-4 h-4" />
              <span className="text-sm">Descargar PDF</span>
            </button>
            <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
              <span className="text-sm">Ver detalles</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};