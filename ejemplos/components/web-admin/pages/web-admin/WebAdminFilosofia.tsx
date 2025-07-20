// =============================================================================
// PÁGINA: WebAdminFilosofia
// Gestión del contenido de filosofía del restaurante
// Migrado desde AdminFilosofia.tsx y adaptado para esquema web
// =============================================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save, RefreshCcw, AlertCircle, Check, User, Star, Award, Clock,
  ChevronUp, ChevronDown, Edit3, Trash2, Plus, X, BookOpen
} from 'lucide-react';
import { useWebPhilosophy } from '@/hooks/web-admin/useWebContentManagement';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { WebPageInsert, WebPageUpdate } from '@/types/web-database';

interface FilosofiaContent {
  historia: {
    titulo: string;
    texto: string;
    cita: string;
  };
  chef: {
    nombre: string;
    cargo: string;
    biografia: string;
    imagen_url: string;
  };
  filosofia: string;
  milestones: Array<{
    year: string;
    text: string;
    orden: number;
  }>;
  especialidades: Array<{
    nombre: string;
    descripcion: string;
    icon: string;
    orden: number;
  }>;
}

const defaultContent: FilosofiaContent = {
  historia: {
    titulo: 'Nuestra Historia',
    texto: '',
    cita: 'La cocina es el arte de transformar historias en sabores...'
  },
  chef: {
    nombre: 'Isabel Abraldes',
    cargo: 'Chef y Propietaria',
    biografia: '',
    imagen_url: 'https://ik.imagekit.io/insomnialz/isabel.jpg'
  },
  filosofia: '',
  milestones: [],
  especialidades: []
};

const iconOptions = [
  { value: 'Utensils', label: 'Cubiertos', icon: '🍽️' },
  { value: 'Clock', label: 'Reloj', icon: '⏰' },
  { value: 'Star', label: 'Estrella', icon: '⭐' },
  { value: 'Award', label: 'Premio', icon: '🏆' },
  { value: 'User', label: 'Usuario', icon: '👤' }
];

export default function WebAdminFilosofia() {
  const { 
    philosophy,
    philosophyLoading,
    philosophyError,
    updatePhilosophy,
    refetchPhilosophy
  } = useWebPhilosophy();

  const [activeTab, setActiveTab] = useState<'contenido' | 'trayectoria' | 'especialidades'>('contenido');
  const [content, setContent] = useState<FilosofiaContent>(defaultContent);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Cargar contenido de filosofía
  useEffect(() => {
    if (philosophy) {
      setContent({
        historia: {
          titulo: philosophy.restaurant_story?.titulo || 'Nuestra Historia',
          texto: philosophy.restaurant_story?.texto || '',
          cita: philosophy.restaurant_story?.cita || 'La cocina es el arte de transformar historias en sabores...'
        },
        chef: {
          nombre: philosophy.chef_info?.nombre || 'Isabel Abraldes',
          cargo: philosophy.chef_info?.cargo || 'Chef y Propietaria',
          biografia: philosophy.chef_info?.biografia || '',
          imagen_url: philosophy.chef_info?.imagen_url || 'https://ik.imagekit.io/insomnialz/isabel.jpg'
        },
        filosofia: philosophy.culinary_philosophy || '',
        milestones: philosophy.milestones || [],
        especialidades: philosophy.specialties || []
      });
    }
  }, [philosophy]);

  // Guardar contenido
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveStatus('idle');

      const updateData = {
        restaurant_story: content.historia,
        chef_info: content.chef,
        culinary_philosophy: content.filosofia,
        milestones: content.milestones,
        specialties: content.especialidades
      };

      await updatePhilosophy.mutateAsync(updateData);

      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving filosofia content:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Agregar milestone
  const addMilestone = () => {
    const newMilestone = {
      year: new Date().getFullYear().toString(),
      text: '',
      orden: content.milestones.length + 1
    };
    setContent(prev => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone]
    }));
  };

  // Eliminar milestone
  const removeMilestone = (index: number) => {
    setContent(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index)
    }));
  };

  // Mover milestone
  const moveMilestone = (index: number, direction: 'up' | 'down') => {
    const newMilestones = [...content.milestones];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newMilestones.length) {
      [newMilestones[index], newMilestones[targetIndex]] = [newMilestones[targetIndex], newMilestones[index]];
      
      // Actualizar órdenes
      newMilestones.forEach((milestone, i) => {
        milestone.orden = i + 1;
      });
      
      setContent(prev => ({ ...prev, milestones: newMilestones }));
    }
  };

  // Agregar especialidad
  const addEspecialidad = () => {
    const newEspecialidad = {
      nombre: '',
      descripcion: '',
      icon: 'Utensils',
      orden: content.especialidades.length + 1
    };
    setContent(prev => ({
      ...prev,
      especialidades: [...prev.especialidades, newEspecialidad]
    }));
  };

  // Eliminar especialidad
  const removeEspecialidad = (index: number) => {
    setContent(prev => ({
      ...prev,
      especialidades: prev.especialidades.filter((_, i) => i !== index)
    }));
  };

  // Mover especialidad
  const moveEspecialidad = (index: number, direction: 'up' | 'down') => {
    const newEspecialidades = [...content.especialidades];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newEspecialidades.length) {
      [newEspecialidades[index], newEspecialidades[targetIndex]] = [newEspecialidades[targetIndex], newEspecialidades[index]];
      
      // Actualizar órdenes
      newEspecialidades.forEach((especialidad, i) => {
        especialidad.orden = i + 1;
      });
      
      setContent(prev => ({ ...prev, especialidades: newEspecialidades }));
    }
  };

  if (philosophyLoading) {
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
            <BookOpen className="h-6 w-6 text-enigma-primary" />
            Gestión de Filosofía
          </h1>
          <p className="text-body-sm text-enigma-neutral-600 mt-1">
            Administra el contenido de filosofía del restaurante
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetchPhilosophy()}
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
                ? 'Contenido guardado correctamente'
                : 'Error al guardar el contenido'
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
              { key: 'contenido', label: 'Contenido Principal', icon: <Edit3 size={18} /> },
              { key: 'trayectoria', label: 'Trayectoria', icon: <Clock size={18} /> },
              { key: 'especialidades', label: 'Especialidades', icon: <Star size={18} /> }
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

      {/* Contenido Principal */}
      {activeTab === 'contenido' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Historia */}
          <IOSCard variant="elevated">
            <IOSCardHeader>
              <IOSCardTitle className="flex items-center gap-2">
                <Edit3 size={20} />
                Historia del Restaurante
              </IOSCardTitle>
            </IOSCardHeader>
            <IOSCardContent className="space-y-4">
              <div>
                <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={content.historia.titulo}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    historia: { ...prev.historia, titulo: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                />
              </div>

              <div>
                <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                  Texto de Historia
                </label>
                <textarea
                  value={content.historia.texto}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    historia: { ...prev.historia, texto: e.target.value }
                  }))}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                  placeholder="Describe la historia del restaurante..."
                />
              </div>

              <div>
                <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                  Cita Inspiradora
                </label>
                <textarea
                  value={content.historia.cita}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    historia: { ...prev.historia, cita: e.target.value }
                  }))}
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-300 rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                  placeholder="Una cita que represente la filosofía del restaurante..."
                />
              </div>
            </IOSCardContent>
          </IOSCard>

          {/* Chef */}
          <IOSCard variant="elevated">
            <IOSCardHeader>
              <IOSCardTitle className="flex items-center gap-2">
                <User size={20} />
                Información del Chef
              </IOSCardTitle>
            </IOSCardHeader>
            <IOSCardContent className="space-y-4">
              <div>
                <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  value={content.chef.nombre}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    chef: { ...prev.chef, nombre: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                />
              </div>

              <div>
                <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                  Cargo
                </label>
                <input
                  type="text"
                  value={content.chef.cargo}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    chef: { ...prev.chef, cargo: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                />
              </div>

              <div>
                <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                  URL de Imagen
                </label>
                <input
                  type="url"
                  value={content.chef.imagen_url}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    chef: { ...prev.chef, imagen_url: e.target.value }
                  }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                />
              </div>

              <div>
                <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                  Biografía
                </label>
                <textarea
                  value={content.chef.biografia}
                  onChange={(e) => setContent(prev => ({
                    ...prev,
                    chef: { ...prev.chef, biografia: e.target.value }
                  }))}
                  rows={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                  placeholder="Biografía del chef..."
                />
              </div>

              {content.chef.imagen_url && (
                <div>
                  <label className="ios-text-callout font-medium text-enigma-neutral-900 block mb-2">
                    Vista previa
                  </label>
                  <div className="w-32 h-32 rounded-ios overflow-hidden">
                    <img 
                      src={content.chef.imagen_url} 
                      alt="Chef"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </IOSCardContent>
          </IOSCard>

          {/* Filosofía Culinaria */}
          <div className="lg:col-span-2">
            <IOSCard variant="elevated">
              <IOSCardHeader>
                <IOSCardTitle className="flex items-center gap-2">
                  <Star size={20} />
                  Filosofía Culinaria
                </IOSCardTitle>
              </IOSCardHeader>
              <IOSCardContent>
                <textarea
                  value={content.filosofia}
                  onChange={(e) => setContent(prev => ({ ...prev, filosofia: e.target.value }))}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 rounded-ios-md focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                  placeholder="Describe la filosofía culinaria del restaurante..."
                />
              </IOSCardContent>
            </IOSCard>
          </div>
        </div>
      )}

      {/* Trayectoria */}
      {activeTab === 'trayectoria' && (
        <IOSCard variant="elevated">
          <IOSCardHeader>
            <div className="flex items-center justify-between">
              <IOSCardTitle className="flex items-center gap-2">
                <Clock size={20} />
                Hitos de la Trayectoria
              </IOSCardTitle>
              <IOSButton
                variant="primary"
                onClick={addMilestone}
                className="flex items-center gap-2"
              >
                <Plus size={18} />
                Agregar Hito
              </IOSButton>
            </div>
          </IOSCardHeader>
          <IOSCardContent>
            {content.milestones.length === 0 ? (
              <div className="text-center py-8">
                <p className="ios-text-body text-enigma-neutral-500 mb-4">
                  No hay hitos de trayectoria configurados
                </p>
                <IOSButton variant="outline" onClick={addMilestone}>
                  Agregar primer hito
                </IOSButton>
              </div>
            ) : (
              <div className="space-y-4">
                {content.milestones.map((milestone, index) => (
                  <motion.div
                    key={index}
                    layout
                    className="bg-gray-50 rounded-ios-lg p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="ios-text-caption1 text-enigma-neutral-500 block mb-1">
                            Año
                          </label>
                          <input
                            type="text"
                            value={milestone.year}
                            onChange={(e) => {
                              const newMilestones = [...content.milestones];
                              newMilestones[index].year = e.target.value;
                              setContent(prev => ({ ...prev, milestones: newMilestones }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-ios text-sm focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label className="ios-text-caption1 text-enigma-neutral-500 block mb-1">
                            Descripción
                          </label>
                          <input
                            type="text"
                            value={milestone.text}
                            onChange={(e) => {
                              const newMilestones = [...content.milestones];
                              newMilestones[index].text = e.target.value;
                              setContent(prev => ({ ...prev, milestones: newMilestones }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-ios text-sm focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                            placeholder="Describe este hito..."
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveMilestone(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-enigma-primary disabled:opacity-30"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          onClick={() => moveMilestone(index, 'down')}
                          disabled={index === content.milestones.length - 1}
                          className="p-1 text-gray-500 hover:text-enigma-primary disabled:opacity-30"
                        >
                          <ChevronDown size={16} />
                        </button>
                        <button
                          onClick={() => removeMilestone(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </IOSCardContent>
        </IOSCard>
      )}

      {/* Especialidades */}
      {activeTab === 'especialidades' && (
        <IOSCard variant="elevated">
          <IOSCardHeader>
            <div className="flex items-center justify-between">
              <IOSCardTitle className="flex items-center gap-2">
                <Star size={20} />
                Especialidades del Restaurante
              </IOSCardTitle>
              <IOSButton
                variant="primary"
                onClick={addEspecialidad}
                className="flex items-center gap-2"
              >
                <Plus size={18} />
                Agregar Especialidad
              </IOSButton>
            </div>
          </IOSCardHeader>
          <IOSCardContent>
            {content.especialidades.length === 0 ? (
              <div className="text-center py-8">
                <p className="ios-text-body text-enigma-neutral-500 mb-4">
                  No hay especialidades configuradas
                </p>
                <IOSButton variant="outline" onClick={addEspecialidad}>
                  Agregar primera especialidad
                </IOSButton>
              </div>
            ) : (
              <div className="space-y-4">
                {content.especialidades.map((especialidad, index) => (
                  <motion.div
                    key={index}
                    layout
                    className="bg-gray-50 rounded-ios-lg p-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="ios-text-caption1 text-enigma-neutral-500 block mb-1">
                            Nombre
                          </label>
                          <input
                            type="text"
                            value={especialidad.nombre}
                            onChange={(e) => {
                              const newEspecialidades = [...content.especialidades];
                              newEspecialidades[index].nombre = e.target.value;
                              setContent(prev => ({ ...prev, especialidades: newEspecialidades }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-ios text-sm focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                            placeholder="Ej: Cocina mediterránea"
                          />
                        </div>
                        <div>
                          <label className="ios-text-caption1 text-enigma-neutral-500 block mb-1">
                            Icono
                          </label>
                          <select
                            value={especialidad.icon}
                            onChange={(e) => {
                              const newEspecialidades = [...content.especialidades];
                              newEspecialidades[index].icon = e.target.value;
                              setContent(prev => ({ ...prev, especialidades: newEspecialidades }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-ios text-sm focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                          >
                            {iconOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.icon} {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-1">
                          <label className="ios-text-caption1 text-enigma-neutral-500 block mb-1">
                            Descripción
                          </label>
                          <input
                            type="text"
                            value={especialidad.descripcion}
                            onChange={(e) => {
                              const newEspecialidades = [...content.especialidades];
                              newEspecialidades[index].descripcion = e.target.value;
                              setContent(prev => ({ ...prev, especialidades: newEspecialidades }));
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-ios text-sm focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                            placeholder="Breve descripción..."
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveEspecialidad(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-enigma-primary disabled:opacity-30"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          onClick={() => moveEspecialidad(index, 'down')}
                          disabled={index === content.especialidades.length - 1}
                          className="p-1 text-gray-500 hover:text-enigma-primary disabled:opacity-30"
                        >
                          <ChevronDown size={16} />
                        </button>
                        <button
                          onClick={() => removeEspecialidad(index)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </IOSCardContent>
        </IOSCard>
      )}
    </div>
  );
}