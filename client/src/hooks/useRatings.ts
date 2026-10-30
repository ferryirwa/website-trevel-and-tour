import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { RatingSnapshot } from "@/types";

export function useRatings() {
  return useQuery({
    queryKey: ["ratings"],
    queryFn: async () => {
      const { data } = await api.get<RatingSnapshot[]>("/ratings");
      return data;
    },
  });
}
