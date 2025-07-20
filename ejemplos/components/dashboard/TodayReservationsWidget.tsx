
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTodayReservations } from '@/hooks/useRestaurantStats';
import { formatReservationTime } from '@/utils/dateUtils';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';

export function TodayReservationsWidget() {
  const { data: reservations, isLoading } = useTodayReservations();

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'confirmada': return 'bg-green-100 text-green-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'completada': return 'bg-blue-100 text-blue-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (estado: string) => {
    switch (estado) {
      case 'confirmada': return 'Confirmada';
      case 'pendiente': return 'Pendiente';
      case 'completada': return 'Completada';
      case 'cancelada': return 'Cancelada';
      default: return estado;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reservas de Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-enigma-primary" />
          Reservas de Hoy ({reservations?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {reservations?.map((reservation) => (
              <div key={reservation.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">
                      {formatReservationTime(reservation.hora_reserva)}
                    </span>
                  </div>
                  <Badge className={getStatusColor(reservation.estado)}>
                    {getStatusLabel(reservation.estado)}
                  </Badge>
                </div>
                
                <div className="space-y-1">
                  <div className="font-medium text-sm">
                    {reservation.nombre}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{reservation.personas} personas</span>
                    </div>
                  </div>
                  {reservation.telefono && (
                    <div className="text-xs text-gray-500">
                      📞 {reservation.telefono}
                    </div>
                  )}
                  {reservation.email && (
                    <div className="text-xs text-gray-500">
                      📧 {reservation.email}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {!reservations?.length && (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay reservas para hoy</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
