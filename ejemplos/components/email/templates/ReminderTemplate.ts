import { getBaseEmailTemplate, createReservationDetailsSection } from './BaseEmailTemplate';

/**
 * Plantilla HTML para Recordatorio de Reserva
 * Diseño limpio y directo con información esencial
 */

interface ReminderTemplateData {
  nombre: string;
  fecha: string;
  hora: string;
  personas: string;
  mesa?: string;
  horasRestantes?: number;
}

export const getReminderTemplate = (data: ReminderTemplateData): string => {
  const isToday = data.horasRestantes && data.horasRestantes <= 24;
  const isSoon = data.horasRestantes && data.horasRestantes <= 4;

  const content = `
    <h1 class="email-title">
        ${isSoon ? '⏰ ' : '📅 '}
        Recordatorio de tu Reserva
    </h1>
    
    <p class="email-text">
        Hola <strong>${data.nombre}</strong>,
    </p>
    
    <p class="email-text">
        ${isSoon 
          ? 'Tu reserva es <strong>muy pronto</strong>. Te recordamos los detalles:'
          : isToday
          ? 'Te recordamos que tienes una reserva <strong>hoy</strong> con nosotros:'
          : 'Te recordamos que tienes una reserva próxima con nosotros:'
        }
    </p>

    ${createReservationDetailsSection({
      fecha: data.fecha,
      hora: data.hora,
      personas: data.personas,
      mesa: data.mesa
    })}

    ${isSoon ? `
    <div class="details-section" style="background-color: #fff3cd; border-color: #ffc107;">
        <h3 class="details-title" style="color: #856404;">
            <span class="details-item-icon">⚠️</span>
            Importante - Tu reserva es pronto
        </h3>
        <ul class="details-list">
            <li class="details-item" style="color: #856404;">
                <span class="details-item-icon">⏰</span>
                <span>Tu reserva es en menos de 4 horas</span>
            </li>
            <li class="details-item" style="color: #856404;">
                <span class="details-item-icon">🚗</span>
                <span>Recuerda planificar tu llegada con tiempo</span>
            </li>
            <li class="details-item" style="color: #856404;">
                <span class="details-item-icon">📱</span>
                <span>Para cambios urgentes, llama directamente al restaurante</span>
            </li>
        </ul>
    </div>
    ` : `
    <div class="details-section">
        <h3 class="details-title">
            <span class="details-item-icon">📝</span>
            Recordatorios Importantes
        </h3>
        <ul class="details-list">
            <li class="details-item">
                <span class="details-item-icon">⏰</span>
                <span>Llega 10 minutos antes de tu hora de reserva</span>
            </li>
            <li class="details-item">
                <span class="details-item-icon">📞</span>
                <span>Para cambios, contáctanos al menos 2 horas antes</span>
            </li>
            <li class="details-item">
                <span class="details-item-icon">🍽️</span>
                <span>Revisa nuestros menús especiales del día en Instagram</span>
            </li>
        </ul>
    </div>
    `}

    <div class="cta-section">
        <a href="tel:+34911234567" class="cta-button" style="margin-right: 10px;">
            📞 Llamar Restaurante
        </a>
        <a href="https://wa.me/34911234567" class="cta-button" style="background-color: #25D366; margin-left: 10px;">
            💬 WhatsApp
        </a>
    </div>

    <p class="email-text">
        ${isSoon 
          ? 'Si tienes algún imprevisto de último momento, contáctanos inmediatamente.'
          : 'Si necesitas hacer algún cambio o tienes alguna consulta especial, no dudes en contactarnos.'
        }
    </p>

    <p class="email-text">
        <strong>¡Te esperamos para vivir juntos esta experiencia gastronómica!</strong>
    </p>

    <p class="email-text" style="margin-top: 30px;">
        Hasta pronto,<br>
        <strong>Equipo Enigma Cocina con Alma</strong>
    </p>
  `;

  return getBaseEmailTemplate(content);
};

export default getReminderTemplate;