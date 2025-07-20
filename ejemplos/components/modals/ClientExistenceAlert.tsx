import React from 'react';
import { IOSButton } from '@/components/ui/ios-button';
import { IOSBadge } from '@/components/ui/ios-badge';
import { 
  AlertTriangle, 
  User, 
  Mail, 
  Phone, 
  Crown, 
  RefreshCw, 
  UserPlus, 
  X,
  Info
} from 'lucide-react';
import { ClientExistenceResult, clientExistenceUtils } from '@/hooks/useClientExistenceCheck';
import { Cliente } from '@/types/database';
import { cn } from '@/lib/utils';

interface ClientExistenceAlertProps {
  result: ClientExistenceResult;
  onSelectUpdate: (client: Cliente) => void;
  onSelectCreateNew: () => void;
  onResolveConflict: (emailClient: Cliente, phoneClient: Cliente) => void;
  onDismiss?: () => void;
  className?: string;
}

export function ClientExistenceAlert({
  result,
  onSelectUpdate,
  onSelectCreateNew,
  onResolveConflict,
  onDismiss,
  className
}: ClientExistenceAlertProps) {
  // No mostrar si no hay coincidencias
  if (!clientExistenceUtils.shouldShowAlert(result)) {
    return null;
  }

  const severity = clientExistenceUtils.getConflictSeverity(result);
  const message = clientExistenceUtils.getConflictMessage(result);

  // Renderizar según el tipo de conflicto
  switch (result.conflictType) {
    case 'email':
    case 'phone':
    case 'both':
      return (
        <SimpleClientAlert
          client={result.existingClient!}
          conflictType={result.conflictType}
          message={message}
          onSelectUpdate={() => onSelectUpdate(result.existingClient!)}
          onSelectCreateNew={onSelectCreateNew}
          onDismiss={onDismiss}
          className={className}
        />
      );

    case 'conflict':
      return (
        <ConflictAlert
          emailClient={result.emailMatch!}
          phoneClient={result.phoneMatch!}
          message={message}
          onResolveConflict={() => onResolveConflict(result.emailMatch!, result.phoneMatch!)}
          onSelectCreateNew={onSelectCreateNew}
          onDismiss={onDismiss}
          className={className}
        />
      );

    default:
      return null;
  }
}

interface SimpleClientAlertProps {
  client: Cliente;
  conflictType: 'email' | 'phone' | 'both';
  message: string;
  onSelectUpdate: () => void;
  onSelectCreateNew: () => void;
  onDismiss?: () => void;
  className?: string;
}

function SimpleClientAlert({
  client,
  conflictType,
  message,
  onSelectUpdate,
  onSelectCreateNew,
  onDismiss,
  className
}: SimpleClientAlertProps) {
  const getIcon = () => {
    switch (conflictType) {
      case 'email': return <Mail className="h-5 w-5" />;
      case 'phone': return <Phone className="h-5 w-5" />;
      case 'both': return <User className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getColor = () => {
    return 'border-enigma-secondary bg-enigma-secondary/10';
  };

  return (
    <div className={cn(getColor(), 'border-l-4 p-4 rounded-ios', className)}>
      <div className="flex items-start gap-3">
        <div className="bg-enigma-secondary/20 p-2 rounded-ios mt-1">
          {getIcon()}
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="ios-text-callout font-semibold text-enigma-neutral-900 mb-1">
              Cliente Existente Encontrado
            </h4>
            <p className="ios-text-caption1 text-enigma-neutral-700">
              {message}
            </p>
          </div>

          {/* Información del Cliente */}
          <div className="bg-white/60 p-3 rounded-ios border border-enigma-neutral-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-enigma-neutral-600" />
                <span className="ios-text-callout font-medium text-enigma-neutral-900">
                  {client.nombre} {client.apellidos}
                </span>
                {client.es_vip && (
                  <IOSBadge variant="gold" size="sm">
                    <Crown className="h-3 w-3 mr-1" />
                    VIP
                  </IOSBadge>
                )}
              </div>
            </div>
            
            <div className="space-y-1 text-enigma-neutral-600">
              {client.email && (
                <div className="flex items-center gap-2 ios-text-caption1">
                  <Mail className="h-3 w-3" />
                  <span>{client.email}</span>
                </div>
              )}
              {client.telefono && (
                <div className="flex items-center gap-2 ios-text-caption1">
                  <Phone className="h-3 w-3" />
                  <span>{client.telefono}</span>
                </div>
              )}
              {client.empresa && (
                <div className="ios-text-caption1">
                  <span className="text-enigma-neutral-500">Empresa:</span> {client.empresa}
                </div>
              )}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-2">
            <IOSButton
              variant="primary"
              size="sm"
              onClick={onSelectUpdate}
              className="flex-1 bg-enigma-secondary hover:bg-enigma-secondary/90"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar Este Cliente
            </IOSButton>
            
            <IOSButton
              variant="outline"
              size="sm"
              onClick={onSelectCreateNew}
              className="flex-1 border-enigma-neutral-300 text-enigma-neutral-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Crear Cliente Nuevo
            </IOSButton>
          </div>
        </div>

        {onDismiss && (
          <IOSButton
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-enigma-neutral-500 hover:text-enigma-neutral-700 mt-1"
          >
            <X className="h-4 w-4" />
          </IOSButton>
        )}
      </div>
    </div>
  );
}

interface ConflictAlertProps {
  emailClient: Cliente;
  phoneClient: Cliente;
  message: string;
  onResolveConflict: () => void;
  onSelectCreateNew: () => void;
  onDismiss?: () => void;
  className?: string;
}

function ConflictAlert({
  emailClient,
  phoneClient,
  message,
  onResolveConflict,
  onSelectCreateNew,
  onDismiss,
  className
}: ConflictAlertProps) {
  return (
    <div className={cn('border-enigma-accent bg-enigma-accent/10 border-l-4 p-4 rounded-ios', className)}>
      <div className="flex items-start gap-3">
        <div className="bg-enigma-accent/20 p-2 rounded-ios mt-1">
          <AlertTriangle className="h-5 w-5 text-enigma-accent" />
        </div>
        
        <div className="flex-1 space-y-3">
          <div>
            <h4 className="ios-text-callout font-semibold text-enigma-accent mb-1">
              Conflicto Detectado
            </h4>
            <p className="ios-text-caption1 text-enigma-neutral-700">
              {message}
            </p>
          </div>

          {/* Comparación de Clientes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Cliente por Email */}
            <div className="bg-white/60 p-3 rounded-ios border border-enigma-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4 text-enigma-accent" />
                <span className="ios-text-caption1 font-medium text-enigma-accent">
                  Cliente por Email
                </span>
              </div>
              <div className="space-y-1">
                <div className="ios-text-callout font-medium text-enigma-neutral-900">
                  {emailClient.nombre} {emailClient.apellidos}
                </div>
                <div className="ios-text-caption1 text-enigma-neutral-600">
                  {emailClient.email}
                </div>
                {emailClient.telefono && (
                  <div className="ios-text-caption1 text-enigma-neutral-600">
                    Tel: {emailClient.telefono}
                  </div>
                )}
              </div>
            </div>

            {/* Cliente por Teléfono */}
            <div className="bg-white/60 p-3 rounded-ios border border-enigma-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4 text-enigma-accent" />
                <span className="ios-text-caption1 font-medium text-enigma-accent">
                  Cliente por Teléfono
                </span>
              </div>
              <div className="space-y-1">
                <div className="ios-text-callout font-medium text-enigma-neutral-900">
                  {phoneClient.nombre} {phoneClient.apellidos}
                </div>
                {phoneClient.email && (
                  <div className="ios-text-caption1 text-enigma-neutral-600">
                    {phoneClient.email}
                  </div>
                )}
                <div className="ios-text-caption1 text-enigma-neutral-600">
                  Tel: {phoneClient.telefono}
                </div>
              </div>
            </div>
          </div>

          {/* Botones de Resolución */}
          <div className="flex flex-col sm:flex-row gap-2">
            <IOSButton
              variant="primary"
              size="sm"
              onClick={onResolveConflict}
              className="flex-1 bg-enigma-accent hover:bg-enigma-accent/90"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Resolver Conflicto
            </IOSButton>
            
            <IOSButton
              variant="outline"
              size="sm"
              onClick={onSelectCreateNew}
              className="flex-1 border-enigma-accent text-enigma-accent"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Crear Cliente Nuevo
            </IOSButton>
          </div>
        </div>

        {onDismiss && (
          <IOSButton
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-enigma-neutral-500 hover:text-enigma-neutral-700 mt-1"
          >
            <X className="h-4 w-4" />
          </IOSButton>
        )}
      </div>
    </div>
  );
}