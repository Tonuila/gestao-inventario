import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState } from 'react';
import Home from './pages/home/Home';
import Produtos from './pages/produtos/Produtos';
import Fornecedores from './pages/fornecedores/Fornecedores';
import Pedidos from './pages/pedidos/Pedidos';
import ItensPedidos from './pages/itens_pedidos/ItensPedidos';
import Clientes from './pages/clientes/Clientes';
import TransacoesFinanceiras from './pages/transacoes_financeiras/TransacoesFinanceiras';
import FormData from './components/FormData';
import FormFornecedor from './components/FormFornecedor';
import Sobre from './pages/sobre/Sobre';
import './App.css';

function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <Router>
      <div className="App">
      <nav>
          <div className="nav-container">
            <div className="logo">
              <Link to="/">PreTeX</Link>
            </div>
            <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
              <ul>
                <li>
                  <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
                </li>
                <li>
                  <Link to="/sobre" onClick={() => setMenuOpen(false)}>Sobre</Link>
                </li>
                <li>
                  <Link to="/produtos" onClick={() => setMenuOpen(false)}>Produtos</Link>
                </li>
                <li>
                  <Link to="/fornecedores" onClick={() => setMenuOpen(false)}>Fornecedores</Link>
                </li>
                <li>
                  <Link to="/pedidos" onClick={() => setMenuOpen(false)}>Pedidos</Link>
                </li>
                <li>
                  <Link to="/itenspedidos" onClick={() => setMenuOpen(false)}>Itens Pedidos</Link>
                </li>
                <li>
                  <Link to="/clientes" onClick={() => setMenuOpen(false)}>Clientes</Link>
                </li>
                <li>
                  <Link to="/transacoes" onClick={() => setMenuOpen(false)}>Transações Financeiras</Link>
                </li>
              </ul>
            </div>
            <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
              <div className="bar1"></div>
              <div className="bar2"></div>
              <div className="bar3"></div>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/fornecedores" element={<Fornecedores />} />
          <Route path="/fornecedor/new" element={<FormFornecedor />} />
          <Route path="/fornecedor/edit/:FornecedorID" element={<FormFornecedor />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/itenspedidos" element={<ItensPedidos />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/transacoes" element={<TransacoesFinanceiras />} />
          <Route path="/modify/:ProductID" element={<FormData />} />
          <Route path="/add" element={<FormData />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;