import { getBaseEmailTemplate, createReservationDetailsSection } from './BaseEmailTemplate';

/**
 * Plantilla HTML para Cancelación de Reserva
 * Tono comprensivo y profesional con información de contacto
 */

interface CancellationTemplateData {
  nombre: string;
  fecha: string;
  hora: string;
  personas: string;
  motivoCancelacion?: string;
  canceladoPor: 'cliente' | 'restaurante';
  razonRestaurante?: string;
}

export const getCancellationTemplate = (
  data: CancellationTemplateData,
  contactInfo?: {
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    socialLinksHtml?: string;
  }
): string => {
  const isCancelledByRestaurant = data.canceladoPor === 'restaurante';

  const content = `
    <h1 class="email-title">
        ${isCancelledByRestaurant ? '😔 Cancelación de Reserva' : '✅ Confirmación de Cancelación'}
    </h1>
    
    <p class="email-text">
        Hola <strong>${data.nombre}</strong>,
    </p>
    
    <p class="email-text">
        ${isCancelledByRestaurant 
          ? 'Lamentamos informarte que hemos tenido que cancelar tu reserva debido a circunstancias imprevistas.'
          : 'Hemos procesado tu solicitud de cancelación. Tu reserva ha sido cancelada exitosamente.'
        }
    </p>

    ${createReservationDetailsSection({
      fecha: data.fecha,
      hora: data.hora,
      personas: data.personas
    })}

    ${isCancelledByRestaurant ? `
    <div class="details-section" style="background-color: #f8d7da; border-color: #dc3545;">
        <h3 class="details-title" style="color: #721c24;">
            <span class="details-item-icon">ℹ️</span>
            Motivo de la Cancelación
        </h3>
        <p class="email-text" style="color: #721c24; margin: 0;">
            ${data.razonRestaurante || 'Circunstancias operativas imprevistas que no nos permiten ofrecer el servicio con la calidad que mereces.'}
        </p>
    </div>

    <div class="details-section">
        <h3 class="details-title">
            <span class="details-item-icon">🤝</span>
            Disculpas por las Molestias
        </h3>
        <ul class="details-list">
            <li class="details-item">
                <span class="details-item-icon">📞</span>
                <span>Puedes contactarnos para cualquier consulta o nueva reserva</span>
            </li>
            <li class="details-item">
                <span class="details-item-icon">📅</span>
                <span>Estaremos encantados de atenderte en una futura ocasión</span>
            </li>
            <li class="details-item">
                <span class="details-item-icon">🍽️</span>
                <span>Siempre trabajamos para ofrecerte la mejor experiencia gastronómica</span>
            </li>
        </ul>
    </div>
    ` : `
    <div class="details-section">
        <h3 class="details-title">
            <span class="details-item-icon">✅</span>
            Cancelación Procesada
        </h3>
        <ul class="details-list">
            <li class="details-item">
                <span class="details-item-icon">🕐</span>
                <span>Fecha de cancelación: ${new Date().toLocaleDateString('es-ES')}</span>
            </li>
            <li class="details-item">
                <span class="details-item-icon">💳</span>
                <span>Cualquier cargo será reembolsado en 3-5 días hábiles</span>
            </li>
            <li class="details-item">
                <span class="details-item-icon">📧</span>
                <span>Recibirás confirmación del reembolso por separado</span>
            </li>
        </ul>
    </div>
    `}

    <div class="cta-section">
        ${isCancelledByRestaurant ? `
        <a href="https://enigmaconalma.com/reservar" class="cta-button">
            📅 Hacer Nueva Reserva
        </a>
        ` : `
        <a href="https://enigmaconalma.com/reservar" class="cta-button" style="margin-right: 10px;">
            📅 Nueva Reserva
        </a>
        <a href="https://enigmaconalma.com/carta" class="cta-button" style="background-color: #9FB289; margin-left: 10px;">
            🍽️ Ver Carta
        </a>
        `}
    </div>

    <p class="email-text">
        ${isCancelledByRestaurant 
          ? 'Sentimos sinceramente las molestias que esto pueda ocasionarte. Valoramos mucho tu confianza y esperamos poder recibirte pronto en Enigma Cocina con Alma.'
          : 'Entendemos que los planes pueden cambiar. Esperamos poder recibirte en otra ocasión para ofrecerte la experiencia gastronómica que caracteriza a Enigma Cocina con Alma.'
        }
    </p>

    <div class="details-section">
        <h3 class="details-title">
            <span class="details-item-icon">📞</span>
            ¿Necesitas Ayuda?
        </h3>
        <ul class="details-list">
            <li class="details-item">
                <span class="details-item-icon">📱</span>
                <span>Teléfono: ${contactInfo?.phone || '+34 964 46 92 69'}</span>
            </li>
            <li class="details-item">
                <span class="details-item-icon">✉️</span>
                <span>Email: ${contactInfo?.email || 'hola@enigmaconalma.com'}</span>
            </li>
            <li class="details-item">
                <span class="details-item-icon">💬</span>
                <span>WhatsApp: <a href="https://wa.me/${(contactInfo?.phone || '+34964469269').replace(/[^0-9]/g, '')}" style="color: #25d366; text-decoration: none;" target="_blank">${contactInfo?.phone || '+34 964 46 92 69'}</a></span>
            </li>
            <li class="details-item">
                <span class="details-item-icon">📍</span>
                <span>Dirección: ${contactInfo?.address || 'Carrer de la Justícia, 10, 12580 Benicarló, Castelló'}</span>
            </li>
        </ul>
    </div>

    <p class="email-text">
        <strong>Gracias por tu comprensión y esperamos verte pronto en Enigma Cocina con Alma.</strong>
    </p>

    <p class="email-text" style="margin-top: 30px;">
        Con aprecio,<br>
        <strong>Equipo Enigma Cocina con Alma</strong>
    </p>
  `;

  return getBaseEmailTemplate(content, {}, contactInfo);
};

export default getCancellationTemplate;