
import React from 'react';
import {
  Calendar,
  UserCheck,
  XCircle,
  UserX,
  Edit,
  Clock,
  AlertTriangle,
  Bell,
  Settings,
  CheckCircle,
  Star,
  Gift,
  Heart,
  Square,
  SquareCheck,
  Timer,
  Shuffle,
  LogIn,
  LogOut,
  CheckSquare,
  AlertCircle,
  Database,
  AlertOctagon,
  Download,
  FileText,
  Mail,
  MessageSquare,
  MessageCircle,
  Megaphone,
  Tag,
  Calculator,
  CreditCard,
  Combine
} from 'lucide-react';

export const getNotificationIcon = (iconName: string) => {
  // Normalizar el nombre del icono (quitar espacios, convertir a minúsculas)
  const normalizedName = iconName?.toLowerCase().replace(/\s+/g, '');
  
  const iconMap: Record<string, React.ComponentType<any>> = {
    // Iconos básicos
    'bell': Bell,
    'calendar': Calendar,
    'checkcircle': CheckCircle,
    'xcircle': XCircle,
    'edit': Edit,
    'clock': Clock,
    'star': Star,
    'gift': Gift,
    'heart': Heart,
    'alerttriangle': AlertTriangle,
    'usercheck': UserCheck,
    'userx': UserX,
    'square': Square,
    'squarecheck': SquareCheck,
    'timer': Timer,
    'shuffle': Shuffle,
    'login': LogIn,
    'logout': LogOut,
    'checksquare': CheckSquare,
    'alertcircle': AlertCircle,
    'combine': Combine,
    
    // Iconos de sistema
    'database': Database,
    'alertoctagon': AlertOctagon,
    'download': Download,
    'settings': Settings,
    'filetext': FileText,
    
    // Iconos de comunicación
    'mail': Mail,
    'messagesquare': MessageSquare,
    'messagecircle': MessageCircle,
    'megaphone': Megaphone,
    
    // Iconos de marketing/finanzas
    'tag': Tag,
    'calculator': Calculator,
    'creditcard': CreditCard,
    
    // Alias comunes
    'calendarplus': Calendar,
    'calendaredit': Edit,
    'crown': Star, // Mapear crown a star
    'barchart3': AlertTriangle
  };

  return iconMap[normalizedName] || Bell;
};
