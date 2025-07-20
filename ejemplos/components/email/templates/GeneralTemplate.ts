import { getBaseEmailTemplate } from './BaseEmailTemplate';

/**
 * Plantilla HTML para Comunicación General
 * Para información corporativa, noticias, promociones, etc.
 */

interface GeneralTemplateData {
  nombre: string;
  asunto: string;
  mensaje: string;
  esPromocion?: boolean;
  promocionDescuento?: string;
  promocionValidez?: string;
  incluirRedesSociales?: boolean;
  ctaTexto?: string;
  ctaUrl?: string;
}

export const getGeneralTemplate = (data: GeneralTemplateData): string => {
  const content = `
    <h1 class="email-title">
        ${data.asunto}
    </h1>
    
    <p class="email-text">
        Estimado/a <strong>${data.nombre}</strong>,
    </p>
    
    <p class="email-text">
        Esperamos que te encuentres bien.
    </p>
    
    <div class="email-text" style="white-space: pre-line; line-height: 1.6;">
        ${data.mensaje}
    </div>

    ${data.esPromocion ? `
    <div class="details-section" style="background-color: #e8f5e8; border-color: #9FB289;">
        <h3 class="details-title" style="color: #2d5016;">
            <span class="details-item-icon">🎉</span>
            Oferta Especial
        </h3>
        <div style="text-align: center; padding: 20px;">
            ${data.promocionDescuento ? `
            <div style="background-color: #CB5910; color: white; padding: 15px 25px; border-radius: 8px; font-size: 24px; font-weight: bold; margin-bottom: 15px;">
                ${data.promocionDescuento}
            </div>
            ` : ''}
            <p class="email-text" style="margin: 0; font-size: 18px; color: #2d5016;">
                <strong>Válido ${data.promocionValidez || 'hasta fin de mes'}</strong>
            </p>
        </div>
    </div>
    ` : ''}

    ${data.ctaTexto && data.ctaUrl ? `
    <div class="cta-section">
        <a href="${data.ctaUrl}" class="cta-button">
            ${data.ctaTexto}
        </a>
    </div>
    ` : ''}

    <h3 class="email-subtitle">¿Por qué elegir Enigma Cocina con Alma?</h3>
    
    <div class="details-section">
        <ul class="details-list">
            <li class="details-item">
                <span class="details-item-icon">👨‍🍳</span>
                <span>Cocina de autor con ingredientes de temporada</span>
            </li>
            <li class="details-item">
                <span class="details-item-icon">🍷</span>
                <span>Carta de vinos cuidadosamente seleccionada</span>
            </li>
            <li class="details-item">
                <span class="details-item-icon">🏛️</span>
                <span>Ambiente único en el corazón de Madrid</span>
            </li>
            <li class="details-item">
                <span class="details-item-icon">⭐</span>
                <span>Experiencia gastronómica memorable</span>
            </li>
        </ul>
    </div>

    ${data.incluirRedesSociales ? `
    <h3 class="email-subtitle">Síguenos en Redes Sociales</h3>
    
    <div class="details-section" style="text-align: center;">
        <p class="email-text">
            Mantente al día con nuestras novedades, platos especiales y eventos:
        </p>
        <div style="margin: 20px 0;">
            <a href="https://instagram.com/enigmaconalma" style="color: #237584; text-decoration: none; margin: 0 15px; font-size: 16px;">
                📸 Instagram
            </a>
            <a href="https://facebook.com/enigmaconalma" style="color: #237584; text-decoration: none; margin: 0 15px; font-size: 16px;">
                👥 Facebook
            </a>
            <a href="https://enigmaconalma.com" style="color: #237584; text-decoration: none; margin: 0 15px; font-size: 16px;">
                🌐 Web
            </a>
        </div>
    </div>
    ` : ''}

    <div class="details-section">
        <h3 class="details-title">
            <span class="details-item-icon">📞</span>
            Información de Contacto
        </h3>
        <ul class="details-list">
            <li class="details-item">
                <span class="details-item-icon">📍</span>
                <span class="details-item-label">Dirección:</span>
                <span class="details-item-value">Calle Justicia 6A, Madrid</span>
            </li>
            <li class="details-item">
                <span class="details-item-icon">📱</span>
                <span class="details-item-label">Teléfono:</span>
                <span class="details-item-value">+34 91 123 45 67</span>
            </li>
            <li class="details-item">
                <span class="details-item-icon">✉️</span>
                <span class="details-item-label">Email:</span>
                <span class="details-item-value">info@enigmaconalma.com</span>
            </li>
            <li class="details-item">
                <span class="details-item-icon">🕐</span>
                <span class="details-item-label">Horario:</span>
                <span class="details-item-value">Martes a Domingo, 13:00 - 24:00</span>
            </li>
        </ul>
    </div>

    <p class="email-text">
        Quedamos a tu disposición para cualquier consulta o información adicional que puedas necesitar.
    </p>

    <p class="email-text" style="margin-top: 30px;">
        Saludos cordiales,<br>
        <strong>Equipo Enigma Cocina con Alma</strong>
    </p>
  `;

  return getBaseEmailTemplate(content);
};

export default getGeneralTemplate;