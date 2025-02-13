import React from 'react';
import { billingOptions } from '../services/billingService';
import { ArrowRight } from 'lucide-react';
import type { BillingOption } from '../types';

interface BillingOptionsProps {
  onSelectOption: (option: BillingOption) => void;
}

export const BillingOptions: React.FC<BillingOptionsProps> = ({ onSelectOption }) => {
  const categories = {
    basic: {
      title: 'Opciones Básicas',
      description: 'Opciones de facturación estándar'
    },
    advanced: {
      title: 'Opciones Avanzadas',
      description: 'Opciones de facturación especializadas'
    },
    combined: {
      title: 'Opciones Combinadas',
      description: 'Facturación con múltiples criterios'
    }
  };

  return (
    <div className="space-y-8">
      {Object.entries(categories).map(([category, { title, description }]) => {
        const categoryOptions = billingOptions.filter(option => option.category === category);
        
        if (categoryOptions.length === 0) return null;

        return (
          <div key={category} className="space-y-4">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categoryOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => onSelectOption(option)}
                  className="flex items-start p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <option.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <h4 className="text-sm font-medium text-gray-900">{option.title}</h4>
                    <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400 self-center" />
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};