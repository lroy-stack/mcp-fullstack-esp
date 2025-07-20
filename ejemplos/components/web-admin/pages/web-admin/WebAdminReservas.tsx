// =============================================================================
// PÁGINA: WebAdminReservas
// Gestión del contenido de la página de reservas
// Migrado desde AdminReservationsContent.tsx y adaptado para esquema web
// =============================================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save, RefreshCcw, AlertCircle, Check, Calendar, Clock, 
  MessageSquare, Plus, Trash2, Edit3, Eye, Settings
} from 'lucide-react';
import { useWebReservationsConfig } from '@/hooks/web-admin/useWebContentManagement';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { WebPageInsert, WebPageUpdate } from '@/types/web-database';

interface ReservasContent {
  textos: {
    titulo_principal: string;
    subtitulo: string;
    descripcion: string;
    mensaje_confirmacion: string;
  };
  informacion_adicional: {
    informacion_importante: string[];
  };
  horarios: {
    comida: string[];
    cena: string[];
  };
  ocasiones: string[];
  zonas_preferidas: { value: number; label: string; }[];
  plantilla_whatsapp: {
    mensaje: string;
    variables_disponibles: string[];
  };
  configuracion: {
    anticipacion_minima_horas: number;
    mensaje_domingo_cerrado: string;
    mensaje_fuera_horario: string;
  };
  restricciones: {
    edad_minima: number;
    maximo_personas: number;
    tiempo_mesa_promedio: number;
  };
  dias_cerrados: number[];
  vacation_mode: {
    holiday_mode_active: boolean;
    fechas_bloqueadas: string[];
  };
}

const defaultContent: ReservasContent = {
  textos: {
    titulo_principal: 'Reserva tu Mesa',
    subtitulo: 'Vive una experiencia culinaria única en Enigma',
    descripcion: 'Reserva tu mesa y descubre la propuesta gastronómica mediterránea con alma de nuestra chef Isabel Abraldes.',
    mensaje_confirmacion: 'Gracias por tu reserva. Te contactaremos pronto para confirmar tu mesa.'
  },
  informacion_adicional: {
    informacion_importante: [
      'Las reservas se confirman por teléfono o WhatsApp',
      'Tiempo máximo de espera: 15 minutos',
      'Cancelaciones con 2 horas de antelación',
      'Grupos de más de 6 personas requieren menú cerrado',
      'Disponemos de opciones vegetarianas y veganas'
    ]
  },
  horarios: {
    comida: ['13:00', '13:15', '13:30', '13:45', '14:00', '14:15', '14:30', '14:45', '15:00', '15:15', '15:30', '15:45'],
    cena: ['18:30', '18:45', '19:00', '19:15', '19:30', '19:45', '20:00', '20:15', '20:30', '20:45', '21:00', '21:15', '21:30', '21:45', '22:00', '22:15', '22:30']
  },
  ocasiones: [
    'Cena romántica',
    'Cumpleaños',
    'Aniversario',
    'Celebración familiar',
    'Cena de negocios',
    'Encuentro con amigos',
    'Cita especial'
  ],
  zonas_preferidas: [
    { value: 1, label: 'Terraza superior' },
    { value: 2, label: 'Terraza inferior' },
    { value: 3, label: 'Interior junto a ventana' },
    { value: 4, label: 'Interior centro' },
    { value: 5, label: 'Barra' },
    { value: 6, label: 'Mesa tranquila' },
    { value: 7, label: 'Mesa familiar grande' }
  ],
  plantilla_whatsapp: {
    mensaje: `¡Hola! Me gustaría reservar una mesa en Enigma Cocina con Alma.

📅 Fecha: {fecha}
🕐 Hora: {hora}
👥 Número de personas: {personas}
👤 Nombre: {nombre}
📞 Teléfono: {telefono}
📧 Email: {email}
🎯 Ocasión: {ocasion}
🍽️ Preferencias alimentarias: {preferencia}
📝 Requisitos especiales: {requisitos}
💭 Notas adicionales: {notas}
🆕 Primera visita: {primera_visita}

¡Esperamos conocerte pronto!`,
    variables_disponibles: [
      '{fecha}', '{hora}', '{personas}', '{nombre}', '{telefono}', 
      '{email}', '{ocasion}', '{preferencia}', '{requisitos}', 
      '{notas}', '{primera_visita}'
    ]
  },
  configuracion: {
    anticipacion_minima_horas: 6,
    mensaje_domingo_cerrado: 'Los domingos permanecemos cerrados. Te invitamos a visitarnos de lunes a sábado.',
    mensaje_fuera_horario: 'El horario seleccionado no está disponible. Por favor, elige otro horario.'
  },
  restricciones: {
    edad_minima: 0,
    maximo_personas: 12,
    tiempo_mesa_promedio: 90
  },
  dias_cerrados: [0], // Solo domingos cerrados por defecto
  vacation_mode: {
    holiday_mode_active: false,
    fechas_bloqueadas: []
  }
};

export default function WebAdminReservas() {
  const { 
    reservationsConfig,
    reservationsConfigLoading,
    reservationsConfigError,
    updateReservationsConfig,
    refetchReservationsConfig
  } = useWebReservationsConfig();

  const [activeTab, setActiveTab] = useState<'contenido' | 'horarios' | 'plantilla' | 'configuracion'>('contenido');
  const [content, setContent] = useState<ReservasContent>(defaultContent);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showPreview, setShowPreview] = useState(false);

  // Cargar contenido de reservas
  useEffect(() => {
    if (reservationsConfig) {
      const newContent = {
        textos: {
          titulo_principal: reservationsConfig.titulo_principal || defaultContent.textos.titulo_principal,
          subtitulo: reservationsConfig.subtitulo || defaultContent.textos.subtitulo,
          descripcion: reservationsConfig.descripcion || defaultContent.textos.descripcion,
          mensaje_confirmacion: reservationsConfig.mensaje_confirmacion || defaultContent.textos.mensaje_confirmacion
        },
        informacion_adicional: {
          informacion_importante: reservationsConfig.additional_info?.informacion_importante || defaultContent.informacion_adicional.informacion_importante
        },
        horarios: {
          comida: reservationsConfig.horarios_comida || defaultContent.horarios.comida,
          cena: reservationsConfig.horarios_cena || defaultContent.horarios.cena
        },
        ocasiones: reservationsConfig.ocasiones || defaultContent.ocasiones,
        zonas_preferidas: reservationsConfig.zonas_preferidas || defaultContent.zonas_preferidas,
        plantilla_whatsapp: defaultContent.plantilla_whatsapp, // Mantener plantilla por defecto
        configuracion: {
          anticipacion_minima_horas: reservationsConfig.anticipacion_minima_horas || defaultContent.configuracion.anticipacion_minima_horas,
          mensaje_domingo_cerrado: reservationsConfig.mensaje_domingo_cerrado || defaultContent.configuracion.mensaje_domingo_cerrado,
          mensaje_fuera_horario: reservationsConfig.mensaje_fuera_horario || defaultContent.configuracion.mensaje_fuera_horario
        },
        restricciones: {
          edad_minima: 0,
          maximo_personas: reservationsConfig.maximo_personas || defaultContent.restricciones.maximo_personas,
          tiempo_mesa_promedio: reservationsConfig.tiempo_mesa_promedio || defaultContent.restricciones.tiempo_mesa_promedio
        },
        dias_cerrados: reservationsConfig.dias_cerrados || defaultContent.dias_cerrados,
        vacation_mode: {
          holiday_mode_active: reservationsConfig.holiday_mode_active || defaultContent.vacation_mode.holiday_mode_active,
          fechas_bloqueadas: Array.isArray(reservationsConfig.fechas_bloqueadas) 
            ? reservationsConfig.fechas_bloqueadas 
            : defaultContent.vacation_mode.fechas_bloqueadas
        }
      };
      
      setContent(newContent);
    }
  }, [reservationsConfig]);

  // Helper para guardar contenido (usado tanto manual como automáticamente)
  const saveContent = async (contentToSave: ReservasContent, showStatus = true) => {
    try {
      if (showStatus) {
        setIsSaving(true);
        setSaveStatus('idle');
      }

      const updateData = {
        // Textos individuales en campos separados
        titulo_principal: contentToSave.textos.titulo_principal,
        subtitulo: contentToSave.textos.subtitulo,
        descripcion: contentToSave.textos.descripcion,
        mensaje_confirmacion: contentToSave.textos.mensaje_confirmacion,
        // Arrays de horarios
        horarios_comida: contentToSave.horarios.comida,
        horarios_cena: contentToSave.horarios.cena,
        // Ocasiones y zonas
        ocasiones: contentToSave.ocasiones,
        zonas_preferidas: contentToSave.zonas_preferidas,
        // Configuración de políticas
        anticipacion_minima_horas: contentToSave.configuracion.anticipacion_minima_horas,
        mensaje_domingo_cerrado: contentToSave.configuracion.mensaje_domingo_cerrado,
        mensaje_fuera_horario: contentToSave.configuracion.mensaje_fuera_horario,
        // Restricciones
        maximo_personas: contentToSave.restricciones.maximo_personas,
        tiempo_mesa_promedio: contentToSave.restricciones.tiempo_mesa_promedio,
        // Días cerrados y modo vacaciones
        dias_cerrados: contentToSave.dias_cerrados,
        holiday_mode_active: contentToSave.vacation_mode.holiday_mode_active,
        fechas_bloqueadas: contentToSave.vacation_mode.fechas_bloqueadas,
        // JSONB adicional para compatibility
        intro_content: contentToSave.textos,
        schedules: contentToSave.horarios,
        contact_info: {
          phone: "+34 672 79 60 06",
          email: "reservas@enigmaconalma.com",
          address: "Calle Justicia 6A, 03710 Calpe, Alicante"
        },
        policies: contentToSave.configuracion,
        additional_info: contentToSave.informacion_adicional,
        average_table_time: contentToSave.restricciones.tiempo_mesa_promedio
      };

      const result = await updateReservationsConfig.mutateAsync(updateData);

      if (showStatus) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
      
      return result;
    } catch (error) {
      console.error('💾 [SAVE] Error saving content:', error);
      if (showStatus) {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
      throw error;
    } finally {
      if (showStatus) {
        setIsSaving(false);
      }
    }
  };

  // Guardar contenido manual
  const handleSave = async () => {
    await saveContent(content, true);
  };

  // Agregar horario
  const addHorario = (tipo: 'comida' | 'cena', hora: string) => {
    if (hora && !content.horarios[tipo].includes(hora)) {
      setContent(prev => ({
        ...prev,
        horarios: {
          ...prev.horarios,
          [tipo]: [...prev.horarios[tipo], hora].sort()
        }
      }));
    }
  };

  // Eliminar horario
  const removeHorario = (tipo: 'comida' | 'cena', index: number) => {
    setContent(prev => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        [tipo]: prev.horarios[tipo].filter((_, i) => i !== index)
      }
    }));
  };

  // Agregar ocasión
  const addOcasion = (ocasion: string) => {
    if (ocasion && !content.ocasiones.includes(ocasion)) {
      setContent(prev => ({
        ...prev,
        ocasiones: [...prev.ocasiones, ocasion]
      }));
    }
  };

  // Eliminar ocasión
  const removeOcasion = (index: number) => {
    setContent(prev => ({
      ...prev,
      ocasiones: prev.ocasiones.filter((_, i) => i !== index)
    }));
  };

  // Agregar zona preferida
  const addZona = (label: string) => {
    if (label.trim()) {
      const newValue = Math.max(...content.zonas_preferidas.map(z => z.value), 0) + 1;
      setContent(prev => ({
        ...prev,
        zonas_preferidas: [...prev.zonas_preferidas, { value: newValue, label: label.trim() }]
      }));
    }
  };

  // Eliminar zona preferida
  const removeZona = (index: number) => {
    setContent(prev => ({
      ...prev,
      zonas_preferidas: prev.zonas_preferidas.filter((_, i) => i !== index)
    }));
  };

  // Editar zona preferida
  const updateZona = (index: number, newLabel: string) => {
    setContent(prev => ({
      ...prev,
      zonas_preferidas: prev.zonas_preferidas.map((zona, i) => 
        i === index ? { ...zona, label: newLabel } : zona
      )
    }));
  };

  // Agregar información importante con auto-guardado
  const addInformacionImportante = async (info: string) => {
    if (info && !content.informacion_adicional.informacion_importante.includes(info)) {
      const updatedContent = {
        ...content,
        informacion_adicional: {
          ...content.informacion_adicional,
          informacion_importante: [...content.informacion_adicional.informacion_importante, info]
        }
      };
      
      setContent(updatedContent);
      
      // Auto-guardar inmediatamente sin mostrar status
      try {
        await saveContent(updatedContent, false);
        
        // Limpiar cache del frontend para que se actualice inmediatamente
        if (window.frontendClearCache) {
          window.frontendClearCache();
        }
      } catch (error) {
        console.error('Error auto-saving after adding phrase:', error);
      }
    }
  };

  // Eliminar información importante con auto-guardado
  const removeInformacionImportante = async (index: number) => {
    const updatedContent = {
      ...content,
      informacion_adicional: {
        ...content.informacion_adicional,
        informacion_importante: content.informacion_adicional.informacion_importante.filter((_, i) => i !== index)
      }
    };
    
    setContent(updatedContent);
    
    // Auto-guardar inmediatamente sin mostrar status
    try {
      await saveContent(updatedContent, false);
      
      // Limpiar cache del frontend para que se actualice inmediatamente
      if (window.frontendClearCache) {
        window.frontendClearCache();
      }
    } catch (error) {
      console.error('Error auto-saving after removing phrase:', error);
    }
  };

  // Funciones para gestión de días cerrados
  const toggleDayStatus = (dayIndex: number) => {
    setContent(prev => {
      const newDiasCerrados = prev.dias_cerrados.includes(dayIndex)
        ? prev.dias_cerrados.filter(day => day !== dayIndex)
        : [...prev.dias_cerrados, dayIndex];
      
      return {
        ...prev,
        dias_cerrados: newDiasCerrados
      };
    });
  };

  // Funciones para modo vacaciones
  const toggleVacationMode = () => {
    setContent(prev => ({
      ...prev,
      vacation_mode: {
        ...prev.vacation_mode,
        holiday_mode_active: !prev.vacation_mode.holiday_mode_active
      }
    }));
  };

  const addBlockedDate = (date: string) => {
    if (date && !content.vacation_mode.fechas_bloqueadas.includes(date)) {
      setContent(prev => ({
        ...prev,
        vacation_mode: {
          ...prev.vacation_mode,
          fechas_bloqueadas: [...prev.vacation_mode.fechas_bloqueadas, date]
        }
      }));
    }
  };

  const removeBlockedDate = (index: number) => {
    setContent(prev => ({
      ...prev,
      vacation_mode: {
        ...prev.vacation_mode,
        fechas_bloqueadas: prev.vacation_mode.fechas_bloqueadas.filter((_, i) => i !== index)
      }
    }));
  };

  // Preview de plantilla WhatsApp
  const getWhatsAppPreview = () => {
    let preview = content.plantilla_whatsapp.mensaje;
    const sampleData = {
      '{fecha}': '25 de diciembre de 2024',
      '{hora}': '20:30',
      '{personas}': '4',
      '{nombre}': 'María García',
      '{telefono}': '+34 666 777 888',
      '{email}': 'maria@example.com',
      '{ocasion}': 'Aniversario',
      '{preferencia}': 'Sin gluten',
      '{requisitos}': 'Mesa en terraza',
      '{notas}': 'Celebramos nuestro 10º aniversario',
      '{primera_visita}': 'Sí'
    };

    Object.entries(sampleData).forEach(([variable, value]) => {
      preview = preview.replace(new RegExp(variable.replace(/[{}]/g, '\\$&'), 'g'), value);
    });

    return preview;
  };

  if (reservationsConfigLoading) {
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
            <Calendar className="h-6 w-6 text-enigma-primary" />
            Gestión de Reservas Web
          </h1>
          <p className="text-body-sm text-enigma-neutral-600 mt-1">
            Administra la configuración del sistema de reservas web
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetchReservationsConfig()}
            className="ios-button ios-button-sm ios-button-secondary"
          >
            <RefreshCcw size={16} />
          </button>
          
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="ios-button ios-button-sm ios-button-secondary"
          >
            <Eye size={16} />
            {showPreview ? 'Ocultar' : 'Vista Previa'}
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
                ? 'Configuración de reservas guardada correctamente'
                : 'Error al guardar la configuración de reservas'
              }
            </div>
          </IOSCardContent>
        </IOSCard>
      )}

      {/* Tabs */}
      <IOSCard variant="elevated">
        <IOSCardContent className="p-0">
          <div className="flex border-b border-gray-200">
            {[
              { key: 'contenido', label: 'Contenido', icon: <Edit3 size={18} /> },
              { key: 'horarios', label: 'Horarios & Ocasiones', icon: <Clock size={18} /> },
              { key: 'plantilla', label: 'Plantilla WhatsApp', icon: <MessageSquare size={18} /> },
              { key: 'configuracion', label: 'Configuración', icon: <Settings size={18} /> }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-enigma-primary text-enigma-primary bg-enigma-primary/5'
                    : 'border-transparent text-enigma-neutral-600 hover:text-enigma-neutral-900'
                }`}
              >
                {tab.icon}
                <span className="ios-text-callout font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </IOSCardContent>
      </IOSCard>

      {/* Contenido */}
      {activeTab === 'contenido' && (
        <div className="space-y-6">
        <IOSCard variant="elevated">
          <IOSCardHeader>
            <IOSCardTitle className="flex items-center gap-2">
              <Edit3 size={20} />
              Textos de la Página
            </IOSCardTitle>
          </IOSCardHeader>
          <IOSCardContent className="space-y-6">
            <div>
              <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                Título Principal
              </label>
              <input
                type="text"
                value={content.textos.titulo_principal}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  textos: { ...prev.textos, titulo_principal: e.target.value }
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary"
              />
            </div>

            <div>
              <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                Subtítulo
              </label>
              <input
                type="text"
                value={content.textos.subtitulo}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  textos: { ...prev.textos, subtitulo: e.target.value }
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary"
              />
            </div>

            <div>
              <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                Descripción
              </label>
              <textarea
                value={content.textos.descripcion}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  textos: { ...prev.textos, descripcion: e.target.value }
                }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary"
              />
            </div>

            <div>
              <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                Mensaje de Confirmación
              </label>
              <textarea
                value={content.textos.mensaje_confirmacion}
                onChange={(e) => setContent(prev => ({
                  ...prev,
                  textos: { ...prev.textos, mensaje_confirmacion: e.target.value }
                }))}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary"
              />
            </div>
          </IOSCardContent>
        </IOSCard>

        {/* Widget de Información Adicional */}
        <IOSCard variant="elevated">
          <IOSCardHeader>
            <IOSCardTitle className="flex items-center gap-2">
              <AlertCircle size={20} />
              Información Adicional
            </IOSCardTitle>
          </IOSCardHeader>
          <IOSCardContent className="space-y-4">
            {/* Solo Información Importante */}
            <div>
              <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                Información Importante para Reservas
              </label>
              <p className="text-sm text-gray-600 mb-3">
                Agrega o elimina frases que aparecerán en la página de reservas del sitio web
              </p>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nueva información importante..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        addInformacionImportante(target.value);
                        target.value = '';
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-ios text-sm focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                  />
                  <IOSButton
                    variant="outline"
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                      if (input && input.value) {
                        addInformacionImportante(input.value);
                        input.value = '';
                      }
                    }}
                  >
                    <Plus size={16} />
                  </IOSButton>
                </div>
                <div className="space-y-2">
                  {content.informacion_adicional.informacion_importante.map((info, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-ios px-3 py-2">
                      <span className="text-sm">{info}</span>
                      <button
                        onClick={() => removeInformacionImportante(index)}
                        className="text-red-500 hover:text-red-700"
                        title="Eliminar"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </IOSCardContent>
        </IOSCard>
        </div>
      )}

      {/* Horarios y Ocasiones */}
      {activeTab === 'horarios' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Horarios de Comida */}
          <IOSCard variant="elevated">
            <IOSCardHeader>
              <IOSCardTitle>Horarios de Comida</IOSCardTitle>
            </IOSCardHeader>
            <IOSCardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="time"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        addHorario('comida', target.value);
                        target.value = '';
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-ios text-sm focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                  />
                  <IOSButton
                    variant="outline"
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                      if (input && input.value) {
                        addHorario('comida', input.value);
                        input.value = '';
                      }
                    }}
                  >
                    <Plus size={16} />
                  </IOSButton>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {content.horarios.comida.map((hora, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-ios px-3 py-2">
                      <span className="text-sm">{hora}</span>
                      <button
                        onClick={() => removeHorario('comida', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </IOSCardContent>
          </IOSCard>

          {/* Horarios de Cena */}
          <IOSCard variant="elevated">
            <IOSCardHeader>
              <IOSCardTitle>Horarios de Cena</IOSCardTitle>
            </IOSCardHeader>
            <IOSCardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="time"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        addHorario('cena', target.value);
                        target.value = '';
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-ios text-sm focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                  />
                  <IOSButton
                    variant="outline"
                    onClick={(e) => {
                      const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                      if (input && input.value) {
                        addHorario('cena', input.value);
                        input.value = '';
                      }
                    }}
                  >
                    <Plus size={16} />
                  </IOSButton>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {content.horarios.cena.map((hora, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-ios px-3 py-2">
                      <span className="text-sm">{hora}</span>
                      <button
                        onClick={() => removeHorario('cena', index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </IOSCardContent>
          </IOSCard>

          {/* Ocasiones */}
          <div className="lg:col-span-2">
            <IOSCard variant="elevated">
              <IOSCardHeader>
                <IOSCardTitle>Ocasiones Especiales</IOSCardTitle>
              </IOSCardHeader>
              <IOSCardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Agregar ocasión"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          addOcasion(target.value.trim());
                          target.value = '';
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-ios text-sm focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                    />
                    <IOSButton
                      variant="outline"
                      onClick={(e) => {
                        const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                        if (input && input.value) {
                          addOcasion(input.value.trim());
                          input.value = '';
                        }
                      }}
                    >
                      <Plus size={16} />
                    </IOSButton>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {content.ocasiones.map((ocasion, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-ios px-3 py-2">
                        <span className="text-sm">{ocasion}</span>
                        <button
                          onClick={() => removeOcasion(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </IOSCardContent>
            </IOSCard>
          </div>

          {/* Zonas Preferidas */}
          <div className="lg:col-span-2">
            <IOSCard variant="elevated">
              <IOSCardHeader>
                <IOSCardTitle>Zonas Preferidas</IOSCardTitle>
              </IOSCardHeader>
              <IOSCardContent>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Agregar zona"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const target = e.target as HTMLInputElement;
                          addZona(target.value.trim());
                          target.value = '';
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-ios text-sm focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                    />
                    <IOSButton
                      variant="outline"
                      onClick={(e) => {
                        const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                        if (input && input.value) {
                          addZona(input.value.trim());
                          input.value = '';
                        }
                      }}
                    >
                      <Plus size={16} />
                    </IOSButton>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {content.zonas_preferidas.map((zona, index) => (
                      <div key={index} className="flex items-center justify-between bg-blue-50 rounded-ios px-3 py-2">
                        <input
                          type="text"
                          value={zona.label}
                          onChange={(e) => updateZona(index, e.target.value)}
                          className="text-sm bg-transparent border-none outline-none flex-1"
                        />
                        <button
                          onClick={() => removeZona(index)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-600">
                    Las zonas aparecerán como opciones en el formulario de reservas.
                  </p>
                </div>
              </IOSCardContent>
            </IOSCard>
          </div>
        </div>
      )}

      {/* Plantilla WhatsApp */}
      {activeTab === 'plantilla' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IOSCard variant="elevated">
            <IOSCardHeader>
              <IOSCardTitle>Plantilla de Mensaje</IOSCardTitle>
            </IOSCardHeader>
            <IOSCardContent>
              <div className="space-y-4">
                <textarea
                  value={content.plantilla_whatsapp.mensaje}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    plantilla_whatsapp: { ...prev.plantilla_whatsapp, mensaje: e.target.value }
                  }))}
                  rows={15}
                  className="w-full px-4 py-2 border border-gray-300 rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary font-mono text-sm"
                />
                <div>
                  <p className="ios-text-caption1 text-enigma-neutral-500 mb-2">
                    Variables disponibles:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {content.plantilla_whatsapp.variables_disponibles.map((variable, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-enigma-primary/10 text-enigma-primary cursor-pointer"
                        onClick={() => {
                          const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
                          if (textarea) {
                            const start = textarea.selectionStart;
                            const end = textarea.selectionEnd;
                            const text = textarea.value;
                            const newText = text.substring(0, start) + variable + text.substring(end);
                            setContent(prev => ({
                              ...prev,
                              plantilla_whatsapp: { ...prev.plantilla_whatsapp, mensaje: newText }
                            }));
                          }
                        }}
                      >
                        {variable}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </IOSCardContent>
          </IOSCard>

          <IOSCard variant="elevated">
            <IOSCardHeader>
              <IOSCardTitle>Vista Previa</IOSCardTitle>
            </IOSCardHeader>
            <IOSCardContent>
              <div className="bg-green-50 border border-green-200 rounded-ios-lg p-4">
                <p className="ios-text-caption1 text-green-600 mb-2 font-medium">
                  Preview del mensaje WhatsApp:
                </p>
                <div className="bg-white rounded-ios-lg p-3 whitespace-pre-wrap text-sm">
                  {getWhatsAppPreview()}
                </div>
              </div>
            </IOSCardContent>
          </IOSCard>
        </div>
      )}

      {/* Configuración */}
      {activeTab === 'configuracion' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IOSCard variant="elevated">
            <IOSCardHeader>
              <IOSCardTitle>Parámetros de Reserva</IOSCardTitle>
            </IOSCardHeader>
            <IOSCardContent className="space-y-4">
              <div>
                <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                  Anticipación mínima (horas)
                </label>
                <input
                  type="number"
                  value={content.configuracion.anticipacion_minima_horas}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    configuracion: { ...prev.configuracion, anticipacion_minima_horas: parseInt(e.target.value) }
                  }))}
                  min="1"
                  max="72"
                  className="w-full px-4 py-2 border border-gray-300 rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                />
              </div>

              <div>
                <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                  Edad mínima
                </label>
                <input
                  type="number"
                  value={content.restricciones.edad_minima}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    restricciones: { ...prev.restricciones, edad_minima: parseInt(e.target.value) }
                  }))}
                  min="0"
                  max="21"
                  className="w-full px-4 py-2 border border-gray-300 rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                />
              </div>

              <div>
                <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                  Máximo de personas por reserva
                </label>
                <input
                  type="number"
                  value={content.restricciones.maximo_personas}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    restricciones: { ...prev.restricciones, maximo_personas: parseInt(e.target.value) }
                  }))}
                  min="1"
                  max="20"
                  className="w-full px-4 py-2 border border-gray-300 rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                />
              </div>

              <div>
                <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                  Tiempo promedio de mesa (minutos)
                </label>
                <input
                  type="number"
                  value={content.restricciones.tiempo_mesa_promedio}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    restricciones: { ...prev.restricciones, tiempo_mesa_promedio: parseInt(e.target.value) }
                  }))}
                  min="60"
                  max="240"
                  step="15"
                  className="w-full px-4 py-2 border border-gray-300 rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                />
              </div>
            </IOSCardContent>
          </IOSCard>

          <IOSCard variant="elevated">
            <IOSCardHeader>
              <IOSCardTitle>Mensajes del Sistema</IOSCardTitle>
            </IOSCardHeader>
            <IOSCardContent className="space-y-4">
              <div>
                <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                  Mensaje: Domingo cerrado
                </label>
                <textarea
                  value={content.configuracion.mensaje_domingo_cerrado}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    configuracion: { ...prev.configuracion, mensaje_domingo_cerrado: e.target.value }
                  }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                />
              </div>

              <div>
                <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                  Mensaje: Fuera de horario
                </label>
                <textarea
                  value={content.configuracion.mensaje_fuera_horario}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    configuracion: { ...prev.configuracion, mensaje_fuera_horario: e.target.value }
                  }))}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                />
              </div>
            </IOSCardContent>
          </IOSCard>

          {/* Gestión de Días Cerrados */}
          <IOSCard variant="elevated">
            <IOSCardHeader>
              <IOSCardTitle>Gestión de Días Cerrados</IOSCardTitle>
            </IOSCardHeader>
            <IOSCardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {['Domingos', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábados'].map((day, index) => {
                  const isClosed = content.dias_cerrados.includes(index);
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-ios">
                      <span className="text-sm font-medium">{day}</span>
                      <button
                        onClick={() => toggleDayStatus(index)}
                        className={`px-3 py-1 rounded-ios text-xs font-medium transition-colors ${
                          isClosed 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {isClosed ? '🔒 Cerrado' : '✅ Abierto'}
                      </button>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-gray-600">
                Los días marcados como cerrados aparecerán bloqueados en el calendario de reservas.
              </p>
            </IOSCardContent>
          </IOSCard>

          {/* Modo Vacaciones */}
          <IOSCard variant="elevated">
            <IOSCardHeader>
              <IOSCardTitle>Modo Vacaciones</IOSCardTitle>
            </IOSCardHeader>
            <IOSCardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-ios">
                <div>
                  <span className="text-sm font-medium">Modo Vacaciones</span>
                  <p className="text-xs text-gray-600">Bloquear fechas específicas temporalmente</p>
                </div>
                <button
                  onClick={toggleVacationMode}
                  className={`px-3 py-1 rounded-ios text-xs font-medium transition-colors ${
                    content.vacation_mode.holiday_mode_active 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {content.vacation_mode.holiday_mode_active ? '🟠 Activo' : '⚪ Inactivo'}
                </button>
              </div>

              {content.vacation_mode.holiday_mode_active && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="date"
                      onChange={(e) => {
                        if (e.target.value) {
                          addBlockedDate(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-ios text-sm focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                    />
                    <IOSButton
                      variant="outline"
                      onClick={(e) => {
                        const input = (e.target as HTMLElement).parentElement?.querySelector('input') as HTMLInputElement;
                        if (input && input.value) {
                          addBlockedDate(input.value);
                          input.value = '';
                        }
                      }}
                    >
                      <Plus size={16} />
                    </IOSButton>
                  </div>

                  <div className="space-y-2">
                    {content.vacation_mode.fechas_bloqueadas.map((fecha, index) => (
                      <div key={index} className="flex items-center justify-between bg-orange-50 rounded-ios px-3 py-2">
                        <span className="text-sm">{fecha}</span>
                        <button
                          onClick={() => removeBlockedDate(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {content.vacation_mode.fechas_bloqueadas.length === 0 && (
                      <p className="text-xs text-gray-500 text-center py-2">
                        No hay fechas bloqueadas
                      </p>
                    )}
                  </div>
                </div>
              )}
            </IOSCardContent>
          </IOSCard>
        </div>
      )}

      {/* Vista previa del formulario */}
      {showPreview && (
        <IOSCard variant="elevated">
          <IOSCardHeader>
            <IOSCardTitle className="flex items-center gap-2">
              <Eye size={20} />
              Vista Previa del Formulario de Reservas
            </IOSCardTitle>
          </IOSCardHeader>
          <IOSCardContent>
            <div className="bg-gray-50 rounded-ios-lg p-6">
              <div className="text-center mb-6">
                <h1 className="ios-text-title1 font-bold text-enigma-neutral-900 mb-2">
                  {content.textos.titulo_principal}
                </h1>
                <p className="ios-text-headline text-enigma-neutral-600 mb-4">
                  {content.textos.subtitulo}
                </p>
                <p className="ios-text-body text-enigma-neutral-700">
                  {content.textos.descripcion}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium mb-2">Horarios de Comida:</p>
                  <div className="flex flex-wrap gap-1">
                    {content.horarios.comida.slice(0, 6).map((hora, index) => (
                      <span key={index} className="bg-white px-2 py-1 rounded text-xs">
                        {hora}
                      </span>
                    ))}
                    {content.horarios.comida.length > 6 && (
                      <span className="text-gray-500 px-2 py-1">
                        +{content.horarios.comida.length - 6} más
                      </span>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="font-medium mb-2">Horarios de Cena:</p>
                  <div className="flex flex-wrap gap-1">
                    {content.horarios.cena.slice(0, 6).map((hora, index) => (
                      <span key={index} className="bg-white px-2 py-1 rounded text-xs">
                        {hora}
                      </span>
                    ))}
                    {content.horarios.cena.length > 6 && (
                      <span className="text-gray-500 px-2 py-1">
                        +{content.horarios.cena.length - 6} más
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-green-50 rounded-ios">
                <p className="text-sm text-green-700">
                  {content.textos.mensaje_confirmacion}
                </p>
              </div>
            </div>
          </IOSCardContent>
        </IOSCard>
      )}
    </div>
  );
}