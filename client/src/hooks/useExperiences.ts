import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { GuestExperience } from "@/types";

export function useExperiences() {
  return useQuery({
    queryKey: ["experiences"],
    queryFn: async () => {
      const { data } = await api.get<GuestExperience[]>("/experiences");
      return data.filter((e) => e.status === "APPROVED");
    },
  });
}
