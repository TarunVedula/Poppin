import { useQuery } from "@tanstack/react-query";
import { Bar } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, Beer, MapPin } from "lucide-react";
import { GoogleMap, useLoadScript, MarkerF } from "@react-google-maps/api";
import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";

const MADISON_CENTER = {
  lat: 43.0731,
  lng: -89.3912
};

const MAP_OPTIONS = {
  disableDefaultUI: false,
  clickableIcons: false,
  scrollwheel: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
};

type ViewMode = "list" | "map";

export default function PublicView() {
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  });

  const { data: bars, isLoading } = useQuery<Bar[]>({
    queryKey: ["/api/bars"],
    refetchInterval: 5000, // Refresh every 5 seconds for more real-time updates
  });

  const mapCenter = useMemo(() => MADISON_CENTER, []);

  const getMarkerColor = useCallback((occupancyPercent: number) => {
    if (occupancyPercent >= 100) return "#ef4444"; // red
    if (occupancyPercent >= 80) return "#f97316"; // orange
    return "#22c55e"; // green
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 sm:p-8">
        <div className="text-center mb-6 sm:mb-8">
          <Beer className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 text-primary" />
          <h1 className="text-2xl sm:text-4xl font-bold mb-2">Madison Bar Scene</h1>
          <p className="text-lg sm:text-xl text-muted-foreground mb-4 sm:mb-6">
            Real-time occupancy for your favorite spots
          </p>
          <div className="flex justify-center gap-2 sm:gap-4">
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              className="px-3 py-1 sm:px-4 sm:py-2"
            >
              List View
            </Button>
            <Button
              size="sm"
              variant={viewMode === "map" ? "default" : "outline"}
              onClick={() => setViewMode("map")}
              className="px-3 py-1 sm:px-4 sm:py-2"
            >
              Map View
            </Button>
          </div>
        </div>

        {viewMode === "map" ? (
          <div className="h-[400px] sm:h-[600px] w-full rounded-lg overflow-hidden border relative">
            {!isLoaded ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-border" />
              </div>
            ) : (
              <>
                <GoogleMap
                  zoom={15}
                  center={mapCenter}
                  mapContainerClassName="w-full h-full"
                  options={MAP_OPTIONS}
                  onClick={() => setSelectedBar(null)}
                >
                  {bars?.map((bar) => {
                    const occupancyPercent = (bar.currentCount / bar.capacity) * 100;
                    const isSelected = selectedBar?.id === bar.id;

                    return (
                      <MarkerF
                        key={bar.id}
                        position={{
                          lat: parseFloat(bar.latitude),
                          lng: parseFloat(bar.longitude),
                        }}
                        onClick={() => setSelectedBar(bar)}
                        icon={{
                          path: google.maps.SymbolPath.CIRCLE,
                          fillColor: getMarkerColor(occupancyPercent),
                          fillOpacity: isSelected ? 1 : 0.8,
                          strokeWeight: isSelected ? 2 : 1,
                          strokeColor: "#ffffff",
                          scale: isSelected ? 16 : 14,
                        }}
                        label={{
                          text: `${Math.round(occupancyPercent)}%`,
                          color: "#ffffff",
                          fontSize: "11px",
                          fontWeight: "bold",
                        }}
                      />
                    );
                  })}
                </GoogleMap>
                {selectedBar && (
                  <div className="absolute bottom-4 left-4 right-4 bg-card p-3 sm:p-4 rounded-lg shadow-lg mx-2 sm:mx-0">
                    <h3 className="font-bold text-base sm:text-lg mb-1">{selectedBar.name}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">{selectedBar.address}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm">
                        {selectedBar.currentCount} / {selectedBar.capacity} people
                      </span>
                      <span
                        className={`text-xs sm:text-sm font-medium ${
                          selectedBar.currentCount >= selectedBar.capacity
                            ? "text-destructive"
                            : selectedBar.currentCount >= selectedBar.capacity * 0.8
                            ? "text-orange-500"
                            : "text-green-500"
                        }`}
                      >
                        {Math.round((selectedBar.currentCount / selectedBar.capacity) * 100)}% Full
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {bars?.map((bar) => {
              const occupancyPercent = (bar.currentCount / bar.capacity) * 100;
              const status =
                occupancyPercent >= 100
                  ? "At Capacity"
                  : occupancyPercent >= 80
                  ? "Getting Full"
                  : "Open";
              const statusColor =
                occupancyPercent >= 100
                  ? "text-destructive"
                  : occupancyPercent >= 80
                  ? "text-orange-500"
                  : "text-green-500";

              return (
                <Card key={bar.id} className="h-full">
                  <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="text-lg sm:text-xl">{bar.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                      <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                      {bar.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 sm:space-y-4">
                      <Progress
                        value={Math.min(occupancyPercent, 100)}
                        className="h-2"
                      />
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-medium ${statusColor}`}>
                          {status}
                        </span>
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          {bar.currentCount} / {bar.capacity} people
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}