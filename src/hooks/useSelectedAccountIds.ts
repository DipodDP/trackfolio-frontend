// src/hooks/useSelectedAccountIds.ts
import { useAppStore } from '@/store/appStore';

export function useSelectedAccountIds(): string[] {
  const { selectedAccountIds } = useAppStore();
  return selectedAccountIds;
}
