// src/hooks/useRoutes.ts
import { useState, useEffect } from "react";
import { Route } from "@/types";

type UseRoutesResult = {
  routes: Route[];
  isLoading: boolean;
  error: string | null;
};

export const useRoutes = (origin: string): UseRoutesResult => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!origin) return; // don’t fetch if no origin selected

    setIsLoading(true);
    setError(null);

    fetch(`/api/routes?origin=${origin}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch routes");
        return res.json();
      })
      .then((data: Route[]) => {
        setRoutes(data);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [origin]);

  return { routes, isLoading, error };
};
