// =============================================================================
// PÁGINA: WebAdminFooter
// Gestión de configuración del footer del restaurante
// Migrado desde AdminFooter.tsx y adaptado para esquema web
// =============================================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save, RefreshCcw, AlertCircle, Check, Globe, Instagram, 
  MapPin, Phone, Mail, Star, ExternalLink, Plus, Trash2, Clock, FileText
} from 'lucide-react';
import { useWebFooterInfo } from '@/hooks/web-admin/useWebContentManagement';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { WebFooterInfoInsert, WebFooterInfoUpdate } from '@/types/web-database';

interface FooterData {
  descripcion_restaurante: string;
  direccion: string;
  telefono: string;
  email: string;
  instagram_url: string;
  tripadvisor_url: string;
  google_maps_url: string;
  whatsapp_url: string;
  horarios_apertura: Array<{
    dias: string;
    horario: string;
  }>;
}

const defaultFooterData: FooterData = {
  descripcion_restaurante: 'Enigma Cocina con Alma - Restaurante mediterráneo en el corazón de Calpe',
  direccion: 'Carrer campanari, 5, 03710 Calpe, Alicante',
  telefono: '(+34) 672 79 60 06',
  email: 'isa@enigmaconalma.com',
  instagram_url: 'https://www.instagram.com/enigmaconalma',
  tripadvisor_url: '',
  google_maps_url: 'https://g.co/kgs/V8B6XJu',
  whatsapp_url: 'https://wa.me/34672796006',
  horarios_apertura: [
    { dias: 'Domingo', horario: 'Cerrado' },
    { dias: 'Lunes', horario: '18:30 - 23:00' },
    { dias: 'Martes a Sábado', horario: '13:00 - 16:00, 18:30 - 23:00' }
  ]
};

export default function WebAdminFooter() {
  const {
    footerInfo,
    footerInfoLoading,
    footerInfoError,
    createFooterInfo,
    updateFooterInfo,
    refetchFooterInfo
  } = useWebFooterInfo();

  const [formData, setFormData] = useState<FooterData>(defaultFooterData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos del footer
  useEffect(() => {
    if (!footerInfoLoading) {
      setIsLoading(false);
      if (footerInfo) {
        setFormData({
          descripcion_restaurante: footerInfo.descripcion_restaurante || defaultFooterData.descripcion_restaurante,
          direccion: footerInfo.direccion,
          telefono: footerInfo.telefono,
          email: footerInfo.email,
          instagram_url: footerInfo.instagram_url || '',
          tripadvisor_url: footerInfo.tripadvisor_url || '',
          google_maps_url: footerInfo.google_maps_url || '',
          whatsapp_url: footerInfo.whatsapp_url || '',
          horarios_apertura: Array.isArray(footerInfo.horarios_apertura) 
            ? footerInfo.horarios_apertura 
            : defaultFooterData.horarios_apertura
        });
      }
    }
  }, [footerInfo, footerInfoLoading]);

  // Validación de URLs
  const validateURL = (url: string): boolean => {
    if (!url) return true; // URLs vacías son válidas
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar teléfono
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{9,}$/;
    if (!phoneRegex.test(formData.telefono)) {
      newErrors.telefono = 'Teléfono inválido';
    }

    // Validar URLs
    if (formData.instagram_url && !validateURL(formData.instagram_url)) {
      newErrors.instagram_url = 'URL de Instagram inválida';
    }
    if (formData.tripadvisor_url && !validateURL(formData.tripadvisor_url)) {
      newErrors.tripadvisor_url = 'URL de TripAdvisor inválida';
    }
    if (formData.google_maps_url && !validateURL(formData.google_maps_url)) {
      newErrors.google_maps_url = 'URL de Google Maps inválida';
    }
    if (formData.whatsapp_url && !validateURL(formData.whatsapp_url)) {
      newErrors.whatsapp_url = 'URL de WhatsApp inválida';
    }

    // Validar URLs específicas
    if (formData.instagram_url && !formData.instagram_url.includes('instagram.com')) {
      newErrors.instagram_url = 'Debe ser una URL de Instagram válida';
    }
    if (formData.whatsapp_url && !formData.whatsapp_url.includes('wa.me')) {
      newErrors.whatsapp_url = 'Debe ser una URL de WhatsApp válida (wa.me)';
    }

    // Validar que hay al menos un horario
    if (formData.horarios_apertura.length === 0) {
      newErrors.horarios = 'Debe haber al menos un horario configurado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Guardar datos
  const handleSave = async () => {
    if (!validateForm()) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    try {
      setIsSaving(true);
      setSaveStatus('idle');

      const footerData = {
        descripcion_restaurante: formData.descripcion_restaurante,
        direccion: formData.direccion,
        telefono: formData.telefono,
        email: formData.email,
        instagram_url: formData.instagram_url || null,
        tripadvisor_url: formData.tripadvisor_url || null,
        google_maps_url: formData.google_maps_url || null,
        whatsapp_url: formData.whatsapp_url || null,
        horarios_apertura: formData.horarios_apertura
      };

      if (footerInfo) {
        await updateFooterInfo.mutateAsync(footerData as WebFooterInfoUpdate);
      } else {
        await createFooterInfo.mutateAsync(footerData as WebFooterInfoInsert);
      }

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving footer info:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Agregar horario
  const addHorario = () => {
    setFormData(prev => ({
      ...prev,
      horarios_apertura: [...prev.horarios_apertura, { dias: '', horario: '' }]
    }));
  };

  // Eliminar horario
  const removeHorario = (index: number) => {
    setFormData(prev => ({
      ...prev,
      horarios_apertura: prev.horarios_apertura.filter((_, i) => i !== index)
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <IOSCard variant="glass">
          <IOSCardContent className="p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </div>
          </IOSCardContent>
        </IOSCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-heading-2 text-enigma-neutral-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-enigma-primary" />
            Gestión de Footer
          </h1>
          <p className="text-body-sm text-enigma-neutral-600 mt-1">
            Administra la información del pie de página web
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetchFooterInfo()}
            className="ios-button ios-button-sm ios-button-secondary"
          >
            <RefreshCcw size={16} />
          </button>
          
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="ios-button ios-button-primary"
          >
            {isSaving ? (
              <RefreshCcw size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Guardar
          </button>
        </div>
      </div>

      {/* Status */}
      {saveStatus !== 'idle' && (
        <IOSCard variant="elevated">
          <IOSCardContent className="p-4">
            <div className={`flex items-center ${
              saveStatus === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {saveStatus === 'success' ? (
                <Check size={18} className="mr-2" />
              ) : (
                <AlertCircle size={18} className="mr-2" />
              )}
              {saveStatus === 'success' 
                ? 'Configuración del footer guardada correctamente'
                : 'Error al guardar la configuración del footer'
              }
            </div>
          </IOSCardContent>
        </IOSCard>
      )}

      {footerInfoError && (
        <IOSCard variant="elevated">
          <IOSCardContent className="p-4">
            <div className="flex items-center text-red-600">
              <AlertCircle size={18} className="mr-2" />
              Error al cargar la información del footer: {footerInfoError.message}
            </div>
          </IOSCardContent>
        </IOSCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información Principal */}
        <IOSCard variant="elevated">
          <IOSCardHeader>
            <IOSCardTitle className="flex items-center gap-2">
              <Globe size={20} />
              Información Principal
            </IOSCardTitle>
          </IOSCardHeader>
          <IOSCardContent className="space-y-4">
            <div>
              <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                Descripción del Restaurante
              </label>
              <textarea
                value={formData.descripcion_restaurante}
                onChange={(e) => setFormData(prev => ({ ...prev, descripcion_restaurante: e.target.value }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                placeholder="Breve descripción que aparecerá en el footer..."
              />
            </div>

            <div>
              <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                <MapPin size={16} className="inline mr-2" />
                Dirección
              </label>
              <textarea
                value={formData.direccion}
                onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary"
              />
            </div>

            <div>
              <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                <Phone size={16} className="inline mr-2" />
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary ${
                  errors.telefono ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.telefono && (
                <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>
              )}
            </div>

            <div>
              <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                <Mail size={16} className="inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
          </IOSCardContent>
        </IOSCard>

        {/* Enlaces de Redes Sociales */}
        <IOSCard variant="elevated">
          <IOSCardHeader>
            <IOSCardTitle className="flex items-center gap-2">
              <ExternalLink size={20} />
              Redes Sociales y Enlaces
            </IOSCardTitle>
          </IOSCardHeader>
          <IOSCardContent className="space-y-4">
            <div>
              <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                <Instagram size={16} className="inline mr-2" />
                Instagram
              </label>
              <input
                type="url"
                value={formData.instagram_url}
                onChange={(e) => setFormData(prev => ({ ...prev, instagram_url: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary ${
                  errors.instagram_url ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://www.instagram.com/enigmaconalma"
              />
              {errors.instagram_url && (
                <p className="text-red-500 text-sm mt-1">{errors.instagram_url}</p>
              )}
            </div>

            <div>
              <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                <Star size={16} className="inline mr-2" />
                TripAdvisor
              </label>
              <input
                type="url"
                value={formData.tripadvisor_url}
                onChange={(e) => setFormData(prev => ({ ...prev, tripadvisor_url: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary ${
                  errors.tripadvisor_url ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://www.tripadvisor.es/Restaurant_Review-..."
              />
              {errors.tripadvisor_url && (
                <p className="text-red-500 text-sm mt-1">{errors.tripadvisor_url}</p>
              )}
            </div>

            <div>
              <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                <MapPin size={16} className="inline mr-2" />
                Google Maps
              </label>
              <input
                type="url"
                value={formData.google_maps_url}
                onChange={(e) => setFormData(prev => ({ ...prev, google_maps_url: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary ${
                  errors.google_maps_url ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://g.co/kgs/V8B6XJu"
              />
              {errors.google_maps_url && (
                <p className="text-red-500 text-sm mt-1">{errors.google_maps_url}</p>
              )}
            </div>

            <div>
              <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                <Phone size={16} className="inline mr-2" />
                WhatsApp
              </label>
              <input
                type="url"
                value={formData.whatsapp_url}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_url: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary ${
                  errors.whatsapp_url ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://wa.me/34672796006"
              />
              {errors.whatsapp_url && (
                <p className="text-red-500 text-sm mt-1">{errors.whatsapp_url}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Formato: https://wa.me/[código país][número sin espacios]
              </p>
            </div>
          </IOSCardContent>
        </IOSCard>
      </div>

      {/* Horarios de Apertura */}
      <IOSCard variant="elevated">
        <IOSCardHeader>
          <div className="flex items-center justify-between">
            <IOSCardTitle className="flex items-center gap-2">
              <Clock size={20} />
              Horarios de Apertura
            </IOSCardTitle>
            <IOSButton
              variant="outline"
              onClick={addHorario}
              className="flex items-center gap-1"
            >
              <Plus size={16} />
              Agregar Horario
            </IOSButton>
          </div>
        </IOSCardHeader>
        <IOSCardContent>
          {errors.horarios && (
            <p className="text-red-500 text-sm mb-4">{errors.horarios}</p>
          )}
          
          {formData.horarios_apertura.length === 0 ? (
            <div className="text-center py-8">
              <p className="ios-text-body text-enigma-neutral-500 mb-4">
                No hay horarios configurados
              </p>
              <IOSButton variant="outline" onClick={addHorario}>
                Agregar primer horario
              </IOSButton>
            </div>
          ) : (
            <div className="space-y-3">
              {formData.horarios_apertura.map((horario, index) => (
                <motion.div
                  key={index}
                  layout
                  className="flex gap-2 items-start bg-gray-50 rounded-ios-lg p-4"
                >
                  <div className="flex-1">
                    <label className="ios-text-caption1 text-enigma-neutral-500 block mb-1">
                      Días
                    </label>
                    <input
                      type="text"
                      value={horario.dias}
                      onChange={(e) => {
                        const newHorarios = [...formData.horarios_apertura];
                        newHorarios[index].dias = e.target.value;
                        setFormData(prev => ({ ...prev, horarios_apertura: newHorarios }));
                      }}
                      placeholder="Ej: Lunes a Viernes"
                      className="w-full px-3 py-2 border border-gray-300 rounded-ios text-sm focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="ios-text-caption1 text-enigma-neutral-500 block mb-1">
                      Horario
                    </label>
                    <input
                      type="text"
                      value={horario.horario}
                      onChange={(e) => {
                        const newHorarios = [...formData.horarios_apertura];
                        newHorarios[index].horario = e.target.value;
                        setFormData(prev => ({ ...prev, horarios_apertura: newHorarios }));
                      }}
                      placeholder="Ej: 13:00 - 16:00, 18:30 - 23:00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-ios text-sm focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                    />
                  </div>
                  <div className="pt-6">
                    <button
                      onClick={() => removeHorario(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </IOSCardContent>
      </IOSCard>

      {/* Vista previa */}
      <IOSCard variant="elevated">
        <IOSCardHeader>
          <IOSCardTitle>Vista Previa del Footer</IOSCardTitle>
        </IOSCardHeader>
        <IOSCardContent>
          <div className="bg-gray-900 text-white p-6 rounded-ios-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Información del restaurante */}
              <div>
                <h3 className="font-bold mb-3">Enigma Cocina con Alma</h3>
                <p className="text-sm text-gray-300 mb-4">
                  {formData.descripcion_restaurante}
                </p>
                <div className="space-y-2 text-sm">
                  <p className="flex items-start gap-2">
                    <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                    <span>{formData.direccion}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone size={14} />
                    <span>{formData.telefono}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail size={14} />
                    <span>{formData.email}</span>
                  </p>
                </div>
              </div>

              {/* Horarios */}
              <div>
                <h4 className="font-bold mb-3">Horarios</h4>
                <div className="space-y-1 text-sm">
                  {formData.horarios_apertura.map((horario, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{horario.dias}:</span>
                      <span>{horario.horario}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enlaces */}
              <div>
                <h4 className="font-bold mb-3">Síguenos</h4>
                <div className="space-y-2">
                  {formData.instagram_url && (
                    <a href={formData.instagram_url} className="flex items-center gap-2 text-sm hover:text-gray-300">
                      <Instagram size={14} />
                      Instagram
                    </a>
                  )}
                  {formData.tripadvisor_url && (
                    <a href={formData.tripadvisor_url} className="flex items-center gap-2 text-sm hover:text-gray-300">
                      <Star size={14} />
                      TripAdvisor
                    </a>
                  )}
                  {formData.google_maps_url && (
                    <a href={formData.google_maps_url} className="flex items-center gap-2 text-sm hover:text-gray-300">
                      <MapPin size={14} />
                      Ver en Mapa
                    </a>
                  )}
                  {formData.whatsapp_url && (
                    <a href={formData.whatsapp_url} className="flex items-center gap-2 text-sm hover:text-gray-300">
                      <Phone size={14} />
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </IOSCardContent>
      </IOSCard>
    </div>
  );
}