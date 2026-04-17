import { AuthGuard } from './components/auth/AuthGuard';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import Dashboard from './components/dashboard/Dashboard';

export default function App() {
    return (
    <BrowserRouter>
      {/* 1. AuthGuard fica FORA do Routes */}
      <AuthGuard> 
        <Routes>
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </AuthGuard>
    </BrowserRouter>
  );
}
