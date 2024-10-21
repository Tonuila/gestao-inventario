const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

// Configuração do servidor Express
const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Middleware para permitir CORS
app.use(cors());

// Servir arquivos estáticos da pasta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuração do banco de dados SQLite
const db = new sqlite3.Database('empresa.db', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados:', err);
  } else {
    console.log('Conexão estabelecida com sucesso.');
  }
});

// Criação da tabela Fornecedores
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
      console.error('Erro ao criar a tabela Fornecedores:', err.message);
    } else {
      console.log('Tabela Fornecedores criada com sucesso.');
    }
  }
);

// Criação da tabela Produtos
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
      console.error('Erro ao criar a tabela Produtos:', err.message);
    } else {
      console.log('Tabela Produtos criada com sucesso.');
    }
  }
);

// Configuração do armazenamento de imagens com Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Gera um nome único para o arquivo
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Função para buscar todos os fornecedores
const searchFornecedores = (callback) => {
  db.all('SELECT * FROM Fornecedores', (err, rows) => {
    if (err) {
      console.error('Erro ao buscar fornecedores:', err);
      callback(err, null);
    } else {
      callback(null, rows);
    }
  });
};

// Função para buscar produtos com filtros
const searchProdutos = (filters, callback) => {
  let query = `
    SELECT Produtos.*, Fornecedores.Nome AS fornecedorNome 
    FROM Produtos
    LEFT JOIN Fornecedores ON Produtos.fornecedorId = Fornecedores.FornecedorID
    WHERE 1 = 1
  `;
  const queryParams = [];

  // Filtrar por nome
  if (filters.nome) {
    query += ' AND Produtos.nome LIKE ?';
    queryParams.push(`%${filters.nome}%`);
  }

  // Filtrar por fornecedor
  if (filters.fornecedorId) {
    query += ' AND Produtos.fornecedorId = ?';
    queryParams.push(filters.fornecedorId);
  }

  // Ordenar por preço
  if (filters.ordemPreco) {
    query += ` ORDER BY Produtos.preco ${filters.ordemPreco === 'asc' ? 'ASC' : 'DESC'}`;
  }

  db.all(query, queryParams, (err, rows) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, rows);
    }
  });
};

// Rotas para Produtos
app.get('/produtos', (req, res) => {
  const { nome, fornecedorId, ordemPreco } = req.query;

  const filters = {
    nome,
    fornecedorId,
    ordemPreco,
  };

  searchProdutos(filters, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(result);
    }
  });
});

app.get('/produtos/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM Produtos WHERE id = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Produto não encontrado.' });
    } else {
      res.status(200).json(row);
    }
  });
});

app.post('/produtos', upload.single('imagem'), (req, res) => {
  const { nome, descricao, preco, quantidade, fornecedorId } = req.body;
  const imagem = req.file ? `/uploads/${req.file.filename}` : null;

  db.run(
    `INSERT INTO Produtos (nome, descricao, preco, quantidade, imagem, fornecedorId)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [nome, descricao, preco, quantidade, imagem, fornecedorId],
    function (err) {
      if (err) {
        console.error('Erro ao inserir produto:', err);
        res.status(500).json({ error: err.message });
      } else {
        console.log('Produto criado com sucesso.');
        res.status(201).json({ success: true, id: this.lastID });
      }
    }
  );
});

app.put('/produtos/:id', upload.single('imagem'), (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, quantidade, fornecedorId } = req.body;
  let imagem = req.file ? `/uploads/${req.file.filename}` : null;

  // Se nenhuma nova imagem for enviada, manter a imagem existente
  if (!imagem) {
    db.get('SELECT imagem FROM Produtos WHERE id = ?', [id], (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        imagem = row.imagem;
        atualizarProduto();
      }
    });
  } else {
    atualizarProduto();
  }

  function atualizarProduto() {
    db.run(
      `UPDATE Produtos
       SET nome = ?, descricao = ?, preco = ?, quantidade = ?, imagem = ?, fornecedorId = ?
       WHERE id = ?`,
      [nome, descricao, preco, quantidade, imagem, fornecedorId, id],
      function (err) {
        if (err) {
          console.error('Erro ao atualizar produto:', err);
          res.status(500).json({ error: err.message });
        } else {
          res.status(200).json({ success: true });
        }
      }
    );
  }
});

app.delete('/produtos/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM Produtos WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('Erro ao excluir produto:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ success: true });
    }
  });
});

// Rotas para Fornecedores
app.get('/fornecedores', (req, res) => {
  searchFornecedores((err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(result);
    }
  });
});

app.get('/fornecedores/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM Fornecedores WHERE FornecedorID = ?', [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else if (!row) {
      res.status(404).json({ error: 'Fornecedor não encontrado.' });
    } else {
      res.status(200).json(row);
    }
  });
});

app.post('/fornecedores', (req, res) => {
  const { Nome, CNPJ, Contato, Endereco } = req.body;
  db.run(
    `INSERT INTO Fornecedores (Nome, CNPJ, Contato, Endereco) VALUES (?, ?, ?, ?)`,
    [Nome, CNPJ, Contato, Endereco],
    function (err) {
      if (err) {
        console.error('Erro ao inserir fornecedor:', err);
        res.status(500).json({ error: err.message });
      } else {
        console.log('Fornecedor criado com sucesso.');
        res.status(201).json({ success: true, id: this.lastID });
      }
    }
  );
});

app.put('/fornecedores/:id', (req, res) => {
  const { id } = req.params;
  const { Nome, CNPJ, Contato, Endereco } = req.body;
  db.run(
    `UPDATE Fornecedores
     SET Nome = ?, CNPJ = ?, Contato = ?, Endereco = ?
     WHERE FornecedorID = ?`,
    [Nome, CNPJ, Contato, Endereco, id],
    function (err) {
      if (err) {
        console.error('Erro ao atualizar fornecedor:', err);
        res.status(500).json({ error: err.message });
      } else {
        res.status(200).json({ success: true });
      }
    }
  );
});

app.delete('/fornecedores/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM Fornecedores WHERE FornecedorID = ?', [id], function (err) {
    if (err) {
      console.error('Erro ao excluir fornecedor:', err);
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ success: true });
    }
  });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor escutando no porto ${port}`);
});
