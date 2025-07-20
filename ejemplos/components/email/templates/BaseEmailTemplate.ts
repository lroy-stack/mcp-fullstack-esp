/**
 * Plantilla HTML Base para Emails de Enigma Cocina con Alma
 * 
 * Características:
 * - Diseño responsive con colores corporativos Enigma
 * - Sin gradientes (solo colores sólidos)
 * - Compatible con todos los clientes de email
 * - Sistema de variables para contenido dinámico
 */

// Colores Enigma (sin gradientes)
const ENIGMA_COLORS = {
  primary: '#237584',      // Teal corporativo
  secondary: '#9FB289',    // Sage natural
  accent: '#CB5910',       // Naranja cálido
  neutral50: '#F8F9FA',
  neutral100: '#F1F3F4',
  neutral200: '#E9ECEF',
  neutral600: '#6C757D',
  neutral700: '#495057',
  neutral800: '#343A40',
  neutral900: '#212529',
  white: '#FFFFFF',
  black: '#000000'
};

/**
 * Plantilla HTML base que envuelve todo el contenido del email
 * Ahora soporta información de contacto dinámica
 */
export const getBaseEmailTemplate = (
  content: string, 
  variables: Record<string, string> = {},
  contactInfo?: {
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    socialLinksHtml?: string;
  }
) => {
  // Información por defecto si no se proporciona contactInfo
  const defaultContact = {
    name: 'Enigma Cocina con Alma',
    description: 'Una experiencia gastronómica única en el corazón de Alicante',
    address: 'Calle Justicia 6A, 03002 Alicante',
    phone: '+34 965 123 456',
    email: 'info@enigmaconalma.com',
    socialLinksHtml: '<a href="https://enigmaconalma.com" class="social-link">Web</a>'
  };

  const contact = contactInfo || defaultContact;
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Enigma Cocina con Alma</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style>
        /* Reset básico para email */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: ${ENIGMA_COLORS.neutral800};
            background-color: ${ENIGMA_COLORS.neutral100};
            margin: 0;
            padding: 0;
            width: 100% !important;
            min-width: 100%;
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        
        table {
            border-collapse: collapse;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        
        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
        }
        
        /* Contenedor principal */
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: ${ENIGMA_COLORS.white};
        }
        
        /* Header corporativo */
        .email-header {
            background-color: ${ENIGMA_COLORS.primary};
            padding: 30px 40px;
            text-align: center;
        }
        
        .logo-container {
            display: inline-block;
            background-color: ${ENIGMA_COLORS.white};
            padding: 15px 25px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .logo-text {
            color: ${ENIGMA_COLORS.primary};
            font-size: 24px;
            font-weight: bold;
            margin: 0;
            letter-spacing: -0.5px;
        }
        
        .tagline {
            color: ${ENIGMA_COLORS.white};
            font-size: 14px;
            margin: 15px 0 0 0;
            opacity: 0.9;
        }
        
        /* Contenido principal */
        .email-content {
            padding: 40px;
            background-color: ${ENIGMA_COLORS.white};
        }
        
        /* Tipografía */
        .email-title {
            color: ${ENIGMA_COLORS.neutral900};
            font-size: 28px;
            font-weight: bold;
            margin: 0 0 20px 0;
            line-height: 1.2;
        }
        
        .email-subtitle {
            color: ${ENIGMA_COLORS.primary};
            font-size: 18px;
            font-weight: 600;
            margin: 30px 0 15px 0;
        }
        
        .email-text {
            color: ${ENIGMA_COLORS.neutral700};
            font-size: 16px;
            line-height: 1.6;
            margin: 0 0 20px 0;
        }
        
        .email-text-small {
            color: ${ENIGMA_COLORS.neutral600};
            font-size: 14px;
            line-height: 1.5;
            margin: 0 0 15px 0;
        }
        
        /* Sección de detalles */
        .details-section {
            background-color: ${ENIGMA_COLORS.neutral50};
            border: 2px solid ${ENIGMA_COLORS.neutral200};
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .details-title {
            color: ${ENIGMA_COLORS.primary};
            font-size: 18px;
            font-weight: bold;
            margin: 0 0 15px 0;
            display: flex;
            align-items: center;
        }
        
        .details-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        
        .details-item {
            color: ${ENIGMA_COLORS.neutral800};
            font-size: 16px;
            margin: 8px 0;
            display: flex;
            align-items: center;
        }
        
        .details-item-icon {
            display: inline-block;
            width: 20px;
            margin-right: 10px;
            text-align: center;
        }
        
        .details-item-label {
            font-weight: 600;
            min-width: 100px;
            display: inline-block;
        }
        
        .details-item-value {
            color: ${ENIGMA_COLORS.neutral700};
        }
        
        /* Sección de menú */
        .menu-section {
            background-color: ${ENIGMA_COLORS.white};
            border: 2px solid ${ENIGMA_COLORS.secondary};
            border-radius: 12px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .menu-title {
            color: ${ENIGMA_COLORS.secondary};
            font-size: 20px;
            font-weight: bold;
            margin: 0 0 20px 0;
            display: flex;
            align-items: center;
        }
        
        .menu-category {
            margin: 20px 0;
        }
        
        .menu-category-title {
            color: ${ENIGMA_COLORS.primary};
            font-size: 16px;
            font-weight: bold;
            margin: 0 0 10px 0;
            padding-bottom: 5px;
            border-bottom: 2px solid ${ENIGMA_COLORS.neutral200};
        }
        
        .menu-item {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 8px 0;
            border-bottom: 1px solid ${ENIGMA_COLORS.neutral200};
        }
        
        .menu-item:last-child {
            border-bottom: none;
        }
        
        .menu-item-name {
            color: ${ENIGMA_COLORS.neutral800};
            font-size: 15px;
            font-weight: 500;
            flex: 1;
        }
        
        .menu-item-details {
            color: ${ENIGMA_COLORS.neutral600};
            font-size: 13px;
            margin: 2px 0;
        }
        
        .menu-item-price {
            color: ${ENIGMA_COLORS.accent};
            font-size: 15px;
            font-weight: bold;
            margin-left: 15px;
        }
        
        .menu-total {
            background-color: ${ENIGMA_COLORS.accent};
            color: ${ENIGMA_COLORS.white};
            padding: 15px 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0 0 0;
            font-size: 18px;
            font-weight: bold;
        }
        
        /* Botón CTA */
        .cta-section {
            text-align: center;
            margin: 30px 0;
        }
        
        .cta-button {
            display: inline-block;
            background-color: ${ENIGMA_COLORS.primary};
            color: ${ENIGMA_COLORS.white};
            padding: 15px 30px;
            border-radius: 8px;
            text-decoration: none;
            font-size: 16px;
            font-weight: 600;
            transition: background-color 0.3s ease;
        }
        
        .cta-button:hover {
            background-color: #1e6370;
        }
        
        /* Footer */
        .email-footer {
            background-color: ${ENIGMA_COLORS.neutral800};
            color: ${ENIGMA_COLORS.white};
            padding: 30px 40px;
            text-align: center;
        }
        
        .footer-title {
            color: ${ENIGMA_COLORS.white};
            font-size: 18px;
            font-weight: bold;
            margin: 0 0 15px 0;
        }
        
        .footer-text {
            color: ${ENIGMA_COLORS.neutral200};
            font-size: 14px;
            line-height: 1.5;
            margin: 0 0 10px 0;
        }
        
        .footer-contact {
            color: ${ENIGMA_COLORS.secondary};
            font-size: 14px;
            margin: 5px 0;
        }
        
        .footer-social {
            margin: 20px 0 0 0;
        }
        
        .social-link {
            color: ${ENIGMA_COLORS.secondary};
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
        }
        
        /* Mobile Email Client Optimizations */
        @media only screen and (max-width: 600px) {
            /* Force full width on mobile */
            .email-container {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                min-width: 320px !important;
            }
            
            /* Reduce padding to prevent truncation */
            .email-header,
            .email-content,
            .email-footer {
                padding: 15px !important;
            }
            
            /* Optimize title sizing */
            .email-title {
                font-size: 22px !important;
                line-height: 1.2 !important;
                margin-bottom: 15px !important;
                word-wrap: break-word !important;
            }
            
            .logo-text {
                font-size: 18px !important;
            }
            
            /* Compact sections to reduce email length */
            .details-section,
            .menu-section {
                padding: 15px !important;
                margin: 15px 0 !important;
                border-radius: 8px !important;
            }
            
            /* Stack details items more compactly */
            .details-item {
                flex-direction: row !important;
                align-items: center !important;
                margin: 8px 0 !important;
                font-size: 14px !important;
                line-height: 1.4 !important;
            }
            
            .details-item-icon {
                margin-right: 8px !important;
                font-size: 14px !important;
            }
            
            .details-item-label {
                min-width: auto !important;
                margin-right: 5px !important;
                font-weight: 600 !important;
            }
            
            /* Critical: CTA Button must be visible */
            .cta-section {
                margin: 20px 0 !important;
                padding: 0 5px !important;
                text-align: center !important;
                /* Gmail mobile fix */
                min-height: 60px !important;
            }
            
            .cta-button {
                /* Force visibility */
                width: 90% !important;
                max-width: 280px !important;
                padding: 16px 20px !important;
                font-size: 16px !important;
                font-weight: 700 !important;
                text-align: center !important;
                display: block !important;
                margin: 0 auto 10px auto !important;
                box-sizing: border-box !important;
                /* Prevent truncation */
                border-radius: 6px !important;
                white-space: nowrap !important;
                overflow: visible !important;
                /* Mobile client compatibility */
                mso-hide: none !important;
                text-decoration: none !important;
            }
            
            /* Compact text for mobile */
            .email-text {
                font-size: 15px !important;
                line-height: 1.5 !important;
                margin-bottom: 12px !important;
                word-wrap: break-word !important;
            }
            
            .email-text-small {
                font-size: 13px !important;
                line-height: 1.4 !important;
                margin: 8px 0 !important;
                text-align: center !important;
                word-wrap: break-word !important;
            }
            
            /* Compact footer */
            .footer-contact {
                font-size: 13px !important;
                margin: 6px 0 !important;
                word-wrap: break-word !important;
                line-height: 1.3 !important;
            }
            
            .footer-social {
                margin: 15px 0 10px 0 !important;
            }
            
            .social-link {
                display: inline-block !important;
                margin: 3px 6px !important;
                font-size: 13px !important;
                padding: 2px 4px !important;
            }
            
            /* Remove excess spacing */
            .email-subtitle {
                font-size: 16px !important;
                margin: 20px 0 10px 0 !important;
            }
        }
        
        /* Extra small screens */
        @media only screen and (max-width: 320px) {
            .email-header,
            .email-content,
            .email-footer {
                padding: 15px !important;
            }
            
            .cta-button {
                padding: 16px 20px !important;
                font-size: 15px !important;
            }
            
            .email-title {
                font-size: 22px !important;
            }
        }
        
        /* Gmail Mobile Specific Fixes */
        @media screen and (max-width: 480px) {
            /* Gmail mobile often truncates here */
            .email-container {
                width: 100% !important;
                min-width: 320px !important;
            }
            
            /* Ensure CTA is always visible */
            .cta-section {
                background-color: ${ENIGMA_COLORS.white} !important;
                padding: 15px 10px !important;
                margin: 15px 0 !important;
                border: 2px solid ${ENIGMA_COLORS.primary} !important;
                border-radius: 8px !important;
            }
            
            /* Make CTA button more prominent */
            .cta-button {
                background-color: ${ENIGMA_COLORS.primary} !important;
                color: ${ENIGMA_COLORS.white} !important;
                border: none !important;
                font-size: 18px !important;
                padding: 20px 15px !important;
                width: 95% !important;
                text-transform: uppercase !important;
                letter-spacing: 0.5px !important;
            }
        }
        
        /* Outlook Mobile Fixes */
        @media screen and (max-device-width: 480px) {
            /* Outlook specific */
            .email-container {
                width: 100% !important;
                margin: 0 !important;
            }
            
            table[class="body"] .email-container {
                width: 100% !important;
            }
        }
        
        /* Apple Mail Mobile Optimizations */
        @media only screen and (max-device-width: 414px) {
            /* iPhone specific */
            .email-text {
                -webkit-text-size-adjust: none !important;
            }
            
            .cta-button {
                -webkit-appearance: none !important;
                border-radius: 8px !important;
            }
        }
        
        /* Anti-truncation techniques */
        .prevent-truncation {
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            overflow: visible !important;
            white-space: normal !important;
            word-wrap: break-word !important;
            -webkit-text-size-adjust: 100% !important;
            -ms-text-size-adjust: 100% !important;
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
            .email-container {
                background-color: ${ENIGMA_COLORS.neutral800} !important;
            }
            
            .email-content {
                background-color: ${ENIGMA_COLORS.neutral800} !important;
            }
            
            .email-title,
            .details-item {
                color: ${ENIGMA_COLORS.white} !important;
            }
            
            .email-text {
                color: ${ENIGMA_COLORS.neutral200} !important;
            }
        }
    </style>
</head>
<body>
    <div style="background-color: ${ENIGMA_COLORS.neutral100}; padding: 20px 0; min-height: 100vh;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
                <td align="center">
                    <div class="email-container">
                        <!-- Header -->
                        <div class="email-header">
                            <div class="logo-container">
                                <h1 class="logo-text">ENIGMA</h1>
                            </div>
                            <p class="tagline">Cocina con Alma</p>
                        </div>
                        
                        <!-- Contenido principal -->
                        <div class="email-content">
                            ${content}
                        </div>
                        
                        <!-- Footer -->
                        <div class="email-footer">
                            <h3 class="footer-title">${contact.name}</h3>
                            <p class="footer-text">${contact.description}</p>
                            <p class="footer-contact">📍 ${contact.address}</p>
                            <p class="footer-contact">📞 ${contact.phone}</p>
                            <p class="footer-contact">✉️ ${contact.email}</p>
                            
                            <div class="footer-social">
                                ${contact.socialLinksHtml}
                            </div>
                            
                            <p class="footer-text" style="margin-top: 20px; font-size: 12px; opacity: 0.7;">
                                Este email fue enviado porque tienes una reserva o comunicación activa con nosotros.
                            </p>
                        </div>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>`;
};

/**
 * Función helper para crear contenido de detalles de reserva
 */
export const createReservationDetailsSection = (details: {
  fecha?: string;
  hora?: string;
  personas?: string;
  mesa?: string;
  estado?: string;
}) => {
  return `
    <div class="details-section">
        <h3 class="details-title">
            <span class="details-item-icon">📅</span>
            Detalles de tu Reserva
        </h3>
        <ul class="details-list">
            ${details.fecha ? `
            <li class="details-item">
                <span class="details-item-icon">📅</span>
                <span class="details-item-label">Fecha:</span>
                <span class="details-item-value">${details.fecha}</span>
            </li>
            ` : ''}
            ${details.hora ? `
            <li class="details-item">
                <span class="details-item-icon">🕐</span>
                <span class="details-item-label">Hora:</span>
                <span class="details-item-value">${details.hora}</span>
            </li>
            ` : ''}
            ${details.personas ? `
            <li class="details-item">
                <span class="details-item-icon">👥</span>
                <span class="details-item-label">Comensales:</span>
                <span class="details-item-value">${details.personas} personas</span>
            </li>
            ` : ''}
            ${details.mesa ? `
            <li class="details-item">
                <span class="details-item-icon">🪑</span>
                <span class="details-item-label">Mesa:</span>
                <span class="details-item-value">${details.mesa}</span>
            </li>
            ` : ''}
            ${details.estado ? `
            <li class="details-item">
                <span class="details-item-icon">✅</span>
                <span class="details-item-label">Estado:</span>
                <span class="details-item-value">${details.estado}</span>
            </li>
            ` : ''}
        </ul>
    </div>
  `;
};

/**
 * Función helper para crear sección de menú seleccionado
 */
export const createMenuSection = (menuData: {
  platos?: Array<{ name: string; price: number; quantity?: number; category?: string }>;
  vinos?: Array<{ name: string; price: number; quantity?: number; winery?: string; wine_type?: string }>;
  totalEstimado?: number;
}) => {
  if (!menuData.platos?.length && !menuData.vinos?.length) {
    return '';
  }

  let menuContent = `
    <div class="menu-section">
        <h3 class="menu-title">
            <span class="details-item-icon">🍽️</span>
            Productos Seleccionados
        </h3>
  `;

  // Agregar platos
  if (menuData.platos?.length) {
    menuContent += `
      <div class="menu-category">
          <h4 class="menu-category-title">Platos</h4>
    `;
    
    menuData.platos.forEach(plato => {
      const quantity = plato.quantity || 1;
      const totalPrice = plato.price * quantity;
      
      menuContent += `
        <div class="menu-item">
            <div>
                <div class="menu-item-name">• ${plato.name}</div>
                ${quantity > 1 ? `<div class="menu-item-details">Cantidad: ${quantity}</div>` : ''}
                ${plato.category ? `<div class="menu-item-details">${plato.category}</div>` : ''}
            </div>
            <div class="menu-item-price">€${totalPrice.toFixed(2)}</div>
        </div>
      `;
    });
    
    menuContent += `</div>`;
  }

  // Agregar vinos
  if (menuData.vinos?.length) {
    menuContent += `
      <div class="menu-category">
          <h4 class="menu-category-title">Vinos</h4>
    `;
    
    menuData.vinos.forEach(vino => {
      const quantity = vino.quantity || 1;
      const totalPrice = vino.price * quantity;
      
      menuContent += `
        <div class="menu-item">
            <div>
                <div class="menu-item-name">• ${vino.name}</div>
                ${quantity > 1 ? `<div class="menu-item-details">Cantidad: ${quantity}</div>` : ''}
                ${vino.winery ? `<div class="menu-item-details">${vino.winery}</div>` : ''}
                ${vino.wine_type ? `<div class="menu-item-details">${vino.wine_type}</div>` : ''}
            </div>
            <div class="menu-item-price">€${totalPrice.toFixed(2)}</div>
        </div>
      `;
    });
    
    menuContent += `</div>`;
  }

  // Agregar total
  if (menuData.totalEstimado && menuData.totalEstimado > 0) {
    menuContent += `
      <div class="menu-total">
          Total Estimado: €${menuData.totalEstimado.toFixed(2)}
      </div>
    `;
  }

  menuContent += `
        <p class="email-text-small" style="margin-top: 15px; text-align: center; font-style: italic;">
            💡 Los productos seleccionados te esperan para ser disfrutados durante tu visita.
        </p>
    </div>
  `;

  return menuContent;
};

export default getBaseEmailTemplate;