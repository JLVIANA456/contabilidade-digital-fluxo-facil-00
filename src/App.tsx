
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import ClientManagement from '@/pages/ClientManagement';
import ClientRegistration from '@/pages/ClientRegistration';
import Controle from '@/pages/Controle';
import Relatorios from '@/pages/Relatorios';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clientes" element={<ClientRegistration />} />
        <Route path="/gestao-clientes" element={<ClientManagement />} />
        <Route path="/controle" element={<Controle />} />
        <Route path="/relatorios" element={<Relatorios />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
