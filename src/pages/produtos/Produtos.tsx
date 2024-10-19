import { Link } from "react-router-dom";
import ListOfResult from "../../components/ListOfResult";
import { Button } from "@/components/ui/button";

const Produtos = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciamento de Produtos</h1>
      <div className="mb-4">
        <Link to="/add">
          <Button>Adicionar Produto</Button>
        </Link>
      </div>
      <ListOfResult />
    </div>
  );
};

export default Produtos;
