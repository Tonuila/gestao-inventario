import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/home/Home';
import Produtos from './pages/produtos/Produtos';
import Fornecedores from './pages/fornecedores/Fornecedores';
import Pedidos from './pages/pedidos/Pedidos';
import ItensPedidos from './pages/itens_pedidos/ItensPedidos';
import Clientes from './pages/clientes/Clientes';
import TransacoesFinanceiras from './pages/transacoes_financeiras/TransacoesFinanceiras';
import FormData from './components/FormData';
import FormFornecedor from './components/FormFornecedor';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/produtos">Produtos</Link>
            </li>
            <li>
              <Link to="/fornecedores">Fornecedores</Link>
            </li>
            <li>
              <Link to="/pedidos">Pedidos</Link>
            </li>
            <li>
              <Link to="/itenspedidos">Itens Pedidos</Link>
            </li>
            <li>
              <Link to="/clientes">Clientes</Link>
            </li>
            <li>
              <Link to="/transacoes">Transações Financeiras</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produtos" element={<Produtos />} />
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