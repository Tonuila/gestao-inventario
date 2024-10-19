import React from 'react';
import { Link } from 'react-router-dom';
import ListFornecedores from '../../components/ListFornecedores';
import { Button } from '@/components/ui/button';

const Fornecedores: React.FC = () => {
  return (
    <div>
      <h1>Fornecedores</h1>
      <p>Gerencie seus fornecedores aqui.</p>
      <div className="my-4">
        <Link to="/fornecedor/new">
          <Button variant="default">Adicionar Novo Fornecedor</Button>
        </Link>
      </div>
      <ListFornecedores />
    </div>
  );
};

export default Fornecedores;
