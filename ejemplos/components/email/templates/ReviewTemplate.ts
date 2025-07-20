import { getBaseEmailTemplate, createReservationDetailsSection } from './BaseEmailTemplate';

/**
 * Plantilla HTML para Email de Reseña/Agradecimiento
 * Se envía cuando una reserva se completa exitosamente
 * Incluye enlaces a TripAdvisor, Google Reviews y redes sociales
 */

interface ReviewTemplateData {
  nombre: string;
  fecha: string;
  hora: string;
  personas: string;
  mesa?: string;
  estado?: string;
}

export const getReviewTemplate = (
  data: ReviewTemplateData,
  contactInfo?: {
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    instagram?: string;
    facebook?: string;
    tripadvisor?: string;
    googleReviews?: string;
    socialLinksHtml?: string;
  }
): string => {
  const content = `
    <h1 class="email-title">🙏 ¡Gracias por visitarnos!</h1>
    
    <p class="email-text">
        Hola <strong>${data.nombre}</strong>, ha sido un placer tenerte en 
        <strong>Enigma Cocina con Alma</strong> y esperamos que hayas disfrutado 
        cada momento de tu visita gastronómica.
    </p>

    <!-- Resumen de la visita -->
    ${createReservationDetailsSection({
      fecha: data.fecha,
      hora: data.hora,
      personas: data.personas,
      mesa: data.mesa,
      estado: 'Completada ✅'
    })}

    <!-- Sección de Reseñas - CTA Principal -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 40px 0;">
        <tr>
            <td style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 16px; padding: 30px; text-align: center;">
                <h2 style="color: #92400e; margin: 0 0 15px 0; font-size: 22px; font-weight: 600; font-family: Arial, sans-serif;">
                    🌟 ¡Tu opinión nos importa mucho!
                </h2>
                <p style="color: #78350f; margin: 0 0 25px 0; font-size: 16px; line-height: 1.6; font-family: Arial, sans-serif;">
                    Si has disfrutado de tu experiencia, nos haría muy felices que compartieras tu opinión. 
                    Tu reseña nos ayuda a seguir mejorando y permite que otros descubran la magia de Enigma.
                </p>
                
                <!-- CTAs de Reseñas -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
                    <tr>
                        <td align="center" style="padding: 10px;">
                            <a href="https://www.tripadvisor.es/UserReviewEdit-g187526-d23958723-Enigma_Cocina_Con_Alma-Calpe_Costa_Blanca_Province_of_Alicante_Valencian_Community.html" 
                               style="background: linear-gradient(135deg, #237584 0%, #2a7f8a 100%); color: white; padding: 15px 25px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; min-width: 180px; text-align: center; font-family: Arial, sans-serif; mso-hide: none;"
                               target="_blank">
                                ⭐ Reseña en TripAdvisor
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 10px;">
                            <a href="${contactInfo?.googleReviews || 'https://share.google/cyAqceL0vlMs3LUkj'}" 
                               style="background: linear-gradient(135deg, #237584 0%, #2a7f8a 100%); color: white; padding: 15px 25px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; min-width: 180px; text-align: center; font-family: Arial, sans-serif; mso-hide: none;"
                               target="_blank">
                                📝 Reseña en Google
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Sección de Redes Sociales -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 30px 0;">
        <tr>
            <td style="padding: 20px; background-color: #f8f9fa; border-radius: 12px;">
                <h3 style="color: #495057; margin: 0 0 10px 0; font-size: 18px; font-weight: 600; font-family: Arial, sans-serif; text-align: center;">
                    📱 Síguenos en Redes Sociales
                </h3>
                <p style="color: #6C757D; margin: 0 0 20px 0; font-size: 14px; text-align: center; font-family: Arial, sans-serif;">
                    Mantente al día con nuestras novedades, platos especiales y eventos exclusivos
                </p>
                
                <!-- Enlaces de Redes Sociales -->
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                    <tr>
                        <td align="center" style="padding: 8px;">
                            <a href="${contactInfo?.instagram || 'https://instagram.com/enigmaconalma'}" 
                               style="background: linear-gradient(135deg, #E4405F, #C13584); color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; min-width: 140px; text-align: center; font-family: Arial, sans-serif;"
                               target="_blank">
                                📸 Instagram
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 8px;">
                            <a href="${contactInfo?.facebook || 'https://www.facebook.com/enigma.restaurante.calpe/'}" 
                               style="background: #1877F2; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; min-width: 140px; text-align: center; font-family: Arial, sans-serif;"
                               target="_blank">
                                👍 Facebook
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <!-- Invitación a volver -->
    <div class="details-section">
        <h3 class="details-title">
            <span class="details-item-icon">🍽️</span>
            ¡Esperamos verte de nuevo pronto!
        </h3>
        <ul class="details-list">
            <li class="details-item">
                <span class="details-item-icon">✨</span>
                <span>Carta elaborada con ingredientes frescos y de temporada</span>
            </li>
            <li class="details-item">
                <span class="details-item-icon">🍷</span>
                <span>Selección de vinos para acompañar cada experiencia</span>
            </li>
            <li class="details-item">
                <span class="details-item-icon">🎯</span>
                <span>Cocina mediterránea con toques de autor</span>
            </li>
            <li class="details-item">
                <span class="details-item-icon">📅</span>
                <span>Reserva con antelación para asegurar tu mesa</span>
            </li>
        </ul>
    </div>

    <!-- CTA Nueva Reserva -->
    <div class="cta-section">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
            <tr>
                <td align="center">
                    <a href="https://enigmaconalma.com/reservas" 
                       class="cta-button"
                       style="background-color: #9FB289; color: white; padding: 18px 30px; border-radius: 8px; text-decoration: none; font-weight: 700; display: inline-block; margin: 10px auto; text-align: center; min-width: 200px;">
                        🍽️ Hacer Nueva Reserva
                    </a>
                </td>
            </tr>
        </table>
    </div>

    <p class="email-text">
        Esperamos que tu experiencia en Enigma Cocina con Alma haya sido memorable y que 
        pronto podamos volver a recibirte para compartir contigo nuestra pasión por la gastronomía.
    </p>

    <p class="email-text" style="margin-top: 30px;">
        Con cariño y agradecimiento,<br>
        <strong>Todo el equipo de Enigma Cocina con Alma</strong>
    </p>
  `;

  return getBaseEmailTemplate(content, {}, contactInfo);
};

export default getReviewTemplate;