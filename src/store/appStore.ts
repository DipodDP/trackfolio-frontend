import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  // Selected API client
  selectedApiClientId: number | null;
  setSelectedApiClient: (id: number | null) => void;

  // Selected broker accounts
  selectedAccountIds: string[];
  setSelectedAccountIds: (ids: string[]) => void;
  toggleAccountSelection: (id: string) => void;
  clearAccountSelection: () => void;

  // Additional cash for analysis
  additionalCash: number;
  setAdditionalCash: (amount: number) => void;

  // Clear all state
  clearAll: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      selectedApiClientId: null,
      selectedAccountIds: [],
      additionalCash: 0,

      setSelectedApiClient: (id) => {
        set({
          selectedApiClientId: id,
          selectedAccountIds: [], // Clear account selection when changing client
        });
      },

      setSelectedAccountIds: (ids) => {
        set({ selectedAccountIds: ids });
      },

      toggleAccountSelection: (id) => {
        const current = get().selectedAccountIds;
        set({
          selectedAccountIds: current.includes(id)
            ? current.filter((a) => a !== id)
            : [...current, id],
        });
      },

      clearAccountSelection: () => {
        set({ selectedAccountIds: [] });
      },

      setAdditionalCash: (amount) => {
        set({ additionalCash: amount });
      },

      clearAll: () => {
        set({
          selectedApiClientId: null,
          selectedAccountIds: [],
          additionalCash: 0,
        });
      },
    }),
    {
      name: "trackfolio-app-state",
    }
  )
);
