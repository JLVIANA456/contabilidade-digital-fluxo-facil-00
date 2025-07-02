
import { create } from 'zustand';
import { Cliente } from '@/hooks/useClientes';

interface AppState {
  clienteSelecionado: Cliente | null;
  sidebarOpen: boolean;
  setClienteSelecionado: (cliente: Cliente | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  clienteSelecionado: null,
  sidebarOpen: true,
  
  setClienteSelecionado: (cliente) => set({ clienteSelecionado: cliente }),
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
