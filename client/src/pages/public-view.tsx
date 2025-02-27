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
import { Loader2, Beer, MapPin, AlertCircle } from "lucide-react";
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

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    // Add additional required libraries
    libraries: ["places"],
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

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Map Loading Error</h2>
              <p className="text-sm text-muted-foreground">
                There was an error loading the map. Please try refreshing the page.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-2 sm:p-4">
        <div className="text-center mb-4">
          <Beer className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold mb-1">Madison Bar Scene</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-3">
            Real-time occupancy for your favorite spots
          </p>
          <div className="flex justify-center gap-2">
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
              className="px-3 py-1"
            >
              List View
            </Button>
            <Button
              size="sm"
              variant={viewMode === "map" ? "default" : "outline"}
              onClick={() => setViewMode("map")}
              className="px-3 py-1"
            >
              Map View
            </Button>
          </div>
        </div>

        {viewMode === "map" ? (
          <div className="h-[calc(100vh-160px)] w-full rounded-lg overflow-hidden border relative">
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
                  options={{
                    ...MAP_OPTIONS,
                    styles: [
                      {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }],
                      },
                    ],
                  }}
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
                  <div className="absolute bottom-4 left-4 right-4 bg-card p-3 rounded-lg shadow-lg mx-2">
                    <h3 className="font-bold text-base mb-1">{selectedBar.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{selectedBar.address}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs">
                        {selectedBar.currentCount} / {selectedBar.capacity} people
                      </span>
                      <span
                        className={`text-xs font-medium ${
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