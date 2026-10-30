import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Package } from "@/types";

export function usePackages() {
  return useQuery({
    queryKey: ["packages"],
    queryFn: async () => {
      const { data } = await api.get<Package[]>("/packages");
      return data;
    },
  });
}

export function usePackage(slug: string) {
  return useQuery({
    queryKey: ["package", slug],
    queryFn: async () => {
      const { data } = await api.get<Package>(`/packages/${slug}`);
      return data;
    },
    enabled: !!slug,
  });
}
