import { getBaseEmailTemplate, createReservationDetailsSection, createMenuSection } from './BaseEmailTemplate';

/**
 * Plantilla HTML para Confirmación de Reserva
 * Incluye detalles de la reserva y menú seleccionado
 */

interface ConfirmationTemplateData {
  nombre: string;
  fecha: string;
  hora: string;
  personas: string;
  mesa?: string;
  estado: string;
  managementToken?: string;
  menuData?: {
    platos?: Array<{ name: string; price: number; quantity?: number; category?: string }>;
    vinos?: Array<{ name: string; price: number; quantity?: number; winery?: string; wine_type?: string }>;
    totalEstimado?: number;
  };
}

export const getConfirmationTemplate = (
  data: ConfirmationTemplateData,
  contactInfo?: {
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    socialLinksHtml?: string;
  }
): string => {
  const content = `
    <h1 class="email-title">¡Tu reserva ha sido confirmada!</h1>
    
    <p class="email-text">
        Hola <strong>${data.nombre}</strong>, tu reserva para <strong>${data.personas} personas</strong> 
        el <strong>${data.fecha}</strong> a las <strong>${data.hora}</strong> está confirmada.
    </p>

    <!-- CTA Section MOVED UP - Most important for mobile -->
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 40px 0;">
        ${data.managementToken ? `
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
                <tr>
                    <td align="center">
                        <a href="https://enigmaconalma.com/mi-reserva?token=${data.managementToken}" 
                           style="background-color: #237584; color: white; padding: 18px 30px; border-radius: 8px; text-decoration: none; font-weight: 700; display: inline-block; text-align: center; min-width: 200px; font-family: Arial, sans-serif; mso-hide: none;"
                           target="_blank">
                            ✏️ Gestionar mi Reserva
                        </a>
                    </td>
                </tr>
                <tr>
                    <td align="center">
                        <p class="email-text-small" style="text-align: center; margin: 10px 0; color: #6C757D; font-size: 13px; line-height: 1.4;">
                            Puedes modificar fecha, hora, número de personas y productos<br>
                            <strong>Disponible hasta: ${data.fecha}</strong>
                        </p>
                    </td>
                </tr>
            </table>
        ` : `
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
                <tr>
                    <td align="center">
                        <a href="https://enigmaconalma.com/contacto" 
                           style="background-color: #9FB289; color: white; padding: 15px 25px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block; text-align: center; min-width: 180px; font-family: Arial, sans-serif; mso-hide: none;"
                           target="_blank">
                            📞 Contactar Restaurante
                        </a>
                    </td>
                </tr>
            </table>
        `}
    </table>

    <!-- Detalles de reserva después del CTA -->
    ${createReservationDetailsSection({
      fecha: data.fecha,
      hora: data.hora,
      personas: data.personas,
      mesa: data.mesa,
      estado: data.estado
    })}

    ${data.menuData ? createMenuSection(data.menuData) : ''}

    <p class="email-text">
        Estamos emocionados de recibirte en Enigma Cocina con Alma y ofrecerte 
        una experiencia gastronómica inolvidable.
    </p>

    <h3 class="email-subtitle">Información Importante</h3>
    
    <div class="details-section">
        <ul class="details-list">
            <li class="details-item">
                <span class="details-item-icon">⏰</span>
                <span><strong>Puntualidad:</strong> Esperamos 15 minutos después de la hora. Pasado este tiempo, liberamos la mesa</span>
            </li>
            <li class="details-item">
                <span class="details-item-icon">📱</span>
                <span><strong>Modificaciones:</strong> ${data.managementToken ? 'Usa el enlace "Gestionar mi Reserva" hasta el día de tu reserva' : 'Contáctanos 2 horas antes para cambios'}</span>
            </li>
            <li class="details-item">
                <span class="details-item-icon">💳</span>
                <span>Aceptamos efectivo, tarjeta y Bizum</span>
            </li>
        </ul>
    </div>

    <p class="email-text">
        <strong>¡Esperamos verte pronto para una experiencia culinaria única!</strong>
    </p>

    <p class="email-text" style="margin-top: 20px;">
        Saludos cordiales,<br>
        <strong>Equipo Enigma Cocina con Alma</strong>
    </p>
  `;

  return getBaseEmailTemplate(content, {}, contactInfo);
};

export default getConfirmationTemplate;