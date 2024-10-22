import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/Home';
import Produtos from './pages/Produtos';
import Fornecedores from './pages/Fornecedores';
import Pedidos from './pages/Pedidos';
import ItensPedidos from './pages/ItensPedidos';
import Clientes from './pages/Clientes';
import TransacoesFinanceiras from './pages/TransacoesFinanceiras';
import FormData from './components/FormData';
import FormFornecedor from './components/FormFornecedor';
import Sobre from './pages/Sobre';
import './App.css';
import Login from './pages/Login';
import Registro from './pages/Registro';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Button } from "@/components/ui/button";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth(); // Obtém o usuário e a função logout do AuthContext

  const handleLogout = () => {
    logout(); // Chama o logout do contexto
  };

  return (
    <div className="App">
      <nav>
        <div className="nav-container">
          <div className="logo">
            <Link to="/">PreTeX</Link>
          </div>

          {/* Menu Links */}
          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <ul>
              <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
              <li><Link to="/sobre" onClick={() => setMenuOpen(false)}>Sobre</Link></li>

              {user && (
                <>
                  <li><Link to="/produtos" onClick={() => setMenuOpen(false)}>Produtos</Link></li>
                  <li><Link to="/fornecedores" onClick={() => setMenuOpen(false)}>Fornecedores</Link></li>
                  <li><Link to="/pedidos" onClick={() => setMenuOpen(false)}>Pedidos</Link></li>
                  <li><Link to="/itenspedidos" onClick={() => setMenuOpen(false)}>Itens Pedidos</Link></li>
                  <li><Link to="/clientes" onClick={() => setMenuOpen(false)}>Clientes</Link></li>
                  <li><Link to="/transacoes" onClick={() => setMenuOpen(false)}>Transações Financeiras</Link></li>
                </>
              )}

              {/* Adiciona o Login/Logout dentro do menu no modo responsivo */}
              <li className="auth-link">
                {user ? (
                  <Button onClick={() => { handleLogout(); setMenuOpen(false); }}>Logout</Button>
                ) : (
                  <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
                )}
              </li>
            </ul>
          </div>

          {/* Menu Icon */}
          <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
            <div className="bar1"></div>
            <div className="bar2"></div>
            <div className="bar3"></div>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={<Registro />} />

        {/* Rotas protegidas */}
        <Route path="/produtos" element={user ? <Produtos /> : <Navigate to="/login" />} />
        <Route path="/fornecedores" element={user ? <Fornecedores /> : <Navigate to="/login" />} />
        
        {/* Apenas admin pode criar e editar fornecedores */}
        <Route path="/fornecedor/new" element={user && user.role === 'admin' ? <FormFornecedor /> : <Navigate to="/login" />} />
        <Route path="/fornecedor/edit/:FornecedorID" element={user && user.role === 'admin' ? <FormFornecedor /> : <Navigate to="/login" />} />
        
        <Route path="/pedidos" element={user ? <Pedidos /> : <Navigate to="/login" />} />
        <Route path="/itenspedidos" element={user ? <ItensPedidos /> : <Navigate to="/login" />} />
        <Route path="/clientes" element={user ? <Clientes /> : <Navigate to="/login" />} />
        <Route path="/transacoes" element={user ? <TransacoesFinanceiras /> : <Navigate to="/login" />} />
        <Route path="/modify/:ProductID" element={user ? <FormData /> : <Navigate to="/login" />} />
        <Route path="/add" element={user ? <FormData /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

function RootApp() {
  return (
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  );
}

export default RootApp;