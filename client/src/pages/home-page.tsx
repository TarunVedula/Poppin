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
  const { user, logoutMutation } = useAuth();
  const [count, setCount] = useState<string>("");

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
      setCount("");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  const userBar = bars?.find(bar => bar.id === user?.barId);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold">Bar Manager Dashboard</h1>
          <div className="flex gap-2 sm:gap-4 w-full sm:w-auto">
            <Link href="/public" className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full sm:w-auto">
                <LinkIcon className="mr-2 h-4 w-4" />
                Public View
              </Button>
            </Link>
            <Button
              variant="destructive"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              className="flex-1 sm:flex-none"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {userBar ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl sm:text-2xl">{userBar.name}</CardTitle>
              <CardDescription className="text-sm sm:text-base">{userBar.address}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Current Count</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      type="number"
                      value={count || userBar.currentCount}
                      onChange={(e) => setCount(e.target.value)}
                      min={0}
                      max={userBar.capacity}
                      className="text-lg"
                    />
                    <Button
                      onClick={() =>
                        updateCountMutation.mutate({
                          barId: userBar.id,
                          count: parseInt(count || "0"),
                        })
                      }
                      disabled={updateCountMutation.isPending}
                      className="w-full sm:w-auto"
                    >
                      Update
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    Capacity: {userBar.capacity}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      userBar.currentCount >= userBar.capacity
                        ? "text-destructive"
                        : userBar.currentCount >= userBar.capacity * 0.8
                        ? "text-orange-500"
                        : "text-green-500"
                    }`}
                  >
                    {Math.round((userBar.currentCount / userBar.capacity) * 100)}%
                    Full
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                You are not assigned to manage any bars. Please contact an administrator.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}