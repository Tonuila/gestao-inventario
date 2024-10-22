const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const bcrypt = require('bcryptjs');

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

// Criação da tabela Usuários
db.run(
  `CREATE TABLE IF NOT EXISTS Usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    role TEXT CHECK(role IN ('admin', 'user')) DEFAULT 'user'
  )`,
  (err) => {
    if (err) {
      console.error('Erro ao criar a tabela Usuários:', err.message);
    } else {
      console.log('Tabela Usuários criada com sucesso.');
    }
  }
);

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

// Registro de usuário
app.post('/register', (req, res) => {
  const { nome, email, senha, role } = req.body;
  if (!nome || !email || !senha) {
    return res.status(400).send('Todos os campos são obrigatórios.');
  }

  bcrypt.hash(senha, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).send('Erro ao gerar hash da senha.');
    }
    db.run(
      `INSERT INTO Usuarios (nome, email, senha, role) VALUES (?, ?, ?, ?)`,
      [nome, email, hashedPassword, role || 'user'],
      function (err) {
        if (err) {
          return res.status(500).send('Erro ao registrar o usuário.');
        }
        res.status(201).send('Usuário registrado com sucesso!');
      }
    );
  });
});

// Login de usuário
app.post('/login', (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).send('Email e senha são obrigatórios.');
  }

  db.get(`SELECT * FROM Usuarios WHERE email = ?`, [email], (err, user) => {
    if (err || !user) {
      return res.status(401).send('Usuário não encontrado.');
    }

    bcrypt.compare(senha, user.senha, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).send('Credenciais inválidas.');
      }
      res.json({ user: { id: user.id, name: user.nome, role: user.role } });
    });
  });
});

// Rotas para Produtos (sem token de autenticação)
app.get('/produtos', (req, res) => {
  const { nome, fornecedorId, ordemPreco } = req.query;
  let query = `
    SELECT Produtos.*, Fornecedores.Nome AS fornecedorNome 
    FROM Produtos
    LEFT JOIN Fornecedores ON Produtos.fornecedorId = Fornecedores.FornecedorID
    WHERE 1 = 1
  `;
  const queryParams = [];

  if (nome) {
    query += ' AND Produtos.nome LIKE ?';
    queryParams.push(`%${nome}%`);
  }
  if (fornecedorId) {
    query += ' AND Produtos.fornecedorId = ?';
    queryParams.push(fornecedorId);
  }
  if (ordemPreco) {
    query += ` ORDER BY Produtos.preco ${ordemPreco === 'asc' ? 'ASC' : 'DESC'}`;
  }

  db.all(query, queryParams, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(rows);
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
        res.status(500).json({ error: err.message });
      } else {
        res.status(201).json({ success: true, id: this.lastID });
      }
    }
  );
});

app.put('/produtos/:id', upload.single('imagem'), (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, quantidade, fornecedorId } = req.body;
  let imagem = req.file ? `/uploads/${req.file.filename}` : null;

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

// Rotas para Fornecedores (sem token de autenticação)
app.get('/fornecedores', (req, res) => {
  db.all('SELECT * FROM Fornecedores', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json(rows);
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

// Rota para listar todos os usuários cadastrados com suas senhas em hash
app.get('/usuarios', (req, res) => {
  const query = 'SELECT id, nome, email, senha, role FROM Usuarios';
  
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    res.status(200).json(rows);
  });
});


// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor escutando no porto ${port}`);
});