import React from 'react';
import { Phone, MessageSquare, User, Crown, Mail } from 'lucide-react';
import { TouchOptimizedCTA } from '@/components/ui/touch-optimized-cta';
import { IOSBadge } from '@/components/ui/ios-badge';
import { cn } from '@/lib/utils';

interface ClientContactPanelProps {
  client?: {
    id: number;
    nombre: string;
    apellidos?: string;
    telefono?: string;
    email?: string;
    es_vip?: boolean;
  };
  onCall?: () => void;
  onMessage?: () => void;
  onEmail?: () => void;
  onViewClient?: () => void;
  className?: string;
}

export const ClientContactPanel: React.FC<ClientContactPanelProps> = ({
  client,
  onCall,
  onMessage,
  onEmail,
  onViewClient,
  className
}) => {
  if (!client) {
    return (
      <div className={cn("p-6 bg-enigma-neutral-50 rounded-xl border border-enigma-neutral-200", className)}>
        <div className="text-center">
          <div className="w-16 h-16 bg-enigma-neutral-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={24} className="text-enigma-neutral-500" />
          </div>
          <p className="text-enigma-neutral-600 ios-text-subhead">
            Cliente no disponible
          </p>
        </div>
      </div>
    );
  }

  const fullName = `${client.nombre} ${client.apellidos || ''}`.trim();
  const initials = client.nombre.charAt(0) + (client.apellidos?.charAt(0) || '');

  return (
    <div className={cn("p-6 bg-white shadow-sm", className)}>
      {/* Client Avatar & Info */}
      <div className="flex items-start gap-4 mb-6">
        <div className="relative flex-shrink-0">
          <div 
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg",
              client.es_vip 
                ? "bg-gradient-to-br from-amber-400 to-amber-600" 
                : "bg-gradient-to-br from-enigma-primary to-enigma-primary/80"
            )}
          >
            {client.es_vip ? (
              <Crown size={24} />
            ) : (
              <span>{initials}</span>
            )}
          </div>
          
          {client.es_vip && (
            <div className="absolute -top-1 -right-1">
              <IOSBadge variant="secondary" className="bg-amber-100 text-amber-800 text-xs px-2 py-1">
                VIP
              </IOSBadge>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="ios-text-title3 font-semibold text-enigma-neutral-900 truncate mb-1">
            {fullName}
          </h3>
          
          {/* Contact Info */}
          <div className="space-y-1">
            {client.telefono && (
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-enigma-neutral-500 flex-shrink-0" />
                <span className="ios-text-footnote text-enigma-neutral-600 font-medium">
                  {client.telefono}
                </span>
              </div>
            )}
            
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-enigma-neutral-500 flex-shrink-0" />
                <span className="ios-text-footnote text-enigma-neutral-600 truncate">
                  {client.email}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Phone and WhatsApp buttons */}
        {client.telefono && (
          <div className="grid grid-cols-2 gap-3">
            <TouchOptimizedCTA
              variant="outline"
              size="md"
              icon={Phone}
              iconPosition="left"
              onClick={onCall}
              className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 ios-text-footnote font-medium transition-colors"
            >
              Llamar
            </TouchOptimizedCTA>
            
            <TouchOptimizedCTA
              variant="outline"
              size="md"
              icon={MessageSquare}
              iconPosition="left"
              onClick={onMessage}
              className="border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400 ios-text-footnote font-medium transition-colors"
            >
              WhatsApp
            </TouchOptimizedCTA>
          </div>
        )}
        
        {/* Email button */}
        {client.email && (
          <TouchOptimizedCTA
            variant="outline"
            size="md"
            icon={Mail}
            iconPosition="left"
            onClick={onEmail}
            className="w-full border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 ios-text-footnote font-medium transition-colors"
          >
            Enviar Email
          </TouchOptimizedCTA>
        )}
        
        <TouchOptimizedCTA
          variant="ghost"
          size="md"
          icon={User}
          iconPosition="left"
          onClick={onViewClient}
          className="w-full text-enigma-primary hover:bg-enigma-primary/5 ios-text-footnote font-medium"
        >
          Ver Perfil del Cliente
        </TouchOptimizedCTA>
      </div>

      {/* VIP Client Special Info */}
      {client.es_vip && (
        <div className="mt-4 p-3 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2">
            <Crown size={16} className="text-amber-600" />
            <span className="ios-text-caption1 font-semibold text-amber-800">
              Cliente VIP
            </span>
          </div>
          <p className="ios-text-caption2 text-amber-700 mt-1">
            Servicio especial y atención prioritaria
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientContactPanel;