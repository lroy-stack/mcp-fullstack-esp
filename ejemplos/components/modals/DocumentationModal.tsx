import React, { useState, useEffect } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Search, BookOpen, 
  Clock, Star, CheckCircle, AlertCircle, Info,
  Copy, ExternalLink, Download, Share, Maximize,
  Calendar, Users, Grid3X3, BarChart3, Settings,
  Zap, Video, FileText, Book, Image, PlayCircle
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { createModuleLogger } from '@/utils/logger';

const logger = createModuleLogger('DocumentationModal');

export interface DocumentationSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  estimatedTime: string;
  difficulty: 'Principiante' | 'Intermedio' | 'Avanzado';
  category: 'getting-started' | 'reservations' | 'customers' | 'tables' | 'analytics' | 'settings';
  content: DocumentationContent;
}

export interface DocumentationContent {
  introduction: string;
  steps: DocumentationStep[];
  tips?: string[];
  warnings?: string[];
  relatedSections?: string[];
  images?: DocumentationImage[];
}

export interface DocumentationStep {
  id: string;
  title: string;
  description: string;
  content: string;
  type: 'text' | 'image' | 'code' | 'warning' | 'tip' | 'note';
  image?: string;
  code?: string;
}

export interface DocumentationImage {
  id: string;
  url: string;
  alt: string;
  caption: string;
  step?: string;
}

interface DocumentationModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: DocumentationSection | null;
  allSections: DocumentationSection[];
}

// Colores Enigma para el modal
const ENIGMA_COLORS = {
  primary: '#237584',
  secondary: '#9FB289',
  accent: '#CB5910',
  primaryLight: '#23758420',
  secondaryLight: '#9FB28920',
  accentLight: '#CB591020'
} as const;

export function DocumentationModal({ 
  isOpen, 
  onClose, 
  section, 
  allSections 
}: DocumentationModalProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  // Reset state when section changes
  useEffect(() => {
    if (section) {
      setCurrentStepIndex(0);
      setSearchQuery('');
      logger.debug('Documentation modal opened for section:', section.id);
    }
  }, [section]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && currentStepIndex > 0) {
        setCurrentStepIndex(prev => prev - 1);
      } else if (e.key === 'ArrowRight' && section && currentStepIndex < section.content.steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      } else if (e.key === 'F11') {
        e.preventDefault();
        setIsFullscreen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, section, onClose]);

  if (!section) return null;

  const currentStep = section.content.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / section.content.steps.length) * 100;

  const handleStepComplete = (stepId: string) => {
    setCompletedSteps(prev => new Set([...prev, stepId]));
    toast.success('Paso completado correctamente');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado al portapapeles');
  };

  const handleNextStep = () => {
    if (currentStepIndex < section.content.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Principiante': return '#9FB289';
      case 'Intermedio': return '#CB5910';
      case 'Avanzado': return '#237584';
      default: return '#237584';
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertCircle;
      case 'tip': return Star;
      case 'note': return Info;
      case 'image': return Image;
      case 'code': return FileText;
      default: return CheckCircle;
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'warning': return '#FF6B6B';
      case 'tip': return '#4ECDC4';
      case 'note': return '#45B7D1';
      case 'image': return '#96CEB4';
      case 'code': return '#FECA57';
      default: return '#A8E6CF';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "p-0 overflow-hidden border-0 shadow-2xl flex flex-col",
          isFullscreen 
            ? "max-w-full h-full w-full" 
            : "max-w-6xl max-h-[95vh] w-[98vw] sm:w-[95vw] lg:w-[90vw]"
        )}
        style={{
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRadius: isFullscreen ? '0' : '16px'
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between p-3 sm:p-4 lg:p-6">
            {/* Left: Section Info */}
            <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                style={{
                  backgroundColor: section.color + '20',
                  color: section.color
                }}
              >
                <section.icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{section.title}</h2>
                <div className="flex items-center space-x-2 sm:space-x-3 mt-1 flex-wrap">
                  <IOSBadge 
                    className="text-xs"
                    style={{ 
                      backgroundColor: getDifficultyColor(section.difficulty) + '20',
                      color: getDifficultyColor(section.difficulty)
                    }}
                  >
                    {section.difficulty}
                  </IOSBadge>
                  <span className="text-xs sm:text-sm text-gray-600 flex items-center">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    {section.estimatedTime}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-600 hidden sm:inline">
                    Paso {currentStepIndex + 1} de {section.content.steps.length}
                  </span>
                </div>
                {/* Mostrar progreso paso en móvil */}
                <div className="block sm:hidden mt-1">
                  <span className="text-xs text-gray-500">
                    {currentStepIndex + 1}/{section.content.steps.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              {/* Fullscreen button - hidden on mobile */}
              <IOSButton 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="hover:bg-gray-100 hidden sm:flex"
              >
                <Maximize className="w-4 h-4" />
              </IOSButton>
              {/* Share button - hidden on mobile */}
              <IOSButton 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  const url = window.location.href + `#help-${section.id}`;
                  navigator.clipboard.writeText(url);
                  toast.success('Enlace copiado');
                }}
                className="hover:bg-gray-100 hidden sm:flex"
              >
                <Share className="w-4 h-4" />
              </IOSButton>
              {/* Close button - always visible */}
              <IOSButton 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="hover:bg-gray-100 p-2"
              >
                <X className="w-4 h-4" />
              </IOSButton>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-3 sm:px-4 lg:px-6 pb-3 sm:pb-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: section.color
                }}
              />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Sidebar: Table of Contents - Hidden on mobile */}
          <div className="hidden lg:block w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto flex-shrink-0">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Contenido</h3>
              <div className="space-y-2">
                {section.content.steps.map((step, index) => {
                  const StepIcon = getStepIcon(step.type);
                  const isActive = index === currentStepIndex;
                  const isCompleted = completedSteps.has(step.id);
                  
                  return (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStepIndex(index)}
                      className={cn(
                        "w-full flex items-center p-3 rounded-lg text-left transition-all",
                        isActive 
                          ? "bg-white shadow-sm border-2"
                          : "hover:bg-white/50",
                        isCompleted && "border-green-200 bg-green-50"
                      )}
                      style={isActive ? { borderColor: section.color } : {}}
                    >
                      <div className="flex items-center space-x-3 w-full">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{
                            backgroundColor: isCompleted 
                              ? '#10B981' 
                              : getStepColor(step.type) + '40',
                            color: isCompleted ? 'white' : getStepColor(step.type)
                          }}
                        >
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <StepIcon className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {step.title}
                            </span>
                            <span className="text-xs text-gray-500 ml-2">
                              {index + 1}
                            </span>
                          </div>
                          {step.description && (
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                              {step.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Related Sections */}
              {section.content.relatedSections && section.content.relatedSections.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">Secciones Relacionadas</h4>
                  <div className="space-y-2">
                    {section.content.relatedSections.map((relatedId) => {
                      const relatedSection = allSections.find(s => s.id === relatedId);
                      if (!relatedSection) return null;
                      
                      return (
                        <button
                          key={relatedId}
                          className="w-full flex items-center p-2 rounded-lg hover:bg-white/50 text-left"
                        >
                          <relatedSection.icon className="w-4 h-4 mr-2 flex-shrink-0" style={{ color: relatedSection.color }} />
                          <span className="text-sm text-gray-700 truncate">
                            {relatedSection.title}
                          </span>
                          <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6 lg:p-8 pb-6">
                {/* Current Step Content */}
                <div className="max-w-none lg:max-w-3xl">
                  {/* Step Header */}
                  <div className="mb-4 sm:mb-6">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                      {React.createElement(getStepIcon(currentStep.type), {
                        className: "w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0",
                        style: { color: getStepColor(currentStep.type) }
                      })}
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">{currentStep.title}</h3>
                    </div>
                    
                    {currentStep.description && (
                      <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                        {currentStep.description}
                      </p>
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
                    {/* Text Content */}
                    <div 
                      className="text-gray-700 leading-relaxed mb-4 sm:mb-6 text-sm sm:text-base"
                      dangerouslySetInnerHTML={{ __html: currentStep.content }}
                    />

                    {/* Image */}
                    {currentStep.image && (
                      <div className="my-4 sm:my-6 lg:my-8">
                        <div className="rounded-lg sm:rounded-xl overflow-hidden shadow-lg border border-gray-200">
                          <img 
                            src={currentStep.image} 
                            alt={currentStep.title}
                            className="w-full h-auto"
                          />
                        </div>
                      </div>
                    )}

                    {/* Code Block */}
                    {currentStep.code && (
                      <div className="my-4 sm:my-6">
                        <div className="relative">
                          <pre className="bg-gray-900 text-gray-100 p-3 sm:p-4 rounded-lg sm:rounded-xl overflow-x-auto text-xs sm:text-sm">
                            <code>{currentStep.code}</code>
                          </pre>
                          <button
                            onClick={() => handleCopyCode(currentStep.code!)}
                            className="absolute top-2 sm:top-3 right-2 sm:right-3 p-1.5 sm:p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-300"
                          >
                            <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Warning/Tip/Note Boxes */}
                    {currentStep.type !== 'text' && (
                      <div 
                        className="p-3 sm:p-4 rounded-lg sm:rounded-xl border-l-4 my-4 sm:my-6"
                        style={{
                          backgroundColor: getStepColor(currentStep.type) + '10',
                          borderLeftColor: getStepColor(currentStep.type)
                        }}
                      >
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          {React.createElement(getStepIcon(currentStep.type), {
                            className: "w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0",
                            style: { color: getStepColor(currentStep.type) }
                          })}
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">
                              {currentStep.type === 'warning' && 'Advertencia'}
                              {currentStep.type === 'tip' && 'Consejo'}
                              {currentStep.type === 'note' && 'Nota Importante'}
                            </h4>
                            <div 
                              className="text-gray-700 text-sm sm:text-base"
                              dangerouslySetInnerHTML={{ __html: currentStep.content }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Fixed CTAs at Bottom */}
            <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 sm:p-6">
              {/* Mobile Layout: Stack vertically */}
              <div className="block sm:hidden space-y-3">
                {/* Progress and Complete Button */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {currentStepIndex + 1} de {section.content.steps.length}
                  </div>
                  <IOSButton
                    variant={completedSteps.has(currentStep.id) ? "outline" : "primary"}
                    onClick={() => handleStepComplete(currentStep.id)}
                    size="sm"
                    style={{
                      backgroundColor: completedSteps.has(currentStep.id) 
                        ? 'transparent' 
                        : section.color,
                      borderColor: section.color,
                      color: completedSteps.has(currentStep.id) ? section.color : 'white'
                    }}
                  >
                    {completedSteps.has(currentStep.id) ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        <span className="text-xs">Completado</span>
                      </>
                    ) : (
                      <span className="text-xs">Completar</span>
                    )}
                  </IOSButton>
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex space-x-3">
                  <IOSButton
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={currentStepIndex === 0}
                    className="flex-1 flex items-center justify-center space-x-2 py-3"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Anterior</span>
                  </IOSButton>

                  <IOSButton
                    variant="outline"
                    onClick={handleNextStep}
                    disabled={currentStepIndex === section.content.steps.length - 1}
                    className="flex-1 flex items-center justify-center space-x-2 py-3"
                    style={{
                      backgroundColor: currentStepIndex === section.content.steps.length - 1 
                        ? 'transparent' 
                        : section.color,
                      borderColor: section.color,
                      color: currentStepIndex === section.content.steps.length - 1 
                        ? section.color 
                        : 'white'
                    }}
                  >
                    <span>Siguiente</span>
                    <ChevronRight className="w-4 h-4" />
                  </IOSButton>
                </div>
              </div>

              {/* Desktop Layout: Horizontal */}
              <div className="hidden sm:flex items-center justify-between">
                <IOSButton
                  variant="outline"
                  onClick={handlePrevStep}
                  disabled={currentStepIndex === 0}
                  className="flex items-center space-x-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Anterior</span>
                </IOSButton>

                <div className="flex items-center space-x-3">
                  <IOSButton
                    variant={completedSteps.has(currentStep.id) ? "outline" : "primary"}
                    onClick={() => handleStepComplete(currentStep.id)}
                    style={{
                      backgroundColor: completedSteps.has(currentStep.id) 
                        ? 'transparent' 
                        : section.color,
                      borderColor: section.color,
                      color: completedSteps.has(currentStep.id) ? section.color : 'white'
                    }}
                  >
                    {completedSteps.has(currentStep.id) ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Completado
                      </>
                    ) : (
                      'Marcar como Completado'
                    )}
                  </IOSButton>
                </div>

                <IOSButton
                  variant="outline"
                  onClick={handleNextStep}
                  disabled={currentStepIndex === section.content.steps.length - 1}
                  className="flex items-center space-x-2"
                  style={{
                    backgroundColor: currentStepIndex === section.content.steps.length - 1 
                      ? 'transparent' 
                      : section.color,
                    borderColor: section.color,
                    color: currentStepIndex === section.content.steps.length - 1 
                      ? section.color 
                      : 'white'
                  }}
                >
                  <span>Siguiente</span>
                  <ChevronRight className="w-4 h-4" />
                </IOSButton>
              </div>
            </div>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}

export default DocumentationModal;