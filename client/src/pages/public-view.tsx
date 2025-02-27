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
  lng: -89.4012
};

const MAP_OPTIONS = {
  disableDefaultUI: true,
  clickableIcons: false,
  scrollwheel: true,
};

type ViewMode = "list" | "map";

export default function PublicView() {
  const [viewMode, setViewMode] = useState<ViewMode>("map");

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  });

  const { data: bars, isLoading } = useQuery<Bar[]>({
    queryKey: ["/api/bars"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const mapCenter = useMemo(() => MADISON_CENTER, []);

  const getMarkerColor = useCallback((occupancyPercent: number) => {
    if (occupancyPercent >= 100) return "red";
    if (occupancyPercent >= 80) return "orange";
    return "green";
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
      <div className="max-w-6xl mx-auto p-8">
        <div className="text-center mb-8">
          <Beer className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-2">Madison Bar Scene</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Real-time occupancy for your favorite spots
          </p>
          <div className="flex justify-center gap-4">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              onClick={() => setViewMode("list")}
            >
              List View
            </Button>
            <Button
              variant={viewMode === "map" ? "default" : "outline"}
              onClick={() => setViewMode("map")}
            >
              Map View
            </Button>
          </div>
        </div>

        {viewMode === "map" ? (
          <div className="h-[600px] w-full rounded-lg overflow-hidden border">
            {!isLoaded ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-border" />
              </div>
            ) : (
              <GoogleMap
                zoom={14}
                center={mapCenter}
                mapContainerClassName="w-full h-full"
                options={MAP_OPTIONS}
              >
                {bars?.map((bar) => {
                  const occupancyPercent = (bar.currentCount / bar.capacity) * 100;
                  return (
                    <MarkerF
                      key={bar.id}
                      position={{
                        lat: MADISON_CENTER.lat + (Math.random() - 0.5) * 0.01,
                        lng: MADISON_CENTER.lng + (Math.random() - 0.5) * 0.01,
                      }}
                      icon={{
                        path: "M12 0C7.58 0 4 3.58 4 8c0 5.76 7.44 14 7.44 14C11.67 22.22 12 22 12 22s.33.22.56.44C12.56 22 20 13.76 20 8c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z",
                        fillColor: getMarkerColor(occupancyPercent),
                        fillOpacity: 1,
                        strokeWeight: 1,
                        strokeColor: "#ffffff",
                        scale: 1.5,
                      }}
                      title={`${bar.name} - ${Math.round(occupancyPercent)}% Full`}
                    />
                  );
                })}
              </GoogleMap>
            )}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                <Card key={bar.id}>
                  <CardHeader>
                    <CardTitle>{bar.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {bar.address}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Progress
                        value={Math.min(occupancyPercent, 100)}
                        className="h-2"
                      />
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${statusColor}`}>
                          {status}
                        </span>
                        <span className="text-sm text-muted-foreground">
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