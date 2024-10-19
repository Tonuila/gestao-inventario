import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Fornecedor {
  FornecedorID: number;
  Nome: string;
  CNPJ: string;
  Contato: string;
  Endereco: string;
}

function ListFornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [filtro, setFiltro] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/fornecedores")
      .then((res) => res.json())
      .then((data: Fornecedor[]) => {
        setFornecedores(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este fornecedor?")) {
      fetch(`http://localhost:3000/fornecedor/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => {
          if (res.ok) {
            setFornecedores(fornecedores.filter((item) => item.FornecedorID !== id));
          } else {
            alert("Erro ao tentar excluir o fornecedor. Verifique se ele está associado a produtos.");
          }
        })
        .catch((err) => console.error(err));
    }
  };

  const fornecedoresFiltrados = fornecedores.filter(
    (fornecedor) =>
      fornecedor.Nome.toLowerCase().includes(filtro.toLowerCase()) ||
      fornecedor.Contato.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="p-4 overflow-x-auto">
      <div className="mb-4">
        <Input
          type="text"
          placeholder="Filtrar por nome ou contato"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>
      <Table className="w-full">
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>CNPJ</TableHead>
            <TableHead>Contato</TableHead>
            <TableHead>Endereço</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fornecedoresFiltrados.map((fornecedor) => (
            <TableRow key={fornecedor.FornecedorID}>
              <TableCell>{fornecedor.Nome}</TableCell>
              <TableCell>{fornecedor.CNPJ}</TableCell>
              <TableCell>{fornecedor.Contato}</TableCell>
              <TableCell>{fornecedor.Endereco}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Link to={`/fornecedor/edit/${fornecedor.FornecedorID}`}>
                    <Button variant="default" size="sm">
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(fornecedor.FornecedorID)}
                  >
                    Excluir
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default ListFornecedores;