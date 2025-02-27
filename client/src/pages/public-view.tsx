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
import { Loader2, Beer } from "lucide-react";

export default function PublicView() {
  const { data: bars, isLoading } = useQuery<Bar[]>({
    queryKey: ["/api/bars"],
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <Beer className="h-16 w-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-2">Madison Bar Scene</h1>
          <p className="text-xl text-muted-foreground">
            Real-time occupancy for your favorite spots
          </p>
        </div>

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
                  <CardDescription>{bar.address}</CardDescription>
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
      </div>
    </div>
  );
}
