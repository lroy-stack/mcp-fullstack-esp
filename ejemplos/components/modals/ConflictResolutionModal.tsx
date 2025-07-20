import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  ArrowLeftRight,
  Check,
  X
} from 'lucide-react';
import { Cliente } from '@/types/database';
import { useMergeConflictingClients } from '@/hooks/useClientDetail';
import { cn } from '@/lib/utils';

interface ConflictResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailClient: Cliente;
  phoneClient: Cliente;
  onResolved: (resolvedClient: Cliente) => void;
  onCreateNew: () => void;
}

type ResolutionOption = 'keep-email' | 'keep-phone' | 'merge' | 'create-new';

export function ConflictResolutionModal({
  isOpen,
  onClose,
  emailClient,
  phoneClient,
  onResolved,
  onCreateNew
}: ConflictResolutionModalProps) {
  const [selectedOption, setSelectedOption] = useState<ResolutionOption | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  
  const mergeClients = useMergeConflictingClients();

  const handleResolution = async () => {
    if (!selectedOption) return;

    setIsResolving(true);

    try {
      switch (selectedOption) {
        case 'keep-email':
          // Mantener el cliente del email, actualizar su teléfono
          onResolved(emailClient);
          break;

        case 'keep-phone':
          // Mantener el cliente del teléfono, actualizar su email
          onResolved(phoneClient);
          break;

        case 'merge':
          // Fusionar ambos clientes
          const mergedData = createMergedClientData(emailClient, phoneClient);
          const mergedClient = await mergeClients.mutateAsync({
            primaryClientId: emailClient.id, // Email client como primario
            secondaryClientId: phoneClient.id,
            mergedData
          });
          onResolved(mergedClient);
          break;

        case 'create-new':
          onCreateNew();
          break;
      }
      
      onClose();
    } catch (error) {
      console.error('Error resolving conflict:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const createMergedClientData = (client1: Cliente, client2: Cliente): Partial<Cliente> => {
    return {
      // Información personal - priorizar cliente más reciente o con más datos
      nombre: client1.nombre || client2.nombre,
      apellidos: client1.apellidos || client2.apellidos,
      email: client1.email || client2.email,
      telefono: client1.telefono || client2.telefono,
      telefono_alternativo: client2.telefono || client1.telefono_alternativo,
      
      // Fecha de nacimiento - tomar la más reciente si difieren
      fecha_nacimiento: client1.fecha_nacimiento || client2.fecha_nacimiento,
      
      // Información de contacto - combinar
      direccion: client1.direccion || client2.direccion,
      ciudad: client1.ciudad || client2.ciudad,
      codigo_postal: client1.codigo_postal || client2.codigo_postal,
      pais: client1.pais || client2.pais,
      
      // Información comercial
      empresa: client1.empresa || client2.empresa,
      cargo: client1.cargo || client2.cargo,
      
      // Estado VIP - mantener si cualquiera es VIP
      es_vip: client1.es_vip || client2.es_vip,
      
      // Preferencias - combinar
      preferencias_comida: combineTextFields(client1.preferencias_comida, client2.preferencias_comida),
      restricciones_dieteticas: combineTextFields(client1.restricciones_dieteticas, client2.restricciones_dieteticas),
      alergias: combineTextFields(client1.alergias, client2.alergias),
      vinos_preferidos: combineTextFields(client1.vinos_preferidos, client2.vinos_preferidos),
      ocasiones_especiales: combineTextFields(client1.ocasiones_especiales, client2.ocasiones_especiales),
      
      // Configuración de comunicación - ser permisivo
      acepta_marketing: client1.acepta_marketing || client2.acepta_marketing,
      acepta_whatsapp: client1.acepta_whatsapp || client2.acepta_whatsapp,
      acepta_email: client1.acepta_email || client2.acepta_email,
      
      // Idioma preferido
      idioma_preferido: client1.idioma_preferido || client2.idioma_preferido,
      
      // Notas internas - combinar
      notas_internas: combineTextFields(
        client1.notas_internas, 
        client2.notas_internas,
        `\\n\\n--- Fusionado de cliente #${client2.id} ---\\n`
      )
    };
  };

  const combineTextFields = (field1?: string, field2?: string, separator: string = '; '): string => {
    const values = [field1, field2].filter(Boolean);
    return values.length > 0 ? values.join(separator) : '';
  };

  const getClientDisplayInfo = (client: Cliente) => ({
    name: `${client.nombre} ${client.apellidos}`,
    email: client.email,
    phone: client.telefono,
    isVip: client.es_vip,
    company: client.empresa,
    reservations: client.total_reservas || 0
  });

  const emailClientInfo = getClientDisplayInfo(emailClient);
  const phoneClientInfo = getClientDisplayInfo(phoneClient);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-0 border-b border-enigma-accent/20">
          <DialogTitle className="ios-text-title2 font-bold text-enigma-accent flex items-center gap-3">
            <div className="bg-enigma-accent/10 p-2 rounded-ios">
              <AlertTriangle className="h-5 w-5 text-enigma-accent" />
            </div>
            <div>
              <div>Resolver Conflicto de Cliente</div>
              <div className="ios-text-caption1 text-enigma-neutral-600 font-normal">
                El email y teléfono pertenecen a diferentes clientes
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Comparación de Clientes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cliente por Email */}
            <div className="bg-white border-2 border-enigma-primary/20 rounded-ios p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-enigma-primary/10 p-2 rounded-ios">
                  <Mail className="h-4 w-4 text-enigma-primary" />
                </div>
                <div>
                  <h3 className="ios-text-callout font-semibold text-enigma-primary">
                    Cliente por Email
                  </h3>
                  <p className="ios-text-caption1 text-enigma-neutral-600">
                    Cliente #{emailClient.id}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-enigma-neutral-500" />
                  <span className="ios-text-callout font-medium">{emailClientInfo.name}</span>
                  {emailClientInfo.isVip && (
                    <IOSBadge variant="gold" size="sm">
                      <Crown className="h-3 w-3 mr-1" />
                      VIP
                    </IOSBadge>
                  )}
                </div>

                <div className="space-y-2 ios-text-caption1 text-enigma-neutral-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    <span className="font-medium text-enigma-primary">{emailClientInfo.email}</span>
                  </div>
                  {emailClientInfo.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      <span>{emailClientInfo.phone}</span>
                    </div>
                  )}
                  {emailClientInfo.company && (
                    <div className="text-xs">
                      <span className="text-enigma-neutral-500">Empresa:</span> {emailClientInfo.company}
                    </div>
                  )}
                  <div className="text-xs">
                    <span className="text-enigma-neutral-500">Reservas:</span> {emailClientInfo.reservations}
                  </div>
                </div>
              </div>
            </div>

            {/* Cliente por Teléfono */}
            <div className="bg-white border-2 border-enigma-secondary/20 rounded-ios p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-enigma-secondary/10 p-2 rounded-ios">
                  <Phone className="h-4 w-4 text-enigma-secondary" />
                </div>
                <div>
                  <h3 className="ios-text-callout font-semibold text-enigma-secondary">
                    Cliente por Teléfono
                  </h3>
                  <p className="ios-text-caption1 text-enigma-neutral-600">
                    Cliente #{phoneClient.id}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-enigma-neutral-500" />
                  <span className="ios-text-callout font-medium">{phoneClientInfo.name}</span>
                  {phoneClientInfo.isVip && (
                    <IOSBadge variant="gold" size="sm">
                      <Crown className="h-3 w-3 mr-1" />
                      VIP
                    </IOSBadge>
                  )}
                </div>

                <div className="space-y-2 ios-text-caption1 text-enigma-neutral-600">
                  {phoneClientInfo.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      <span>{phoneClientInfo.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    <span className="font-medium text-enigma-secondary">{phoneClientInfo.phone}</span>
                  </div>
                  {phoneClientInfo.company && (
                    <div className="text-xs">
                      <span className="text-enigma-neutral-500">Empresa:</span> {phoneClientInfo.company}
                    </div>
                  )}
                  <div className="text-xs">
                    <span className="text-enigma-neutral-500">Reservas:</span> {phoneClientInfo.reservations}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Opciones de Resolución */}
          <div className="space-y-4">
            <h3 className="ios-text-headline font-semibold text-enigma-neutral-900">
              ¿Cómo deseas resolver este conflicto?
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Mantener Cliente por Email */}
              <button
                onClick={() => setSelectedOption('keep-email')}
                className={cn(
                  "p-4 border-2 rounded-ios text-left transition-all",
                  selectedOption === 'keep-email'
                    ? "border-enigma-primary bg-enigma-primary/5"
                    : "border-enigma-neutral-200 hover:border-enigma-primary/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-enigma-primary/10 p-2 rounded-ios">
                    <Mail className="h-4 w-4 text-enigma-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="ios-text-callout font-medium text-enigma-neutral-900">
                      Mantener Cliente por Email
                    </h4>
                    <p className="ios-text-caption1 text-enigma-neutral-600">
                      Actualizar teléfono de {emailClientInfo.name}
                    </p>
                  </div>
                  {selectedOption === 'keep-email' && (
                    <Check className="h-5 w-5 text-enigma-primary" />
                  )}
                </div>
              </button>

              {/* Mantener Cliente por Teléfono */}
              <button
                onClick={() => setSelectedOption('keep-phone')}
                className={cn(
                  "p-4 border-2 rounded-ios text-left transition-all",
                  selectedOption === 'keep-phone'
                    ? "border-enigma-secondary bg-enigma-secondary/5"
                    : "border-enigma-neutral-200 hover:border-enigma-secondary/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-enigma-secondary/10 p-2 rounded-ios">
                    <Phone className="h-4 w-4 text-enigma-secondary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="ios-text-callout font-medium text-enigma-neutral-900">
                      Mantener Cliente por Teléfono
                    </h4>
                    <p className="ios-text-caption1 text-enigma-neutral-600">
                      Actualizar email de {phoneClientInfo.name}
                    </p>
                  </div>
                  {selectedOption === 'keep-phone' && (
                    <Check className="h-5 w-5 text-enigma-secondary" />
                  )}
                </div>
              </button>

              {/* Fusionar Clientes */}
              <button
                onClick={() => setSelectedOption('merge')}
                className={cn(
                  "p-4 border-2 rounded-ios text-left transition-all",
                  selectedOption === 'merge'
                    ? "border-enigma-accent bg-enigma-accent/5"
                    : "border-enigma-neutral-200 hover:border-enigma-accent/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-enigma-accent/10 p-2 rounded-ios">
                    <ArrowLeftRight className="h-4 w-4 text-enigma-accent" />
                  </div>
                  <div className="flex-1">
                    <h4 className="ios-text-callout font-medium text-enigma-neutral-900">
                      Fusionar Ambos Clientes
                    </h4>
                    <p className="ios-text-caption1 text-enigma-neutral-600">
                      Combinar información y historial
                    </p>
                  </div>
                  {selectedOption === 'merge' && (
                    <Check className="h-5 w-5 text-enigma-accent" />
                  )}
                </div>
              </button>

              {/* Crear Cliente Nuevo */}
              <button
                onClick={() => setSelectedOption('create-new')}
                className={cn(
                  "p-4 border-2 rounded-ios text-left transition-all",
                  selectedOption === 'create-new'
                    ? "border-enigma-neutral-500 bg-enigma-neutral-500/5"
                    : "border-enigma-neutral-200 hover:border-enigma-neutral-500/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-enigma-neutral-500/10 p-2 rounded-ios">
                    <UserPlus className="h-4 w-4 text-enigma-neutral-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="ios-text-callout font-medium text-enigma-neutral-900">
                      Crear Cliente Nuevo
                    </h4>
                    <p className="ios-text-caption1 text-enigma-neutral-600">
                      Ignorar coincidencias y crear nuevo
                    </p>
                  </div>
                  {selectedOption === 'create-new' && (
                    <Check className="h-5 w-5 text-enigma-neutral-500" />
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-enigma-neutral-200">
            <IOSButton
              variant="primary"
              onClick={handleResolution}
              disabled={!selectedOption || isResolving}
              className="flex-1 bg-enigma-accent hover:bg-enigma-accent/90 text-white"
            >
              {isResolving ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Resolviendo...
                </>
              ) : (
                'Resolver Conflicto'
              )}
            </IOSButton>
            
            <IOSButton
              variant="outline"
              onClick={onClose}
              disabled={isResolving}
              className="flex-1 border-enigma-neutral-300 text-enigma-neutral-700 hover:bg-enigma-neutral-50"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </IOSButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}