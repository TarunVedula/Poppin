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
import { useRef, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";

// Move libraries array outside component to prevent reloads
const LIBRARIES = ["places"] as const;

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

// Dark theme for the map
const MAP_STYLES = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

type ViewMode = "list" | "map";

export default function PublicView() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedBar, setSelectedBar] = useState<Bar | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
    libraries: LIBRARIES,
  });

  const { data: bars, isLoading } = useQuery<Bar[]>({
    queryKey: ["/api/bars"],
    refetchInterval: 5000, // Refresh every 5 seconds for more real-time updates
  });

  const mapCenter = useMemo(() => MADISON_CENTER, []);

  const getMarkerStyle = useCallback((occupancyPercent: number) => {
    // Base color for low occupancy
    const baseColor = { r: 255, g: 0, b: 0 };

    // Calculate size based on occupancy
    const baseScale = 14;
    const maxScaleIncrease = 8;
    const scale = baseScale + (maxScaleIncrease * (occupancyPercent / 100));

    // Calculate opacity based on occupancy
    const minOpacity = 0.4;
    const opacity = minOpacity + ((1 - minOpacity) * (occupancyPercent / 100));

    return {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: `rgb(${baseColor.r}, ${baseColor.g}, ${baseColor.b})`,
      fillOpacity: opacity,
      strokeWeight: 2,
      strokeColor: "#ffffff",
      scale: scale,
    };
  }, []);

  if (loadError) {
    const errorMessage = loadError.message.includes("BillingNotEnabledMapError")
      ? "Google Maps API key requires billing to be enabled."
      : "There was an error loading the map. Please try refreshing the page.";
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-semibold mb-2">Map Loading Error</h2>
              <p className="text-sm text-muted-foreground">
                {errorMessage}
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
                    styles: MAP_STYLES,
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
                          ...getMarkerStyle(occupancyPercent),
                          scale: isSelected ? getMarkerStyle(occupancyPercent).scale + 4 : getMarkerStyle(occupancyPercent).scale,
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
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
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
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{bar.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 text-xs">
                      <MapPin className="h-3 w-3 flex-shrink-0" />
                      {bar.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Progress
                        value={Math.min(occupancyPercent, 100)}
                        className="h-2"
                      />
                      <div className="flex justify-between items-center">
                        <span className={`text-sm font-medium ${statusColor}`}>
                          {status}
                        </span>
                        <span className="text-xs text-muted-foreground">
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