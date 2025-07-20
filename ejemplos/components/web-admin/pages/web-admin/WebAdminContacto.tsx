// =============================================================================
// PÁGINA: WebAdminContacto
// Gestión de información de contacto del restaurante
// Migrado desde AdminContact.tsx y adaptado para esquema web
// =============================================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save, RefreshCcw, AlertCircle, Check, MapPin, Phone, Mail,
  Clock, Plus, Trash2, Car, ExternalLink, Instagram, Facebook,
  MessageCircle, Star, Globe
} from 'lucide-react';
import { useWebContactInfo } from '@/hooks/web-admin/useWebContentManagement';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { WebPageInsert, WebPageUpdate } from '@/types/web-database';

interface ContactContent {
  informacion_principal: {
    email: string;
    telefono: string;
    direccion: string;
    mapa_url: string;
  };
  horarios: Array<{
    dias: string;
    horario: string;
  }>;
  servicios: Array<{
    nombre: string;
    descripcion: string;
    activo: boolean;
  }>;
  parking: {
    disponible: boolean;
    descripcion: string;
    zonas: Array<{
      tipo: string;
      descripcion: string;
      tarifas: string;
    }>;
  };
  redes_sociales: {
    instagram: string;
    facebook: string;
    whatsapp: string;
    tripadvisor: string;
  };
  texto_adicional: string;
}

const defaultContent: ContactContent = {
  informacion_principal: {
    email: 'isa@enigmaconalma.com',
    telefono: '(+34) 672 79 60 06',
    direccion: 'Carrer campanari, 5, 03710 Calpe, Alicante',
    mapa_url: ''
  },
  horarios: [
    { dias: 'Domingo', horario: 'Cerrado' },
    { dias: 'Lunes', horario: '18:30 - 23:00' },
    { dias: 'Martes a Sábado', horario: '13:00 - 16:00, 18:30 - 23:00' }
  ],
  servicios: [
    { nombre: 'Terraza disponible', descripcion: 'Zona exterior cubierta', activo: true },
    { nombre: 'Acceso para movilidad reducida', descripcion: 'Acceso adaptado', activo: true },
    { nombre: 'Zona peatonal', descripcion: 'Ubicado en área peatonal', activo: true },
    { nombre: 'A 15 minutos de la playa', descripcion: 'Cercanía a la playa', activo: true }
  ],
  parking: {
    disponible: true,
    descripcion: 'Parking público cercano disponible',
    zonas: [
      { tipo: 'Zona Azul', descripcion: 'Lunes a Viernes 9:00-14:00 y 16:00-20:00', tarifas: '1,20€/hora' },
      { tipo: 'Zona Naranja', descripcion: 'Residentes y rotación limitada', tarifas: 'Variable' },
      { tipo: 'Zona Blanca', descripcion: 'Aparcamiento gratuito', tarifas: 'Gratuito' }
    ]
  },
  redes_sociales: {
    instagram: 'https://instagram.com/enigmaconalma',
    facebook: 'https://facebook.com/enigmaconalma',
    whatsapp: '+34672796006',
    tripadvisor: 'https://www.tripadvisor.es/UserReviewEdit-g187526-d23958723-Enigma_Cocina_Con_Alma-Calpe_Costa_Blanca_Province_of_Alicante_Valencian_Community.html'
  },
  texto_adicional: ''
};

export default function WebAdminContacto() {
  const { 
    contactInfo,
    contactInfoLoading,
    contactInfoError,
    updateContactInfo,
    refetchContactInfo
  } = useWebContactInfo();

  const [content, setContent] = useState<ContactContent>(defaultContent);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar contenido de contacto
  useEffect(() => {
    if (contactInfo) {
      setContent({
        informacion_principal: {
          email: contactInfo.contact_details?.email || 'isa@enigmaconalma.com',
          telefono: contactInfo.contact_details?.phone || '(+34) 672 79 60 06',
          direccion: contactInfo.address || 'Carrer campanari, 5, 03710 Calpe, Alicante',
          mapa_url: contactInfo.contact_details?.maps_url || ''
        },
        horarios: contactInfo.schedules || defaultContent.horarios,
        servicios: contactInfo.services || defaultContent.servicios,
        parking: defaultContent.parking, // Mantener por defecto por ahora
        redes_sociales: {
          instagram: contactInfo.social_media?.instagram || contactInfo.instagram_url || defaultContent.redes_sociales.instagram,
          facebook: contactInfo.social_media?.facebook || contactInfo.facebook_url || defaultContent.redes_sociales.facebook,
          whatsapp: contactInfo.contact_details?.phone || defaultContent.redes_sociales.whatsapp,
          tripadvisor: contactInfo.social_media?.tripadvisor || contactInfo.tripadvisor_url || defaultContent.redes_sociales.tripadvisor
        },
        texto_adicional: contactInfo.social_media?.description || ''
      });
    }
  }, [contactInfo]);

  // Validación
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(content.informacion_principal.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar teléfono
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{9,}$/;
    if (!phoneRegex.test(content.informacion_principal.telefono)) {
      newErrors.telefono = 'Teléfono inválido';
    }

    // Validar URL del mapa (si está presente)
    if (content.informacion_principal.mapa_url) {
      try {
        new URL(content.informacion_principal.mapa_url);
      } catch {
        newErrors.mapa_url = 'URL del mapa inválida';
      }
    }

    // Validar que al menos hay un horario
    if (content.horarios.length === 0) {
      newErrors.horarios = 'Debe haber al menos un horario';
    }

    // Validar URLs de redes sociales (si están presentes)
    const urlFields = [
      { key: 'instagram', value: content.redes_sociales.instagram },
      { key: 'facebook', value: content.redes_sociales.facebook },
      { key: 'tripadvisor', value: content.redes_sociales.tripadvisor }
    ];

    urlFields.forEach(({ key, value }) => {
      if (value && value.trim()) {
        try {
          new URL(value);
        } catch {
          newErrors[key] = `URL de ${key} inválida`;
        }
      }
    });

    // Validar WhatsApp (debe ser un número de teléfono)
    if (content.redes_sociales.whatsapp && content.redes_sociales.whatsapp.trim()) {
      const whatsappRegex = /^[\+]?[0-9\s\-\(\)]{9,}$/;
      if (!whatsappRegex.test(content.redes_sociales.whatsapp)) {
        newErrors.whatsapp = 'Número de WhatsApp inválido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Guardar contenido
  const handleSave = async () => {
    if (!validateForm()) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
      return;
    }

    try {
      setIsSaving(true);
      setSaveStatus('idle');

      const updateData = {
        address: content.informacion_principal.direccion,
        contact_details: {
          phone: content.informacion_principal.telefono,
          email: content.informacion_principal.email,
          maps_url: content.informacion_principal.mapa_url
        },
        schedules: content.horarios,
        social_media: {
          instagram: content.redes_sociales.instagram,
          facebook: content.redes_sociales.facebook,
          tripadvisor: content.redes_sociales.tripadvisor,
          description: content.texto_adicional
        },
        // Campos adicionales para compatibilidad con la web
        instagram_url: content.redes_sociales.instagram,
        facebook_url: content.redes_sociales.facebook,
        tripadvisor_url: content.redes_sociales.tripadvisor,
        services: content.servicios
      };

      await updateContactInfo.mutateAsync(updateData);

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving contact content:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Agregar horario
  const addHorario = () => {
    setContent(prev => ({
      ...prev,
      horarios: [...prev.horarios, { dias: '', horario: '' }]
    }));
  };

  // Eliminar horario
  const removeHorario = (index: number) => {
    setContent(prev => ({
      ...prev,
      horarios: prev.horarios.filter((_, i) => i !== index)
    }));
  };

  // Agregar servicio
  const addServicio = () => {
    setContent(prev => ({
      ...prev,
      servicios: [...prev.servicios, { nombre: '', descripcion: '', activo: true }]
    }));
  };

  // Eliminar servicio
  const removeServicio = (index: number) => {
    setContent(prev => ({
      ...prev,
      servicios: prev.servicios.filter((_, i) => i !== index)
    }));
  };

  // Agregar zona de parking
  const addZonaParking = () => {
    setContent(prev => ({
      ...prev,
      parking: {
        ...prev.parking,
        zonas: [...prev.parking.zonas, { tipo: '', descripcion: '', tarifas: '' }]
      }
    }));
  };

  // Eliminar zona de parking
  const removeZonaParking = (index: number) => {
    setContent(prev => ({
      ...prev,
      parking: {
        ...prev.parking,
        zonas: prev.parking.zonas.filter((_, i) => i !== index)
      }
    }));
  };

  if (contactInfoLoading) {
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
            <Phone className="h-6 w-6 text-enigma-primary" />
            Gestión de Contacto
          </h1>
          <p className="text-body-sm text-enigma-neutral-600 mt-1">
            Administra la información de contacto del restaurante
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetchContactInfo()}
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
                ? 'Información de contacto guardada correctamente'
                : 'Error al guardar la información de contacto'
              }
            </div>
          </IOSCardContent>
        </IOSCard>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información Principal */}
        <IOSCard variant="elevated">
          <IOSCardHeader>
            <IOSCardTitle className="flex items-center gap-2">
              <MapPin size={20} />
              Información Principal
            </IOSCardTitle>
          </IOSCardHeader>
          <IOSCardContent className="space-y-4">
            <div>
              <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                <Mail size={16} className="inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={content.informacion_principal.email}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  informacion_principal: { ...prev.informacion_principal, email: e.target.value }
                }))}
                className={`w-full px-4 py-2 border rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                <Phone size={16} className="inline mr-2" />
                Teléfono
              </label>
              <input
                type="tel"
                value={content.informacion_principal.telefono}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  informacion_principal: { ...prev.informacion_principal, telefono: e.target.value }
                }))}
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
                <MapPin size={16} className="inline mr-2" />
                Dirección
              </label>
              <textarea
                value={content.informacion_principal.direccion}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  informacion_principal: { ...prev.informacion_principal, direccion: e.target.value }
                }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary"
              />
            </div>

            <div>
              <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                <ExternalLink size={16} className="inline mr-2" />
                URL del Mapa (iframe)
              </label>
              <input
                type="url"
                value={content.informacion_principal.mapa_url}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  informacion_principal: { ...prev.informacion_principal, mapa_url: e.target.value }
                }))}
                className={`w-full px-4 py-2 border rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary ${
                  errors.mapa_url ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://www.google.com/maps/embed?..."
              />
              {errors.mapa_url && (
                <p className="text-red-500 text-sm mt-1">{errors.mapa_url}</p>
              )}
            </div>
          </IOSCardContent>
        </IOSCard>

        {/* Horarios */}
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
                Agregar
              </IOSButton>
            </div>
          </IOSCardHeader>
          <IOSCardContent>
            {errors.horarios && (
              <p className="text-red-500 text-sm mb-4">{errors.horarios}</p>
            )}
            <div className="space-y-3">
              {content.horarios.map((horario, index) => (
                <motion.div
                  key={index}
                  layout
                  className="flex gap-2 items-start"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      value={horario.dias}
                      onChange={(e) => {
                        const newHorarios = [...content.horarios];
                        newHorarios[index].dias = e.target.value;
                        setContent(prev => ({ ...prev, horarios: newHorarios }));
                      }}
                      placeholder="Ej: Lunes a Viernes"
                      className="w-full px-3 py-2 border border-gray-300 rounded-ios text-sm focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={horario.horario}
                      onChange={(e) => {
                        const newHorarios = [...content.horarios];
                        newHorarios[index].horario = e.target.value;
                        setContent(prev => ({ ...prev, horarios: newHorarios }));
                      }}
                      placeholder="Ej: 13:00 - 16:00, 18:30 - 23:00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-ios text-sm focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                    />
                  </div>
                  <button
                    onClick={() => removeHorario(index)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </motion.div>
              ))}
            </div>
          </IOSCardContent>
        </IOSCard>
      </div>

      {/* Servicios */}
      <IOSCard variant="elevated">
        <IOSCardHeader>
          <div className="flex items-center justify-between">
            <IOSCardTitle>Servicios y Amenities</IOSCardTitle>
            <IOSButton
              variant="outline"
              onClick={addServicio}
              className="flex items-center gap-1"
            >
              <Plus size={16} />
              Agregar Servicio
            </IOSButton>
          </div>
        </IOSCardHeader>
        <IOSCardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {content.servicios.map((servicio, index) => (
              <motion.div
                key={index}
                layout
                className="bg-gray-50 rounded-ios-lg p-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={servicio.nombre}
                      onChange={(e) => {
                        const newServicios = [...content.servicios];
                        newServicios[index].nombre = e.target.value;
                        setContent(prev => ({ ...prev, servicios: newServicios }));
                      }}
                      placeholder="Nombre del servicio"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-ios text-sm focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                    />
                    <button
                      onClick={() => removeServicio(index)}
                      className="ml-2 p-2 text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={servicio.descripcion}
                    onChange={(e) => {
                      const newServicios = [...content.servicios];
                      newServicios[index].descripcion = e.target.value;
                      setContent(prev => ({ ...prev, servicios: newServicios }));
                    }}
                    placeholder="Descripción del servicio"
                    className="w-full px-3 py-2 border border-gray-300 rounded-ios text-sm focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                  />
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`servicio-${index}`}
                      checked={servicio.activo}
                      onChange={(e) => {
                        const newServicios = [...content.servicios];
                        newServicios[index].activo = e.target.checked;
                        setContent(prev => ({ ...prev, servicios: newServicios }));
                      }}
                      className="rounded border-gray-300 text-enigma-primary focus:ring-enigma-primary"
                    />
                    <label htmlFor={`servicio-${index}`} className="ml-2 text-sm text-gray-700">
                      Servicio activo
                    </label>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </IOSCardContent>
      </IOSCard>

      {/* Parking */}
      <IOSCard variant="elevated">
        <IOSCardHeader>
          <div className="flex items-center justify-between">
            <IOSCardTitle className="flex items-center gap-2">
              <Car size={20} />
              Información de Parking
            </IOSCardTitle>
            <IOSButton
              variant="outline"
              onClick={addZonaParking}
              className="flex items-center gap-1"
            >
              <Plus size={16} />
              Agregar Zona
            </IOSButton>
          </div>
        </IOSCardHeader>
        <IOSCardContent className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="parking-disponible"
              checked={content.parking.disponible}
              onChange={(e) => setContent(prev => ({
                ...prev,
                parking: { ...prev.parking, disponible: e.target.checked }
              }))}
              className="rounded border-gray-300 text-enigma-primary focus:ring-enigma-primary"
            />
            <label htmlFor="parking-disponible" className="ml-2 ios-text-callout font-medium">
              Parking disponible
            </label>
          </div>

          <div>
            <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
              Descripción general
            </label>
            <textarea
              value={content.parking.descripcion}
              onChange={(e) => setContent(prev => ({
                ...prev,
                parking: { ...prev.parking, descripcion: e.target.value }
              }))}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary"
            />
          </div>

          <div>
            <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-3">
              Zonas de parking
            </label>
            <div className="space-y-3">
              {content.parking.zonas.map((zona, index) => (
                <motion.div
                  key={index}
                  layout
                  className="bg-gray-50 rounded-ios-lg p-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={zona.tipo}
                      onChange={(e) => {
                        const newZonas = [...content.parking.zonas];
                        newZonas[index].tipo = e.target.value;
                        setContent(prev => ({
                          ...prev,
                          parking: { ...prev.parking, zonas: newZonas }
                        }));
                      }}
                      placeholder="Tipo de zona"
                      className="px-3 py-2 border border-gray-300 rounded-ios text-sm focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                    />
                    <input
                      type="text"
                      value={zona.descripcion}
                      onChange={(e) => {
                        const newZonas = [...content.parking.zonas];
                        newZonas[index].descripcion = e.target.value;
                        setContent(prev => ({
                          ...prev,
                          parking: { ...prev.parking, zonas: newZonas }
                        }));
                      }}
                      placeholder="Descripción"
                      className="px-3 py-2 border border-gray-300 rounded-ios text-sm focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={zona.tarifas}
                        onChange={(e) => {
                          const newZonas = [...content.parking.zonas];
                          newZonas[index].tarifas = e.target.value;
                          setContent(prev => ({
                            ...prev,
                            parking: { ...prev.parking, zonas: newZonas }
                          }));
                        }}
                        placeholder="Tarifas"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-ios text-sm focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                      />
                      <button
                        onClick={() => removeZonaParking(index)}
                        className="p-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </IOSCardContent>
      </IOSCard>

      {/* Redes Sociales */}
      <IOSCard variant="elevated">
        <IOSCardHeader>
          <IOSCardTitle className="flex items-center gap-2">
            <Globe size={20} />
            Redes Sociales
          </IOSCardTitle>
        </IOSCardHeader>
        <IOSCardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Instagram */}
            <div>
              <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                <Instagram size={16} className="inline mr-2 text-pink-600" />
                Instagram
              </label>
              <input
                type="url"
                value={content.redes_sociales.instagram}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  redes_sociales: { ...prev.redes_sociales, instagram: e.target.value }
                }))}
                className={`w-full px-4 py-2 border rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary ${
                  errors.instagram ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://instagram.com/enigmaconalma"
              />
              {errors.instagram && (
                <p className="text-red-500 text-sm mt-1">{errors.instagram}</p>
              )}
            </div>

            {/* Facebook */}
            <div>
              <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                <Facebook size={16} className="inline mr-2 text-blue-600" />
                Facebook
              </label>
              <input
                type="url"
                value={content.redes_sociales.facebook}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  redes_sociales: { ...prev.redes_sociales, facebook: e.target.value }
                }))}
                className={`w-full px-4 py-2 border rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary ${
                  errors.facebook ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://facebook.com/enigmaconalma"
              />
              {errors.facebook && (
                <p className="text-red-500 text-sm mt-1">{errors.facebook}</p>
              )}
            </div>

            {/* WhatsApp */}
            <div>
              <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                <MessageCircle size={16} className="inline mr-2 text-green-600" />
                WhatsApp
              </label>
              <input
                type="tel"
                value={content.redes_sociales.whatsapp}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  redes_sociales: { ...prev.redes_sociales, whatsapp: e.target.value }
                }))}
                className={`w-full px-4 py-2 border rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary ${
                  errors.whatsapp ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="+34672796006"
              />
              {errors.whatsapp && (
                <p className="text-red-500 text-sm mt-1">{errors.whatsapp}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Número de teléfono para contacto directo por WhatsApp
              </p>
            </div>

            {/* TripAdvisor */}
            <div>
              <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                <Star size={16} className="inline mr-2 text-orange-600" />
                TripAdvisor
              </label>
              <input
                type="url"
                value={content.redes_sociales.tripadvisor}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  redes_sociales: { ...prev.redes_sociales, tripadvisor: e.target.value }
                }))}
                className={`w-full px-4 py-2 border rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary ${
                  errors.tripadvisor ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="https://tripadvisor.com/restaurant/enigmaconalma"
              />
              {errors.tripadvisor && (
                <p className="text-red-500 text-sm mt-1">{errors.tripadvisor}</p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-ios-lg p-4">
            <div className="flex items-start">
              <AlertCircle size={16} className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">
                  Configuración de Redes Sociales
                </h4>
                <p className="text-xs text-blue-700">
                  Estas URLs aparecerán en la página de contacto. Asegúrate de que los enlaces sean públicos y estén actualizados.
                  El número de WhatsApp se usará para generar enlaces directos de contacto.
                </p>
              </div>
            </div>
          </div>
        </IOSCardContent>
      </IOSCard>

      {/* Texto Adicional */}
      <IOSCard variant="elevated">
        <IOSCardHeader>
          <IOSCardTitle>Texto Adicional</IOSCardTitle>
        </IOSCardHeader>
        <IOSCardContent>
          <textarea
            value={content.texto_adicional}
            onChange={(e) => setContent(prev => ({ ...prev, texto_adicional: e.target.value }))}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary"
            placeholder="Información adicional que desees mostrar en la página de contacto..."
          />
        </IOSCardContent>
      </IOSCard>
    </div>
  );
}