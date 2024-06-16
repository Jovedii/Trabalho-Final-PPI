import express from 'express';
import session from 'express-session';
import path from 'path';
import cookieParser from 'cookie-parser';

const host = '0.0.0.0';
const porta = 3000;

let animais = [];
let interessados = [];
let adocoes = [];
const app = express();
app.use(session({
    secret: '23052004',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30
    }
}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.post('/login', autenticarUsuario);
app.get('/login', (req, resp) => {
    resp.redirect('/login.html');
});
app.get('/logout', (req, resp) => {
    req.session.destroy();
    resp.redirect('/login.html');
});

app.use(express.static(path.join(process.cwd(), 'publico')));
app.use(usuarioEstaAutenticado, express.static(path.join(process.cwd(), 'protegido')));

function usuarioEstaAutenticado(req, res, next) {
    if (req.session.usuarioEstaAutenticado) {
        next();
    } else {
        res.redirect('/login.html');
    }
}

function autenticarUsuario(req, res) {
    const usuario = req.body.usuario;
    const senha = req.body.senha;
    if (usuario === 'gui' && senha === '2305') {
        req.session.usuarioEstaAutenticado = true;
        res.cookie('ultimoAcesso', new Date().toLocaleString(), {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 30
        });
        res.redirect('menu.html');
    } else {
        res.write('<!DOCTYPE html><html lang="pt-br"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>ERRO DE LOGIN</title><style>body{color: white; background-color: gray;}</style></head><body>');
        res.write('<p>Usuário ou Senha inválidos!<p>');
        res.write('<input type="button" value="VOLTAR" onclick="history.go(-1)"/>');
        if (req.cookies.ultimoAcesso) {
            res.write('<p>');
            res.write(`Seu último acesso foi em ${req.cookies.ultimoAcesso}`);
            res.write('</p>');
        }
        res.end();
    }
}

app.get('menu.html', usuarioEstaAutenticado, (req, res) => {
    res.sendFile(path.join(__dirname, 'protegido', 'menu.html'));
});

app.post('/cadastroInteressados', (req, res) => {
    const { nome, email, telefone } = req.body;
    if (nome && email && telefone) {
        interessados.push({ nome, email, telefone });
        console.log('Novo interessado cadastrado:', { nome, email, telefone });
        res.redirect('listaDados.html');
    } else {
        res.status(400).send('Todos os campos são obrigatórios!');
    }
});

app.post('/cadastroPets', (req, res) => {
    const { nome, raca, idade } = req.body;
    if (nome && raca && idade) {
        animais.push({ nome, raca, idade });
        console.log('Novo pet cadastrado:', { nome, raca, idade });
        res.redirect('listaDados.html');
    } else {
        res.status(400).send('Todos os campos são obrigatórios!');
    }
});

app.get('/dadosInteressados', usuarioEstaAutenticado, (req, res) => {
    res.json(interessados);
});

app.get('/dadosPets', usuarioEstaAutenticado, (req, res) => {
    res.json(animais);
});

app.delete('/excluirInteressado/:id', usuarioEstaAutenticado, (req, res) => {
    const id = req.params.id;
    if (interessados[id]) {
        interessados.splice(id, 1);
        res.sendStatus(204);
    } else {
        res.status(404).send('Interessado não encontrado');
    }
});

app.delete('/excluirPet/:id', usuarioEstaAutenticado, (req, res) => {
    const id = req.params.id;
    if (animais[id]) {
        animais.splice(id, 1);
        res.sendStatus(204);
    } else {
        res.status(404).send('Pet não encontrado');
    }
});

app.get('/dadosAdocoes', usuarioEstaAutenticado, (req, res) => {
    res.json(adocoes);
});

app.post('/cadastroAdocao', (req, res) => {
    const { interessado, pet } = req.body;
    const data = new Date().toLocaleString();
    if (interessado && pet) {
        adocoes.push({ interessado, pet, data });
        res.redirect('listaDados.html');
    } else {
        res.status(400).send('Todos os campos são obrigatórios!');
    }
});

app.delete('/excluirAdocao/:id', usuarioEstaAutenticado, (req, res) => {
    const id = req.params.id;
    if (adocoes[id]) {
        adocoes.splice(id, 1);
        res.sendStatus(204);
    } else {
        res.status(404).send('Adoção não encontrada');
    }
});

app.listen(porta, host, () => {
    console.log(`O servidor está executando em http://${host}:${porta}`);
});