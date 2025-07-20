import React, { useState, useEffect } from 'react';
import { Mail, Send, X, FileText, Clock, User, Building, ChevronDown, ChevronRight, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSCard, IOSCardContent, IOSCardHeader, IOSCardTitle } from '@/components/ui/ios-card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { extraerSeleccionesMenu } from '@/types/database';
import { formatReservationTime } from '@/utils/dateUtils';
import { useEmailTemplates, useProcessEmailTemplate, useSaveEmailLog, type EmailVariables } from '@/hooks/useEmailTemplates';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientEmail: string;
  recipientName: string;
  reservationData?: {
    id: number;
    fecha_reserva: string;
    hora_reserva: string;
    numero_personas: number;
    estado: string;
    datos_adicionales?: any;
  };
}

// Los templates ahora se cargan dinámicamente desde la base de datos

// Configuración de alias de email
const emailAliases = [
  {
    key: 'hola',
    name: 'Enigma Cocina Con Alma',
    email: 'hola@enigmaconalma.com',
    description: 'Bienvenidas y comunicación general cálida',
    context: 'welcome'
  },
  {
    key: 'enigmito',
    name: 'Enigmito',
    email: 'enigmito@enigmaconalma.com', 
    description: 'Comunicación personal y cercana',
    context: 'personal'
  },
  {
    key: 'info',
    name: 'Información Enigma',
    email: 'info@enigmaconalma.com',
    description: 'Información general y consultas',
    context: 'general'
  },
  {
    key: 'gestion',
    name: 'Gestión Enigma',
    email: 'gestion@enigmaconalma.com',
    description: 'Gestión y administración',
    context: 'management'
  },
  {
    key: 'noreply',
    name: 'Enigma Cocina Con Alma',
    email: 'noreply@enigmaconalma.com',
    description: 'Notificaciones automáticas',
    context: 'transactional'
  }
];

export function EmailModal({ 
  isOpen, 
  onClose, 
  recipientEmail, 
  recipientName, 
  reservationData 
}: EmailModalProps) {
  const [selectedTemplateCode, setSelectedTemplateCode] = useState<string>('mensaje_personalizado');
  const [selectedAlias, setSelectedAlias] = useState<string>('hola');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [preview, setPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [useHtmlTemplate, setUseHtmlTemplate] = useState(true);

  // Hooks para manejo de plantillas
  const { data: emailTemplates, isLoading: templatesLoading } = useEmailTemplates();
  const processTemplate = useProcessEmailTemplate();
  const saveEmailLog = useSaveEmailLog();

  // Función para preparar variables para plantillas
  const prepareEmailVariables = (): EmailVariables => {
    const variables: EmailVariables = {
      nombre: recipientName
    };

    if (reservationData) {
      const formattedDate = format(new Date(reservationData.fecha_reserva), 'EEEE, d MMMM yyyy', { locale: es });
      
      // Determinar estado según el tipo de plantilla
      let estadoMostrar = getStatusLabel(reservationData.estado);
      if (selectedTemplateCode === 'confirmacion_reserva') {
        estadoMostrar = 'Confirmada';
      } else if (selectedTemplateCode === 'recordatorio_reserva') {
        estadoMostrar = 'Próxima reserva';
      }
      
      variables.fecha = formattedDate;
      variables.hora = formatReservationTime(reservationData.hora_reserva);
      variables.personas = reservationData.numero_personas.toString();
      variables.estado = estadoMostrar;
      
      // Crear bloque HTML con detalles de reserva - Estilo simple y armonioso
      variables.detalles_reserva = `
<div style="background: white; border-radius: 12px; padding: 24px; margin: 24px 0; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif; border: 1px solid #e5e7eb;">
  <h3 style="color: #237584; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">Detalles de tu reserva</h3>
  
  <div style="background: #f8fafb; border-radius: 8px; padding: 20px; border-left: 3px solid #237584;">
    <div style="display: grid; gap: 12px;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0;">
        <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Fecha</span>
        <span style="color: #374151; font-size: 15px; font-weight: 600;">${formattedDate}</span>
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-top: 1px solid #e5e7eb;">
        <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Hora</span>
        <span style="color: #374151; font-size: 15px; font-weight: 600;">${formatReservationTime(reservationData.hora_reserva)}</span>
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 0; border-top: 1px solid #e5e7eb;">
        <span style="color: #6b7280; font-size: 14px; font-weight: 500;">Comensales</span>
        <span style="color: #374151; font-size: 15px; font-weight: 600;">${reservationData.numero_personas} personas</span>
      </div>
      
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-top: 1px solid #e5e7eb; background: #ecfdf5; margin: 8px -12px -12px -12px; padding-left: 12px; padding-right: 12px; border-radius: 0 0 4px 4px;">
        <span style="color: #065f46; font-size: 14px; font-weight: 500;">Estado</span>
        <span style="color: #047857; font-size: 15px; font-weight: 700;">${estadoMostrar}</span>
      </div>
    </div>
  </div>
</div>
`;

      // Procesar productos si existen
      let menuHtml = '';
      if (reservationData.datos_adicionales) {
        const selecciones = extraerSeleccionesMenu(reservationData.datos_adicionales);
        
        if (selecciones.platos.length > 0 || selecciones.vinos.length > 0) {
          let productosHtml = '';
          
          // Combinar todos los productos en una lista simple y armoniosa
          let productosItems = [];
          
          if (selecciones.platos.length > 0) {
            selecciones.platos.forEach(p => {
              productosItems.push(`${p.quantity} × ${p.name}${p.category_name ? ` (${p.category_name})` : ''}`);
            });
          }
          
          if (selecciones.vinos.length > 0) {
            selecciones.vinos.forEach(v => {
              productosItems.push(`${v.quantity} × ${v.name} - ${v.winery}`);
            });
          }
          
          if (productosItems.length > 0) {
            productosHtml = `
              <div style="background: #f8fafb; border-radius: 8px; padding: 20px; border-left: 3px solid #237584;">
                ${productosItems.map(item => 
                  `<div style="color: #374151; font-size: 15px; line-height: 1.6; margin-bottom: 8px; padding-left: 12px; position: relative;">
                    <span style="position: absolute; left: 0; top: 9px; width: 4px; height: 4px; background: #237584; border-radius: 50%;"></span>
                    ${item}
                  </div>`
                ).join('')}
              </div>`;
          }
          
          menuHtml = `
<div style="background: white; border-radius: 12px; padding: 24px; margin: 24px 0; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif; border: 1px solid #e5e7eb;">
  <h3 style="color: #237584; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">Tu selección</h3>
  ${productosHtml}
</div>
`;
        } else {
          menuHtml = `
<div style="background: white; border-radius: 12px; padding: 24px; margin: 24px 0; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif; border: 1px solid #e5e7eb;">
  <h3 style="color: #237584; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">Tu selección</h3>
  <div style="background: #f9fafb; border-radius: 6px; padding: 16px; text-align: center;">
    <p style="color: #6b7280; margin: 0; font-size: 14px;">No hay productos seleccionados</p>
  </div>
</div>
`;
        }
        
        variables.datos_adicionales = reservationData.datos_adicionales;
      } else {
        menuHtml = `
<div style="background: white; border-radius: 12px; padding: 24px; margin: 24px 0; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04); font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif; border: 1px solid #e5e7eb;">
  <h3 style="color: #237584; margin: 0 0 20px 0; font-size: 18px; font-weight: 600;">Tu selección</h3>
  <div style="background: #f9fafb; border-radius: 6px; padding: 16px; text-align: center;">
    <p style="color: #6b7280; margin: 0; font-size: 14px;">No hay productos seleccionados</p>
  </div>
</div>
`;
      }
      
      variables.menu_selecciones = menuHtml;
      
      // Agregar mensaje de puntualidad moderno
      variables.aviso_puntualidad = `
<div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 28px; margin: 32px 0; box-shadow: 0 4px 20px rgba(251, 191, 36, 0.15); font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif; border: 1px solid rgba(251, 191, 36, 0.2);">
  <div style="display: flex; align-items: center; margin-bottom: 20px;">
    <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-right: 16px;">
      <span style="color: white; font-size: 18px;">⚡</span>
    </div>
    <h3 style="color: #92400e; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: -0.02em;">Información Importante</h3>
  </div>
  
  <div style="display: grid; gap: 16px;">
    <div style="background: rgba(255, 255, 255, 0.7); border-radius: 10px; padding: 16px; border-left: 4px solid #f59e0b;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <div style="width: 6px; height: 6px; background: #f59e0b; border-radius: 50%;"></div>
        <span style="color: #92400e; font-size: 14px; font-weight: 600;">PUNTUALIDAD REQUERIDA</span>
      </div>
      <p style="margin: 0; color: #78350f; font-size: 15px; line-height: 1.5;">Te esperamos a la hora exacta de tu reserva para garantizar la mejor experiencia</p>
    </div>
    
    <div style="background: rgba(255, 255, 255, 0.7); border-radius: 10px; padding: 16px; border-left: 4px solid #dc2626;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <div style="width: 6px; height: 6px; background: #dc2626; border-radius: 50%;"></div>
        <span style="color: #7f1d1d; font-size: 14px; font-weight: 600;">TOLERANCIA MÁXIMA: 15 MINUTOS</span>
      </div>
      <p style="margin: 0; color: #7f1d1d; font-size: 15px; line-height: 1.5;">Nos reservamos el derecho a liberar tu mesa si no te presentas en este tiempo</p>
    </div>
    
    <div style="background: rgba(255, 255, 255, 0.7); border-radius: 10px; padding: 16px; border-left: 4px solid #2563eb;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
        <div style="width: 6px; height: 6px; background: #2563eb; border-radius: 50%;"></div>
        <span style="color: #1e3a8a; font-size: 14px; font-weight: 600;">CAMBIOS O CANCELACIONES</span>
      </div>
      <p style="margin: 0; color: #1e3a8a; font-size: 15px; line-height: 1.5;">Para modificaciones, contáctanos mínimo 2 horas antes de tu reserva</p>
    </div>
  </div>
</div>
`;
    }

    return variables;
  };

  // Función para procesar plantilla HTML o texto
  const processCurrentTemplate = async () => {
    if (!useHtmlTemplate || !selectedTemplateCode) {
      return;
    }

    try {
      const variables = prepareEmailVariables();
      
      const result = await processTemplate.mutateAsync({
        templateCode: selectedTemplateCode,
        variables,
        reservationData
      });

      setSubject(result.subject);
      setHtmlContent(result.htmlContent);
      setBody(result.textContent); // Fallback text version
    } catch (error) {
      console.error('Error processing template:', error);
      toast.error('Error al procesar la plantilla');
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'confirmada': 'Confirmada',
      'pendiente': 'Pendiente de confirmación',
      'sentada': 'Cliente en mesa',
      'completada': 'Servicio completado',
      'cancelada': 'Cancelada',
      'no_show': 'No presentado'
    };
    return labels[status] || status;
  };

  // Procesar plantilla cuando cambia la selección o los datos
  useEffect(() => {
    if (useHtmlTemplate && selectedTemplateCode && emailTemplates) {
      processCurrentTemplate();
    }
  }, [selectedTemplateCode, recipientName, reservationData, useHtmlTemplate]);

  // Mapeo inteligente de template a alias
  const getAliasForTemplate = (templateCode: string) => {
    const templateToAlias = {
      'confirmacion_reserva': 'hola',    // Confirmaciones cálidas
      'recordatorio_reserva': 'noreply', // Recordatorios automáticos  
      'mensaje_personalizado': 'hola',   // Personalizado cálido por defecto
      'comunicacion_general': 'info',    // Información general
      'cancelacion_reserva': 'hola'      // Cancelaciones con tono cálido
    };
    return templateToAlias[templateCode] || 'hola';
  };

  const getTemplateIcon = (templateCode: string) => {
    const templateIcons = {
      'confirmacion_reserva': FileText,
      'recordatorio_reserva': Clock,
      'cancelacion_reserva': XCircle,
      'mensaje_personalizado': User,
      'comunicacion_general': Building
    };
    return templateIcons[templateCode] || FileText;
  };

  // Reset al abrir el modal
  useEffect(() => {
    if (isOpen) {
      setSelectedTemplateCode('mensaje_personalizado');
      setSelectedAlias('hola');
      setPreview(false);
      setIsSending(false);
      setUseHtmlTemplate(true);
      setHtmlContent('');
    }
  }, [isOpen]);

  // Auto-seleccionar alias según template
  useEffect(() => {
    const suggestedAlias = getAliasForTemplate(selectedTemplateCode);
    setSelectedAlias(suggestedAlias);
  }, [selectedTemplateCode]);

  const handleSend = async () => {
    if (!subject.trim() || (!body.trim() && !htmlContent.trim())) {
      toast.error('Por favor completa el asunto y el mensaje');
      return;
    }

    setIsSending(true);
    
    try {
      const currentAlias = emailAliases.find(a => a.key === selectedAlias);
      const contentToSend = useHtmlTemplate && htmlContent ? htmlContent : body;
      
      console.log('🚀 Iniciando envío de email...', {
        to: recipientEmail,
        subject: subject,
        contentType: useHtmlTemplate ? 'HTML' : 'text',
        contentLength: contentToSend.length,
        reservationId: reservationData?.id,
        fromAlias: selectedAlias,
        templateCode: selectedTemplateCode
      });

      // Enviar email via Edge Function
      const { data, error } = await supabase.functions.invoke('send_smtp_email', {
        body: {
          to: recipientEmail,
          subject: subject,
          body: contentToSend,
          isHtml: useHtmlTemplate,
          reservationId: reservationData?.id,
          fromAlias: selectedAlias,
          templateCode: selectedTemplateCode
        }
      });

      if (error) {
        throw new Error(`Error de envío: ${error.message}`);
      }

      if (!data?.success) {
        throw new Error(`Error en el envío: ${data?.error || 'Error desconocido'}`);
      }

      // Guardar log del email en la base de datos
      await saveEmailLog.mutateAsync({
        to: recipientEmail,
        subject: subject,
        htmlContent: useHtmlTemplate ? htmlContent : '',
        textContent: body,
        templateCode: selectedTemplateCode,
        reservationId: reservationData?.id,
        fromAlias: selectedAlias
      });

      console.log('✅ Email enviado y registrado exitosamente');
      
      toast.success('Email enviado correctamente', {
        description: `Mensaje enviado a ${recipientName} desde ${currentAlias?.name || 'Enigma'}`
      });
      
      onClose();
      
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      
      // Manejo específico de tipos de error
      let errorTitle = 'Error al enviar el email';
      let errorDescription = error.message || 'Por favor inténtalo de nuevo';
      
      if (error.message?.includes('Rate limit')) {
        errorTitle = 'Demasiados emails';
        errorDescription = 'Espera un momento antes de enviar otro email';
      } else if (error.message?.includes('Formato de email')) {
        errorTitle = 'Email inválido';
        errorDescription = 'Verifica que el email esté correctamente escrito';
      } else if (error.message?.includes('empleados activos')) {
        errorTitle = 'Sin autorización';
        errorDescription = 'Solo empleados activos pueden enviar emails';
      } else if (error.message?.includes('demasiado largo')) {
        errorTitle = 'Contenido muy largo';
        errorDescription = error.message;
      } else if (error.message?.includes('Edge Function')) {
        errorTitle = 'Error del servidor';
        errorDescription = 'Problema con el sistema de envío, inténtalo más tarde';
      }
      
      toast.error(errorTitle, {
        description: errorDescription
      });
    } finally {
      setIsSending(false);
    }
  };

  const previewContent = useHtmlTemplate && htmlContent ? htmlContent : `
Para: ${recipientEmail}
Asunto: ${subject}

${body}
  `.trim();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl h-[95vh] max-h-[800px] overflow-hidden bg-white">
        <DialogHeader className="border-b border-enigma-neutral-200 pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-enigma-primary/10 rounded-ios flex items-center justify-center">
              <Mail className="w-5 h-5 text-enigma-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-enigma-neutral-900">Enviar Email</h2>
              <p className="text-xs sm:text-sm text-enigma-neutral-600 truncate">
                Para: {recipientName} ({recipientEmail})
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {!preview ? (
            <div className="flex-1 overflow-hidden">
              {/* Layout móvil: Stack vertical */}
              <div className="flex flex-col h-full lg:hidden">
                {/* Selector de plantillas móvil */}
                <div className="flex-shrink-0 mb-4">
                  <IOSButton
                    variant="outline"
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="w-full justify-between"
                    disabled={templatesLoading}
                  >
                    <span>
                      {templatesLoading 
                        ? 'Cargando plantillas...'
                        : emailTemplates?.find(t => t.codigo === selectedTemplateCode)?.nombre || 'Seleccionar plantilla'
                      }
                    </span>
                    {showTemplates ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </IOSButton>
                  
                  {showTemplates && emailTemplates && (
                    <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                      {emailTemplates.map((template) => {
                        const Icon = getTemplateIcon(template.codigo);
                        return (
                          <IOSCard 
                            key={template.id}
                            className={`cursor-pointer transition-all duration-200 ${
                              selectedTemplateCode === template.codigo 
                                ? 'border-enigma-primary bg-enigma-primary/5' 
                                : 'hover:border-enigma-neutral-300'
                            }`}
                            onClick={() => {
                              setSelectedTemplateCode(template.codigo);
                              setShowTemplates(false);
                            }}
                          >
                            <IOSCardContent className="p-3">
                              <div className="flex items-center gap-3">
                                <Icon className="w-4 h-4 text-enigma-primary" />
                                <span className="text-sm font-medium">{template.nombre}</span>
                                <span className="text-xs text-enigma-neutral-500 ml-auto">
                                  {template.categoria}
                                </span>
                              </div>
                            </IOSCardContent>
                          </IOSCard>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Editor móvil */}
                <div className="flex-1 overflow-y-auto space-y-4">
                  {/* Selector de alias móvil */}
                  <div>
                    <Label htmlFor="alias-mobile" className="text-sm font-medium text-enigma-neutral-700">
                      Enviar como
                    </Label>
                    <select
                      id="alias-mobile"
                      value={selectedAlias}
                      onChange={(e) => setSelectedAlias(e.target.value)}
                      className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-enigma-primary focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                    >
                      {emailAliases.map((alias) => (
                        <option key={alias.key} value={alias.key}>
                          {alias.name} ({alias.email})
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-enigma-neutral-500">
                      {emailAliases.find(a => a.key === selectedAlias)?.description}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="subject-mobile" className="text-sm font-medium text-enigma-neutral-700">
                      Asunto
                    </Label>
                    <Input
                      id="subject-mobile"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Asunto del email"
                      className="mt-1"
                    />
                  </div>

                  <div className="flex-1">
                    <Label htmlFor="body-mobile" className="text-sm font-medium text-enigma-neutral-700">
                      Mensaje
                    </Label>
                    <Textarea
                      id="body-mobile"
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Escribe tu mensaje aquí..."
                      className="mt-1 min-h-[200px] sm:min-h-[250px] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Layout desktop: Grid de 3 columnas */}
              <div className="hidden lg:grid lg:grid-cols-3 gap-6 h-full">
                {/* Plantillas desktop */}
                <div className="space-y-4 overflow-y-auto">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-enigma-neutral-900">Plantillas</h3>
                    {templatesLoading && (
                      <div className="w-4 h-4 border-2 border-enigma-primary/30 border-t-enigma-primary rounded-full animate-spin" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {emailTemplates?.map((template) => {
                      const Icon = getTemplateIcon(template.codigo);
                      return (
                        <IOSCard 
                          key={template.id}
                          className={`cursor-pointer transition-all duration-200 ${
                            selectedTemplateCode === template.codigo 
                              ? 'border-enigma-primary bg-enigma-primary/5' 
                              : 'hover:border-enigma-neutral-300'
                          }`}
                          onClick={() => setSelectedTemplateCode(template.codigo)}
                        >
                          <IOSCardContent className="p-3">
                            <div className="flex items-center gap-3">
                              <Icon className="w-4 h-4 text-enigma-primary" />
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-medium block">{template.nombre}</span>
                                <span className="text-xs text-enigma-neutral-500">{template.categoria}</span>
                              </div>
                            </div>
                          </IOSCardContent>
                        </IOSCard>
                      );
                    })}
                  </div>

                  {/* Toggle HTML/Text */}
                  <div className="pt-4 border-t border-enigma-neutral-200">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={useHtmlTemplate}
                        onChange={(e) => setUseHtmlTemplate(e.target.checked)}
                        className="rounded border-enigma-neutral-300"
                      />
                      <span>Usar plantillas HTML</span>
                    </label>
                  </div>
                </div>

                {/* Editor desktop */}
                <div className="lg:col-span-2 space-y-4 overflow-y-auto">
                  <div className="space-y-3">
                    {/* Selector de alias desktop */}
                    <div>
                      <Label htmlFor="alias-desktop" className="text-sm font-medium text-enigma-neutral-700">
                        Enviar como
                      </Label>
                      <select
                        id="alias-desktop"
                        value={selectedAlias}
                        onChange={(e) => setSelectedAlias(e.target.value)}
                        className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-enigma-primary focus:outline-none focus:ring-1 focus:ring-enigma-primary"
                      >
                        {emailAliases.map((alias) => (
                          <option key={alias.key} value={alias.key}>
                            {alias.name} ({alias.email})
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-enigma-neutral-500">
                        {emailAliases.find(a => a.key === selectedAlias)?.description}
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="subject-desktop" className="text-sm font-medium text-enigma-neutral-700">
                        Asunto
                      </Label>
                      <Input
                        id="subject-desktop"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Asunto del email"
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="body-desktop" className="text-sm font-medium text-enigma-neutral-700">
                        Mensaje
                      </Label>
                      <Textarea
                        id="body-desktop"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Escribe tu mensaje aquí..."
                        className="mt-1 min-h-[300px] resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Vista Preview */
            <div className="flex-1 overflow-y-auto">
              <div className="bg-enigma-neutral-50 rounded-ios p-2 sm:p-4 h-full">
                {useHtmlTemplate && htmlContent ? (
                  /* Preview HTML */
                  <div className="bg-white rounded-ios border max-w-2xl mx-auto shadow-lg">
                    <div className="border-b bg-gray-50 p-3 rounded-t-ios">
                      <p className="text-xs text-enigma-neutral-600">
                        <strong>De:</strong> {emailAliases.find(a => a.key === selectedAlias)?.name} ({emailAliases.find(a => a.key === selectedAlias)?.email})
                      </p>
                      <p className="text-xs text-enigma-neutral-600"><strong>Para:</strong> {recipientEmail}</p>
                      <p className="text-xs text-enigma-neutral-600"><strong>Asunto:</strong> {subject}</p>
                      <p className="text-xs text-enigma-neutral-500 mt-1">
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">HTML</span>
                      </p>
                    </div>
                    <div 
                      className="email-preview-content"
                      dangerouslySetInnerHTML={{ __html: htmlContent }}
                      style={{
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
                      }}
                    />
                  </div>
                ) : (
                  /* Preview Texto */
                  <div className="bg-white rounded-ios border p-3 sm:p-6 max-w-2xl mx-auto">
                    <div className="border-b pb-4 mb-6">
                      <p className="text-xs sm:text-sm text-enigma-neutral-600">
                        <strong>De:</strong> {emailAliases.find(a => a.key === selectedAlias)?.name} ({emailAliases.find(a => a.key === selectedAlias)?.email})
                      </p>
                      <p className="text-xs sm:text-sm text-enigma-neutral-600"><strong>Para:</strong> {recipientEmail}</p>
                      <p className="text-xs sm:text-sm text-enigma-neutral-600"><strong>Asunto:</strong> {subject}</p>
                      <p className="text-xs text-enigma-neutral-500 mt-1">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">TEXTO</span>
                      </p>
                    </div>
                    <div className="whitespace-pre-wrap text-enigma-neutral-800 leading-relaxed text-sm sm:text-base">
                      {body}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="border-t border-enigma-neutral-200 pt-4 flex-shrink-0">
          {/* Info de reserva */}
          {reservationData && (
            <div className="mb-3 lg:mb-0">
              <p className="text-xs text-enigma-neutral-500">
                Reserva #{reservationData.id} • {format(new Date(reservationData.fecha_reserva), 'd MMM yyyy', { locale: es })}
              </p>
            </div>
          )}
          
          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto lg:ml-auto">
            <div className="flex gap-2 sm:gap-3">
              <IOSButton
                variant="ghost"
                onClick={onClose}
                disabled={isSending}
                className="flex-1 sm:flex-none min-h-[44px]"
              >
                Cancelar
              </IOSButton>
              
              <IOSButton
                variant="outline"
                onClick={() => setPreview(!preview)}
                disabled={isSending}
                className="flex-1 sm:flex-none min-h-[44px]"
              >
                {preview ? 'Editar' : 'Preview'}
              </IOSButton>
            </div>
            
            <IOSButton
              variant="primary"
              onClick={handleSend}
              disabled={isSending || !subject.trim() || (!body.trim() && !htmlContent.trim())}
              className="bg-enigma-primary hover:bg-enigma-primary/90 min-h-[44px] text-white font-medium"
            >
              {isSending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Email
                </>
              )}
            </IOSButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}