import { useQuery, useMutation } from "@tanstack/react-query";
import { Bar, UpdateCount } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Link as LinkIcon, LogOut } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Link } from "wouter";

export default function HomePage() {
  const { logoutMutation } = useAuth();
  const [counts, setCounts] = useState<Record<number, string>>({});

  const { data: bars, isLoading } = useQuery<Bar[]>({
    queryKey: ["/api/bars"],
  });

  const updateCountMutation = useMutation({
    mutationFn: async ({ barId, count }: { barId: number; count: number }) => {
      const res = await apiRequest("PATCH", `/api/bars/${barId}/count`, {
        count,
      } as UpdateCount);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bars"] });
    },
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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Bar Dashboard</h1>
          <div className="flex gap-4">
            <Link href="/public">
              <Button variant="outline">
                <LinkIcon className="mr-2 h-4 w-4" />
                Public View
              </Button>
            </Link>
            <Button
              variant="destructive"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bars?.map((bar) => (
            <Card key={bar.id}>
              <CardHeader>
                <CardTitle>{bar.name}</CardTitle>
                <CardDescription>{bar.address}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Current Count</p>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        value={counts[bar.id] ?? bar.currentCount}
                        onChange={(e) =>
                          setCounts({
                            ...counts,
                            [bar.id]: e.target.value,
                          })
                        }
                      />
                      <Button
                        onClick={() =>
                          updateCountMutation.mutate({
                            barId: bar.id,
                            count: parseInt(counts[bar.id] ?? "0"),
                          })
                        }
                        disabled={updateCountMutation.isPending}
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Capacity: {bar.capacity}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        bar.currentCount >= bar.capacity
                          ? "text-destructive"
                          : bar.currentCount >= bar.capacity * 0.8
                          ? "text-orange-500"
                          : "text-green-500"
                      }`}
                    >
                      {Math.round((bar.currentCount / bar.capacity) * 100)}%
                      Full
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
