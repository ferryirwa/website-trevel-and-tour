import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useSettings() {
  return useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data } = await api.get<Record<string, string>>('/admin/settings');
      return data;
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, string>) => {
      const { data } = await api.post('/admin/settings', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['home-content'] });
    },
  });
}
