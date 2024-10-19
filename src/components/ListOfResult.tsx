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
import { Button } from "@/components/ui/button";

// Interface atualizada para o produto e fornecedor
interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  quantidade: number;
  imagem: string;
  fornecedorId: number;
}

interface Fornecedor {
  FornecedorID: number;
  Nome: string;
}

function ListOfResult() {
  const [result, setResult] = useState<Produto[]>([]); // Inicializar como array vazio
  const [fornecedores, setFornecedores] = useState<Record<number, string>>({}); // Estado para armazenar os fornecedores como um dicionário
  const [loading, setLoading] = useState(true); // Estado para loading
  const [error, setError] = useState<string | null>(null); // Estado para gerenciar erros

  useEffect(() => {
    // Faz o fetch para buscar os produtos
    fetch("http://localhost:3000/produtos")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erro na requisição: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data: Produto[]) => {
        setResult(data);
      })
      .catch((err) => {
        setError(`Erro ao carregar produtos: ${err.message}`);
      });
  }, []);

  useEffect(() => {
    // Faz o fetch para buscar os fornecedores
    fetch("http://localhost:3000/fornecedores")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Erro na requisição: ${res.statusText}`);
        }
        return res.json();
      })
      .then((data: Fornecedor[]) => {
        const fornecedorMap = data.reduce((map, fornecedor) => {
          map[fornecedor.FornecedorID] = fornecedor.Nome;
          return map;
        }, {} as Record<number, string>);
        setFornecedores(fornecedorMap);
        setLoading(false); // Desativa o loading
      })
      .catch((err) => {
        setError(`Erro ao carregar fornecedores: ${err.message}`);
        setLoading(false);
      });
  }, []);

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este produto?")) {
      fetch(`http://localhost:3000/produtos/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Erro ao excluir o produto: ${res.statusText}`);
          }
          setResult(result.filter((item) => item.id !== id)); // Remove o item excluído da lista
        })
        .catch((err) => {
          console.error("Erro ao excluir produto:", err);
        });
    }
  };

  if (loading) {
    return <p>Carregando produtos...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="p-4 overflow-x-auto">
      {Array.isArray(result) && result.length > 0 ? (
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Produto</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Fornecedor</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.nome}</TableCell>
                <TableCell>{item.descricao}</TableCell>
                <TableCell>{item.preco}</TableCell>
                <TableCell>{item.quantidade}</TableCell>
                <TableCell>{fornecedores[item.fornecedorId] || "Fornecedor não encontrado"}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link to={`/modify/${item.id}`}>
                      <Button variant="default" size="sm">
                        Modificar
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      Excluir
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p>Nenhum produto encontrado.</p>
      )}
    </div>
  );
}

export default ListOfResult;