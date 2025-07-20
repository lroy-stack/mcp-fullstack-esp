import { getBaseEmailTemplate } from './BaseEmailTemplate';

/**
 * Plantilla HTML para Mensajes Personalizados
 * Plantilla flexible para comunicaciones a medida
 */

interface CustomTemplateData {
  nombre: string;
  titulo?: string;
  mensaje: string;
  incluirContacto?: boolean;
  ctaTexto?: string;
  ctaUrl?: string;
  firma?: string;
}

export const getCustomTemplate = (data: CustomTemplateData): string => {
  const content = `
    <h1 class="email-title">
        ${data.titulo || 'Mensaje desde Enigma Cocina con Alma'}
    </h1>
    
    <p class="email-text">
        Hola <strong>${data.nombre}</strong>,
    </p>
    
    <div class="email-text" style="white-space: pre-line; line-height: 1.6;">
        ${data.mensaje}
    </div>

    ${data.ctaTexto && data.ctaUrl ? `
    <div class="cta-section">
        <a href="${data.ctaUrl}" class="cta-button">
            ${data.ctaTexto}
        </a>
    </div>
    ` : ''}

    ${data.incluirContacto ? `
    <h3 class="email-subtitle">¿Cómo puedes contactarnos?</h3>
    
    <div class="details-section">
        <ul class="details-list">
            <li class="details-item">
                <span class="details-item-icon">📱</span>
                <span class="details-item-label">Teléfono:</span>
                <span class="details-item-value">+34 91 123 45 67</span>
            </li>
            <li class="details-item">
                <span class="details-item-icon">✉️</span>
                <span class="details-item-label">Email:</span>
                <span class="details-item-value">hola@enigmaconalma.com</span>
            </li>
            <li class="details-item">
                <span class="details-item-icon">💬</span>
                <span class="details-item-label">WhatsApp:</span>
                <span class="details-item-value">+34 91 123 45 67</span>
            </li>
            <li class="details-item">
                <span class="details-item-icon">📍</span>
                <span class="details-item-label">Dirección:</span>
                <span class="details-item-value">Calle Justicia 6A, Madrid</span>
            </li>
            <li class="details-item">
                <span class="details-item-icon">🕐</span>
                <span class="details-item-label">Horario:</span>
                <span class="details-item-value">Martes a Domingo, 13:00 - 24:00</span>
            </li>
        </ul>
    </div>
    ` : ''}

    <p class="email-text" style="margin-top: 30px;">
        ${data.firma || `
        Saludos cordiales,<br>
        <strong>Equipo Enigma Cocina con Alma</strong>
        `}
    </p>
  `;

  return getBaseEmailTemplate(content);
};

export default getCustomTemplate;