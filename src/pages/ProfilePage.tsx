import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { ArrowLeft, User2, Building2, MapPin, Mail, Phone, Calendar, Receipt, Save, Edit2, X, CreditCard } from 'lucide-react';
import type { UserPreferences, PaymentHistory } from '../types';

interface ProfilePageProps {
  onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const [user, setUser] = useState<any>(null);
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [editedPreferences, setEditedPreferences] = useState<Partial<UserPreferences>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');
        setUser(user);

        // Get company profile
        const { data: companyData, error: companyError } = await supabase
          .from('company_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (companyError) throw companyError;
        setCompanyProfile(companyData);

        // Get user preferences
        const { data: preferencesData, error: preferencesError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (preferencesError && preferencesError.code !== 'PGRST116') {
          throw preferencesError;
        }
        setPreferences(preferencesData);
        setEditedPreferences(preferencesData || {});

        // Get payment history
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select(`
            id,
            amount,
            currency,
            status,
            created_at,
            booking_id,
            bookings (
              confirmation_code,
              hotel_name,
              check_in,
              check_out
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (paymentsError) throw paymentsError;
        setPayments(paymentsData);

      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSavePreferences = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const preferenceData = {
        user_id: user.id,
        preferred_hotel: editedPreferences.preferred_hotel,
        frequent_changes: editedPreferences.frequent_changes,
        avoid_locations: editedPreferences.avoid_locations
      };

      let response;
      
      if (preferences?.id) {
        // Update existing preferences
        response = await supabase
          .from('user_preferences')
          .update(preferenceData)
          .eq('id', preferences.id);
      } else {
        // Insert new preferences
        response = await supabase
          .from('user_preferences')
          .insert([preferenceData]);
      }

      if (response.error) throw response.error;

      setPreferences({
        ...preferences,
        ...preferenceData
      } as UserPreferences);
      setIsEditingPreferences(false);
      setSaveSuccess(true);

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('Error saving preferences:', error);
      setSaveError(error.message || 'Error al guardar las preferencias');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedPreferences(preferences || {});
    setIsEditingPreferences(false);
    setSaveError(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-blue-600 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center text-white hover:text-white/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al chat
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información Personal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Perfil Personal */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center space-x-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <User2 className="w-10 h-10 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {user?.user_metadata?.full_name || 'Usuario'}
                  </h2>
                  <p className="text-gray-500">Información Personal</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-5 h-5 mr-3" />
                    <span>Correo Electrónico</span>
                  </div>
                  <p className="text-gray-900 font-medium text-lg pl-8">{user?.email}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-5 h-5 mr-3" />
                    <span>Teléfono</span>
                  </div>
                  <p className="text-gray-900 font-medium text-lg pl-8">
                    {user?.user_metadata?.phone || 'No especificado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Información de la Empresa */}
            {companyProfile && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="flex items-center space-x-6 mb-8">
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                    <Building2 className="w-10 h-10 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {companyProfile.company_name}
                    </h2>
                    <p className="text-gray-500">Información de la Empresa</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <Building2 className="w-5 h-5 mr-3" />
                      <span>Industria</span>
                    </div>
                    <p className="text-gray-900 font-medium text-lg pl-8 capitalize">
                      {companyProfile.industry}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-5 h-5 mr-3" />
                      <span>Ciudad</span>
                    </div>
                    <p className="text-gray-900 font-medium text-lg pl-8">
                      {companyProfile.city}
                    </p>
                  </div>

                  {companyProfile.rfc && (
                    <div className="space-y-3">
                      <div className="flex items-center text-gray-600">
                        <Receipt className="w-5 h-5 mr-3" />
                        <span>RFC</span>
                      </div>
                      <p className="text-gray-900 font-medium text-lg pl-8">
                        {companyProfile.rfc}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Preferencias de Viaje */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900">
                  Preferencias de Viaje
                </h3>
                {!isEditingPreferences ? (
                  <button
                    onClick={() => setIsEditingPreferences(true)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Edit2 className="w-5 h-5" />
                    <span>Editar</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                      <span>Cancelar</span>
                    </button>
                    <button
                      onClick={handleSavePreferences}
                      disabled={isSaving}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-5 h-5" />
                      <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
                    </button>
                  </div>
                )}
              </div>

              {saveSuccess && (
                <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
                  Preferencias guardadas exitosamente
                </div>
              )}

              {saveError && (
                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                  {saveError}
                </div>
              )}

              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hotel Preferido
                  </label>
                  {isEditingPreferences ? (
                    <input
                      type="text"
                      value={editedPreferences.preferred_hotel || ''}
                      onChange={(e) => setEditedPreferences(prev => ({
                        ...prev,
                        preferred_hotel: e.target.value
                      }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Ej: Marriott, Hilton, etc."
                    />
                  ) : (
                    <p className="text-gray-900 text-lg">
                      {preferences?.preferred_hotel || 'No especificado'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cambios Frecuentes
                  </label>
                  {isEditingPreferences ? (
                    <select
                      value={editedPreferences.frequent_changes ? 'true' : 'false'}
                      onChange={(e) => setEditedPreferences(prev => ({
                        ...prev,
                        frequent_changes: e.target.value === 'true'
                      }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    >
                      <option value="true">Sí</option>
                      <option value="false">No</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 text-lg">
                      {preferences?.frequent_changes ? 'Sí' : 'No'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lugares a Evitar
                  </label>
                  {isEditingPreferences ? (
                    <textarea
                      value={editedPreferences.avoid_locations || ''}
                      onChange={(e) => setEditedPreferences(prev => ({
                        ...prev,
                        avoid_locations: e.target.value
                      }))}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      rows={3}
                      placeholder="Especifica lugares que prefieres evitar"
                    />
                  ) : (
                    <p className="text-gray-900 text-lg">
                      {preferences?.avoid_locations || 'No especificado'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Historial de Pagos */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-green-600 p-8">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Historial de Pagos
                  </h3>
                </div>
              </div>
              
              <div className="p-6 space-y-6">
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <div
                      key={payment.id}
                      className="bg-white rounded-lg shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium text-gray-900 text-lg">
                            {payment.bookings?.hotel_name || 'Hotel'}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {payment.bookings?.confirmation_code}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold text-lg ${
                            payment.status === 'completed' ? 'text-green-600' :
                            payment.status === 'pending' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            ${payment.amount.toLocaleString('es-MX')} {payment.currency.toUpperCase()}
                          </p>
                          <p className="text-gray-500 text-sm">
                            {formatDate(payment.created_at)}
                          </p>
                        </div>
                      </div>
                      {payment.bookings && (
                        <div className="flex items-center text-gray-600 text-sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>
                            {formatDate(payment.bookings.check_in)} - {formatDate(payment.bookings.check_out)}
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      No hay pagos registrados
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};