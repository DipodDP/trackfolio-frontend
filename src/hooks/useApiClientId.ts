// src/hooks/useApiClientId.ts
import { useAppStore } from '@/store/appStore';

export function useApiClientId(): number | null {
  const { selectedApiClientId } = useAppStore();
  return selectedApiClientId;
}