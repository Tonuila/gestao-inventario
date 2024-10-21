import React from 'react';
import { Link } from 'react-router-dom';
import ListFornecedores from '../../components/ListFornecedores';
import { Button } from '@/components/ui/button';

const Fornecedores: React.FC = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Fornecedores</h1>
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
