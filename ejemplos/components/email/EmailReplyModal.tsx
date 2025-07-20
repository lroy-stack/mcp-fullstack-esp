import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CustomDialogContent } from '@/features/email/components/CustomDialogContent';
import { IOSButton } from '@/components/ui/ios-button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  Send, X, Reply, Clock, User, Mail, 
  Loader2, AlertCircle, Check 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import EmailInputWithAutocomplete from './EmailInputWithAutocomplete';
import type { EmailItem } from '@/features/email/components/AppleMailList';
import UnifiedEmailService from '@/features/email/services/unifiedEmailService';

interface EmailReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalEmail: EmailItem | null;
  mode?: 'reply' | 'reply-all';
}

export default function EmailReplyModal({
  isOpen,
  onClose,
  originalEmail,
  mode = 'reply'
}: EmailReplyModalProps) {
  const { toast } = useToast();
  
  // Estados del formulario
  const [recipients, setRecipients] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Inicializar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen && originalEmail) {
      // Configurar destinatarios según el modo
      if (mode === 'reply') {
        setRecipients([originalEmail.from.email]);
      } else if (mode === 'reply-all') {
        const allRecipients = [
          originalEmail.from.email,
          ...originalEmail.to.filter(email => email !== originalEmail.from.email),
          ...(originalEmail.cc || [])
        ];
        // Remover duplicados
        setRecipients([...new Set(allRecipients)]);
      }

      // Configurar asunto
      const subjectPrefix = originalEmail.subject.startsWith('Re:') ? '' : 'Re: ';
      setSubject(subjectPrefix + originalEmail.subject);

      // Configurar contenido con cita del email original
      const originalDate = format(originalEmail.date, "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
      const quotedContent = `



--------- Mensaje original ---------
De: ${originalEmail.from.name} <${originalEmail.from.email}>
Fecha: ${originalDate}
Para: ${originalEmail.to.join(', ')}
Asunto: ${originalEmail.subject}

${getEmailTextContent(originalEmail)}
`;
      setContent(quotedContent);
    }
  }, [isOpen, originalEmail, mode]);

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

  // Enviar respuesta
  const handleSend = async () => {
    if (!originalEmail || recipients.length === 0 || !subject.trim() || !content.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);

    try {
      console.log('📧 Enviando respuesta:', {
        mode,
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
        // Threading metadata RFC 5322 para mantener conversación
        inReplyTo: originalEmail.messageId || `<${originalEmail.id}@enigmaconalma.com>`,
        references: originalEmail.references 
          ? `${originalEmail.references} <${originalEmail.id}@enigmaconalma.com>`
          : `<${originalEmail.id}@enigmaconalma.com>`,
        replyType: mode
      });

      toast({
        title: "Respuesta enviada",
        description: `Tu respuesta ha sido enviada a ${recipients.length} destinatario${recipients.length !== 1 ? 's' : ''}`,
        variant: "default"
      });

      handleClose();

    } catch (error) {
      console.error('❌ Error enviando respuesta:', error);
      
      toast({
        title: "Error al enviar",
        description: error instanceof Error ? error.message : "No se pudo enviar la respuesta",
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
              <Reply size={20} className="text-enigma-primary" />
              <DialogTitle className="text-lg">
                {mode === 'reply' ? 'Responder' : 'Responder a todos'}
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
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-enigma-primary to-enigma-primary/80 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {originalEmail.from.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    &lt;{originalEmail.from.email}&gt;
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {format(originalEmail.date, "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {originalEmail.subject}
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de respuesta */}
          <div className="space-y-4">
            {/* Destinatarios */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Para:
              </label>
              <EmailInputWithAutocomplete
                value={recipients}
                onChange={setRecipients}
                placeholder="Añadir destinatarios..."
                multiple={true}
                maxRecipients={20}
                disabled={isSending}
              />
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

            {/* Contenido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mensaje:
              </label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escribe tu respuesta aquí..."
                disabled={isSending}
                className="min-h-[300px] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer con acciones */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            {mode === 'reply' ? 'Respondiendo a' : 'Respondiendo a todos los destinatarios de'}: {originalEmail.from.name}
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
              disabled={isSending || recipients.length === 0 || !subject.trim() || !content.trim()}
              style={{ backgroundColor: '#237584' }}
            >
              {isSending ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={16} className="mr-2" />
                  Enviar respuesta
                </>
              )}
            </IOSButton>
          </div>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}