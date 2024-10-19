const http = require("http");
const sqlite3 = require("sqlite3").verbose();
const url = require("url");

// Cria uma conexão com o banco de dados empresa.db. Se não existir, ele será criado.
const db = new sqlite3.Database("empresa.db", (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log("Conexão estabelecida com sucesso.");
  }
});

// Verifica se a tabela Fornecedores já existe e a recria corretamente.
db.run(
  `CREATE TABLE IF NOT EXISTS Fornecedores(
    FornecedorID INTEGER PRIMARY KEY AUTOINCREMENT,
    Nome TEXT NOT NULL,
    CNPJ TEXT UNIQUE NOT NULL,
    Contato TEXT,
    Endereco TEXT
  )`,
  (err) => {
    if (err) {
      console.error("Erro ao criar a tabela Fornecedores:", err.message);
    } else {
      console.log("Tabela Fornecedores criada com sucesso.");
    }
  }
);

// Verifica se a tabela Produtos já existe e a recria corretamente com os nomes das colunas atualizados
db.run(
  `CREATE TABLE IF NOT EXISTS Produtos(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco FLOAT,
    quantidade INTEGER,
    imagem TEXT,
    fornecedorId INTEGER NOT NULL,
    FOREIGN KEY (fornecedorId) REFERENCES Fornecedores(FornecedorID)
  )`,
  (err) => {
    if (err) {
      console.error("Erro ao criar a tabela Produtos:", err.message);
    } else {
      console.log("Tabela Produtos criada com sucesso.");
    }
  }
);

// Função para buscar todos os fornecedores.
const searchFornecedores = (callback) => {
  db.all("SELECT * FROM Fornecedores", (err, rows) => {
    if (err) {
      console.error(err);
      callback(err, null);
    } else {
      callback(null, rows);
    }
  });
};

// Função para buscar todos os produtos.
const searchProdutos = (callback) => {
  const query = `
    SELECT Produtos.*, Fornecedores.Nome AS fornecedorNome 
    FROM Produtos
    LEFT JOIN Fornecedores ON Produtos.fornecedorId = Fornecedores.FornecedorID
  `;
  db.all(query, (err, rows) => {
    if (err) {
      console.error(err);
      callback(err, null);
    } else {
      callback(null, rows);
    }
  });
};

// Cria o servidor HTTP.
const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Configura os cabeçalhos CORS.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Manipula a requisição OPTIONS (Preflight Request)
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === "GET") {
    if (pathname === "/produtos") {
      // Retorna todos os produtos.
      searchProdutos((err, result) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));
        }
      });
    } else if (pathname === "/fornecedores") {
      // Retorna todos os fornecedores.
      searchFornecedores((err, result) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));
        }
      });
    } else if (pathname.startsWith("/produtos/")) {
      // Retorna um produto específico.
      const id = pathname.split("/")[2];
      db.get("SELECT * FROM Produtos WHERE id = ?", [id], (err, row) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        } else if (!row) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Produto não encontrado." }));
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(row));
        }
      });
    } else if (pathname.startsWith("/fornecedores/")) {
      // Retorna um fornecedor específico.
      const id = pathname.split("/")[2];
      db.get("SELECT * FROM Fornecedores WHERE FornecedorID = ?", [id], (err, row) => {
        if (err) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: err.message }));
        } else if (!row) {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Fornecedor não encontrado." }));
        } else {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(row));
        }
      });
    } else {
      // Rota não encontrada.
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Rota não encontrada." }));
    }
  } else if (req.method === "POST" && pathname === "/produtos") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      const parsedBody = JSON.parse(body);
      // Usa a consulta preparada para inserir os dados recebidos do Frontend.
      db.run(
        `INSERT INTO Produtos (nome, descricao, preco, quantidade, imagem, fornecedorId)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          parsedBody.nome,
          parsedBody.descricao,
          parsedBody.preco,
          parsedBody.quantidade,
          parsedBody.imagem,
          parsedBody.fornecedorId
        ],
        function (err) {
          if (err) {
            console.error(err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: err.message }));
          } else {
            console.log("Produto criado com sucesso.");
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, id: this.lastID }));
          }
        }
      );
    });
  } else if (req.method === "POST" && pathname === "/fornecedores") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      const parsedBody = JSON.parse(body);
      db.run(
        `INSERT INTO Fornecedores (Nome, CNPJ, Contato, Endereco) VALUES (?, ?, ?, ?)`,
        [parsedBody.Nome, parsedBody.CNPJ, parsedBody.Contato, parsedBody.Endereco],
        function (err) {
          if (err) {
            console.error(err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: err.message }));
          } else {
            console.log("Fornecedor criado com sucesso.");
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true, id: this.lastID }));
          }
        }
      );
    });
  } else if (req.method === "PUT" && pathname.startsWith("/produtos/")) {
    const id = pathname.split("/")[2];
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      const parsedBody = JSON.parse(body);
      db.run(
        `UPDATE Produtos
         SET nome = ?, descricao = ?, preco = ?, quantidade = ?, imagem = ?, fornecedorId = ?
         WHERE id = ?`,
        [
          parsedBody.nome,
          parsedBody.descricao,
          parsedBody.preco,
          parsedBody.quantidade,
          parsedBody.imagem,
          parsedBody.fornecedorId,
          id
        ],
        function (err) {
          if (err) {
            console.error(err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: err.message }));
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true }));
          }
        }
      );
    });
  } else if (req.method === "PUT" && pathname.startsWith("/fornecedores/")) {
    const id = pathname.split("/")[2];
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      const parsedBody = JSON.parse(body);
      db.run(
        `UPDATE Fornecedores
         SET Nome = ?, CNPJ = ?, Contato = ?, Endereco = ?
         WHERE FornecedorID = ?`,
        [parsedBody.Nome, parsedBody.CNPJ, parsedBody.Contato, parsedBody.Endereco, id],
        function (err) {
          if (err) {
            console.error(err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: err.message }));
          } else {
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true }));
          }
        }
      );
    });
  } else {
    // Método não permitido ou rota não encontrada.
    res.writeHead(405, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Método não permitido ou rota não encontrada." }));
  }
});

const port = 3000;
server.listen(port);
console.log(`Servidor escutando no porto ${port}`);
