import { supabase } from './supabaseClient';
import type { RegistrationFormData, QuestionnaireData } from '../types';

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const registerUser = async (
  formData: RegistrationFormData,
  questionnaireData: QuestionnaireData
) => {
  try {
    // Validate email format
    if (!validateEmail(formData.email)) {
      throw new Error('El formato del correo electrónico no es válido');
    }

    // 1. Check if user exists first to avoid rate limit
    const { data: existingUser } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password
    });

    if (existingUser?.user) {
      throw new Error('Este correo electrónico ya está registrado');
    }

    // 2. Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          phone: formData.phone
        },
        emailRedirectTo: undefined // Disable email confirmation
      }
    });

    if (authError) {
      console.error('Supabase request failed', {
        status: authError.status,
        message: authError.message
      });
      
      if (authError.message.includes('User already registered')) {
        throw new Error('Este correo electrónico ya está registrado');
      }
      
      throw new Error('Error al registrar usuario. Por favor intenta de nuevo.');
    }

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario');
    }

    // 3. Create company profile
    const { error: companyError } = await supabase
      .from('company_profiles')
      .insert({
        user_id: authData.user.id,
        company_name: formData.companyName,
        rfc: formData.rfc || null,
        industry: formData.industry,
        city: formData.city
      });

    if (companyError) {
      console.error('Company profile creation error:', companyError);
      throw new Error('Error al crear el perfil de la empresa');
    }

    // 4. Create user preferences
    const { error: preferencesError } = await supabase
      .from('user_preferences')
      .insert({
        user_id: authData.user.id,
        preferred_hotel: questionnaireData.preferredHotel,
        frequent_changes: questionnaireData.frequentChanges === 'yes',
        avoid_locations: questionnaireData.avoidLocations
      });

    if (preferencesError) {
      console.error('User preferences creation error:', preferencesError);
      throw new Error('Error al guardar las preferencias');
    }

    // 5. Sign in the user immediately
    const { data: session } = await supabase.auth.getSession();
    
    if (!session?.session) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      });

      if (signInError) {
        console.error('Sign in error:', signInError);
        throw new Error('Error al iniciar sesión automáticamente');
      }
    }

    return {
      user: authData.user,
      success: true
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle specific error cases
    if (error?.message?.includes('duplicate key value')) {
      throw new Error('Este correo electrónico ya está registrado');
    }

    if (error?.message?.includes('Password should be at least 6 characters')) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }
    
    // Return a user-friendly error message
    throw new Error(error.message || 'Error al registrar. Por favor intenta de nuevo.');
  }
};