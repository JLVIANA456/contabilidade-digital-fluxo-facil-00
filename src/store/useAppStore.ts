
import { create } from 'zustand';
import { Cliente } from '@/pages/Index';

interface AppState {
  clientes: Cliente[];
  clienteSelecionado: Cliente | null;
  sidebarOpen: boolean;
  setClientes: (clientes: Cliente[]) => void;
  addCliente: (cliente: Cliente) => void;
  updateCliente: (cliente: Cliente) => void;
  deleteCliente: (clienteId: string) => void;
  inactivateCliente: (clienteId: string, dataSaida: string) => void;
  setClienteSelecionado: (cliente: Cliente | null) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  clientes: [],
  clienteSelecionado: null,
  sidebarOpen: true,
  
  setClientes: (clientes) => {
    set({ clientes });
    localStorage.setItem('clientes-contabilidade', JSON.stringify(clientes));
  },
  
  addCliente: (cliente) => {
    const newClientes = [...get().clientes, cliente];
    set({ clientes: newClientes });
    localStorage.setItem('clientes-contabilidade', JSON.stringify(newClientes));
  },
  
  updateCliente: (clienteAtualizado) => {
    const newClientes = get().clientes.map(c => 
      c.id === clienteAtualizado.id ? clienteAtualizado : c
    );
    set({ 
      clientes: newClientes,
      clienteSelecionado: clienteAtualizado 
    });
    localStorage.setItem('clientes-contabilidade', JSON.stringify(newClientes));
  },

  deleteCliente: (clienteId) => {
    const newClientes = get().clientes.filter(c => c.id !== clienteId);
    set({ 
      clientes: newClientes,
      clienteSelecionado: get().clienteSelecionado?.id === clienteId ? null : get().clienteSelecionado
    });
    localStorage.setItem('clientes-contabilidade', JSON.stringify(newClientes));
  },

  inactivateCliente: (clienteId, dataSaida) => {
    const newClientes = get().clientes.map(c => 
      c.id === clienteId ? { ...c, dataSaida, ativo: false } : c
    );
    set({ 
      clientes: newClientes,
      clienteSelecionado: get().clienteSelecionado?.id === clienteId 
        ? { ...get().clienteSelecionado!, dataSaida, ativo: false }
        : get().clienteSelecionado
    });
    localStorage.setItem('clientes-contabilidade', JSON.stringify(newClientes));
  },
  
  setClienteSelecionado: (cliente) => set({ clienteSelecionado: cliente }),
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));
