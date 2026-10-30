import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { GalleryItem } from "@/types";

export function useGallery() {
  return useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      const { data } = await api.get<GalleryItem[]>("/gallery");
      return data;
    },
  });
}
