
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRestaurantStats } from '@/hooks/useRestaurantStats';
import { Home, TreePine, Building2 } from 'lucide-react';

const zoneIcons = {
  interior: Home,
  campanar: TreePine,
  justicia: Building2,
};

const zoneNames = {
  interior: 'Interior',
  campanar: 'Campanar',
  justicia: 'Justicia',
};

export function RestaurantStatsWidget() {
  const { data: stats, isLoading } = useRestaurantStats();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estado del Restaurante</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Ensure stats is an array
  const statsArray = Array.isArray(stats) ? stats : [];

  const totalStats = statsArray.reduce((acc, zone) => ({
    total_mesas: acc.total_mesas + zone.total_mesas,
    mesas_libres: acc.mesas_libres + zone.mesas_libres,
    mesas_ocupadas: acc.mesas_ocupadas + zone.mesas_ocupadas,
    mesas_reservadas: acc.mesas_reservadas + zone.mesas_reservadas,
    mesas_limpieza: acc.mesas_limpieza + zone.mesas_limpieza,
  }), {
    total_mesas: 0,
    mesas_libres: 0,
    mesas_ocupadas: 0,
    mesas_reservadas: 0,
    mesas_limpieza: 0,
  });

  const overallOccupancy = totalStats.total_mesas > 0 ? 
    Math.round(((totalStats.mesas_ocupadas + totalStats.mesas_reservadas) / totalStats.total_mesas) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Home className="h-5 w-5 text-enigma-primary" />
          Estado del Restaurante
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumen general */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-enigma-primary">
              {totalStats.total_mesas}
            </div>
            <div className="text-sm text-gray-600">Total Mesas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {overallOccupancy}%
            </div>
            <div className="text-sm text-gray-600">Ocupación</div>
          </div>
        </div>

        <Progress value={overallOccupancy} className="h-2" />

        {/* Estados por zona */}
        <div className="space-y-4">
          {statsArray.map((zone) => {
            const IconComponent = zoneIcons[zone.zona as keyof typeof zoneIcons] || Home;
            const zoneName = zoneNames[zone.zona as keyof typeof zoneNames] || zone.zona;
            
            return (
              <div key={zone.zona} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">{zoneName}</span>
                  </div>
                  <Badge variant="outline">
                    {zone.porcentaje_ocupacion}% ocupada
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>{zone.mesas_libres} libres</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>{zone.mesas_ocupadas} ocupadas</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>{zone.mesas_reservadas} reservadas</span>
                  </div>
                  {zone.mesas_limpieza > 0 && (
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>{zone.mesas_limpieza} limpieza</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
