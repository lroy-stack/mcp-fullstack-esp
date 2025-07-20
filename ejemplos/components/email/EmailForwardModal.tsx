import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CustomDialogContent } from '@/features/email/components/CustomDialogContent';
import { IOSButton } from '@/components/ui/ios-button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Send, X, Forward, Clock, User, Mail, 
  Loader2, AlertCircle, FileText 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import EmailInputWithAutocomplete from './EmailInputWithAutocomplete';
import type { EmailItem } from '@/features/email/components/AppleMailList';
import UnifiedEmailService from '@/features/email/services/unifiedEmailService';

interface EmailForwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalEmail: EmailItem | null;
}

export default function EmailForwardModal({
  isOpen,
  onClose,
  originalEmail
}: EmailForwardModalProps) {
  const { toast } = useToast();
  
  // Estados del formulario
  const [recipients, setRecipients] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Inicializar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && originalEmail) {
      // Limpiar destinatarios (usuario debe elegir)
      setRecipients([]);

      // Configurar asunto con prefijo Fwd:
      const subjectPrefix = originalEmail.subject.startsWith('Fwd:') ? '' : 'Fwd: ';
      setSubject(subjectPrefix + originalEmail.subject);

      // Configurar contenido con mensaje completo reenviado
      const originalDate = format(originalEmail.date, "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
      const forwardedContent = `


---------- Mensaje reenviado ----------
De: ${originalEmail.from.name} <${originalEmail.from.email}>
Fecha: ${originalDate}
Para: ${originalEmail.to.join(', ')}
${originalEmail.cc && originalEmail.cc.length > 0 ? `CC: ${originalEmail.cc.join(', ')}\n` : ''}Asunto: ${originalEmail.subject}

${getEmailTextContent(originalEmail)}
---------- Fin del mensaje reenviado ----------
`;
      setContent(forwardedContent);
    }
  }, [isOpen, originalEmail]);

  // Función auxiliar para extraer contenido de texto del email
  const getEmailTextContent = (email: EmailItem): string => {
    // Aquí deberías obtener el contenido real del email
    // Por ahora usamos un placeholder
    return email.preview || 'Contenido del mensaje original...';
  };

  // Limpiar formulario al cerrar
  const handleClose = () => {
    setRecipients([]);
    setSubject('');
    setContent('');
    setIsSending(false);
    onClose();
  };

  // Enviar email reenviado
  const handleSend = async () => {
    if (!originalEmail || recipients.length === 0 || !subject.trim() || !content.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor añade al menos un destinatario y completa el mensaje",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);

    try {
      console.log('📧 Reenviando email:', {
        recipients,
        subject,
        originalEmailId: originalEmail.id
      });

      // Usar UnifiedEmailService para SMTP real con threading metadata
      await UnifiedEmailService.sendEmail({
        destinatarios: recipients,
        asunto: subject,
        contenido: content,
        // Determinar alias apropiado basado en el email original
        fromAlias: 'hola', // TODO: determinar alias dinámicamente
        // Threading metadata RFC 5322 para forwards (opcional, algunos clientes no lo soportan)
        inReplyTo: originalEmail.messageId || `<${originalEmail.id}@enigmaconalma.com>`,
        references: originalEmail.references 
          ? `${originalEmail.references} <${originalEmail.id}@enigmaconalma.com>`
          : `<${originalEmail.id}@enigmaconalma.com>`,
        replyType: 'forward'
      });

      toast({
        title: "Email reenviado",
        description: `El mensaje ha sido reenviado a ${recipients.length} destinatario${recipients.length !== 1 ? 's' : ''}`,
        variant: "default"
      });

      handleClose();

    } catch (error) {
      console.error('❌ Error reenviando email:', error);
      
      toast({
        title: "Error al reenviar",
        description: error instanceof Error ? error.message : "No se pudo reenviar el mensaje",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  if (!originalEmail) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <CustomDialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Forward size={20} className="text-enigma-primary" />
              <DialogTitle className="text-lg">
                Reenviar mensaje
              </DialogTitle>
            </div>
            <IOSButton
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isSending}
            >
              <X size={18} />
            </IOSButton>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Email original info */}
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <FileText size={16} className="text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-blue-700 font-medium mb-1">
                  Reenviando mensaje de:
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {originalEmail.from.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    &lt;{originalEmail.from.email}&gt;
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  Enviado el {format(originalEmail.date, "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {originalEmail.subject}
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de reenvío */}
          <div className="space-y-4">
            {/* Destinatarios */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Para: *
              </label>
              <EmailInputWithAutocomplete
                value={recipients}
                onChange={setRecipients}
                placeholder="Selecciona destinatarios para reenviar..."
                multiple={true}
                maxRecipients={20}
                disabled={isSending}
              />
              <p className="text-xs text-gray-500 mt-1">
                Selecciona a quién quieres reenviar este mensaje
              </p>
            </div>

            {/* Asunto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Asunto:
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Asunto del mensaje..."
                disabled={isSending}
                className="w-full"
              />
            </div>

            {/* Mensaje personal (opcional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje personal (opcional):
              </label>
              <Textarea
                value={content.split('---------- Mensaje reenviado ----------')[0]}
                onChange={(e) => {
                  const personalMessage = e.target.value;
                  const forwardedPart = content.split('---------- Mensaje reenviado ----------')[1] || '';
                  setContent(personalMessage + (forwardedPart ? '---------- Mensaje reenviado ----------' + forwardedPart : ''));
                }}
                placeholder="Añade un mensaje personal antes del contenido reenviado..."
                disabled={isSending}
                className="min-h-[100px] resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Opcional: añade un comentario personal antes del mensaje original
              </p>
            </div>

            {/* Vista previa del contenido reenviado (solo lectura) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contenido que se reenviará:
              </label>
              <div className="bg-gray-50 border rounded-lg p-3 max-h-[200px] overflow-y-auto">
                <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans">
                  {content.split('---------- Mensaje reenviado ----------')[1] || 'Contenido del mensaje original...'}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            Reenviando mensaje de: {originalEmail.from.name}
          </div>
          
          <div className="flex gap-2">
            <IOSButton
              variant="outline"
              onClick={handleClose}
              disabled={isSending}
            >
              Cancelar
            </IOSButton>
            
            <IOSButton
              variant="primary"
              onClick={handleSend}
              disabled={isSending || recipients.length === 0 || !subject.trim()}
              style={{ backgroundColor: '#237584' }}
            >
              {isSending ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Reenviando...
                </>
              ) : (
                <>
                  <Forward size={16} className="mr-2" />
                  Reenviar mensaje
                </>
              )}
            </IOSButton>
          </div>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}