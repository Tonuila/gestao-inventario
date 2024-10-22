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
import { useAuth } from '@/context/AuthContext'; // Importando o contexto para verificar o papel do usuário

// Interface para representar um fornecedor
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
  const { user } = useAuth(); // Obtenha o papel do usuário

  useEffect(() => {
    // Buscar a lista de fornecedores
    fetch("http://localhost:3000/fornecedores", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao carregar fornecedores");
        return res.json();
      })
      .then((data: Fornecedor[]) => {
        setFornecedores(data);
      })
      .catch((err) => console.error("Erro ao carregar fornecedores:", err));
  }, []);

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este fornecedor?")) {
      // Excluir fornecedor
      fetch(`http://localhost:3000/fornecedores/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          if (res.ok) {
            setFornecedores(fornecedores.filter((item) => item.FornecedorID !== id));
          } else {
            alert("Erro ao tentar excluir o fornecedor. Verifique se ele está associado a produtos.");
          }
        })
        .catch((err) => console.error("Erro ao excluir fornecedor:", err));
    }
  };

  // Filtra os fornecedores pelo nome ou contato
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
                  {user && user.role === 'admin' && (
                    <>
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
                    </>
                  )}
                  {/* Usuário comum (user) não verá as opções de edição e exclusão */}
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