/**
 * Índice de Plantillas HTML para Emails
 * Sistema unificado de plantillas con diseño Enigma
 */

export { getBaseEmailTemplate, createReservationDetailsSection, createMenuSection } from './BaseEmailTemplate';
export { getConfirmationTemplate } from './ConfirmationTemplate';
export { getReminderTemplate } from './ReminderTemplate';
export { getCancellationTemplate } from './CancellationTemplate';
export { getReviewTemplate } from './ReviewTemplate';
export { getGeneralTemplate } from './GeneralTemplate';

// Import directo sin alias para evitar problemas de scope
export { getCustomTemplate } from './CustomTemplate';

// Tipos para las plantillas
export interface BaseTemplateData {
  nombre: string;
}

export interface ReservationDetailsData {
  fecha?: string;
  hora?: string;
  personas?: string;
  mesa?: string;
  estado?: string;
}

export interface MenuData {
  platos?: Array<{
    name: string;
    price: number;
    quantity?: number;
    category?: string;
  }>;
  vinos?: Array<{
    name: string;
    price: number;
    quantity?: number;
    winery?: string;
    wine_type?: string;
  }>;
  totalEstimado?: number;
}

// Enum para tipos de plantilla
export enum EmailTemplateType {
  CONFIRMATION = 'confirmacion_reserva',
  REMINDER = 'recordatorio_reserva',
  CANCELLATION = 'cancelacion_reserva',
  REVIEW = 'email_resena',
  CUSTOM = 'mensaje_personalizado',
  GENERAL = 'comunicacion_general'
}

// Función helper para obtener la plantilla correcta
export const getEmailTemplate = (
  type: EmailTemplateType,
  data: any
): string => {
  switch (type) {
    case EmailTemplateType.CONFIRMATION:
      return getConfirmationTemplate(data);
    case EmailTemplateType.REMINDER:
      return getReminderTemplate(data);
    case EmailTemplateType.CANCELLATION:
      return getCancellationTemplate(data);
    case EmailTemplateType.REVIEW:
      return getReviewTemplate(data);
    case EmailTemplateType.CUSTOM:
      return getCustomTemplate(data);
    case EmailTemplateType.GENERAL:
      return getGeneralTemplate(data);
    default:
      throw new Error(`Tipo de plantilla no reconocido: ${type}`);
  }
};