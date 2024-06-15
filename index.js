import express from 'express';
import session from 'express-session';
import path from 'path';
import cookieParser from 'cookie-parser';

const host='0.0.0.0';
const porta=3000;

let animais= [];
let usuarioAutenticado= false;

const app=express();
app.use(session({
    secret: '2305',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000*60*30
    }
}));
app.use(cookieParser());
app.use(express.urlencoded({extended: true}));

app.use(express.static(path.join(process.cwd(), 'publico')));
app.use(usuarioEstaAutenticado,express.static(path.join(process.cwd(), 'protegido')));

function usuarioEstaAutenticado(requisicao, resposta, next){
    if(usuarioAutenticado){
        next();
    }
    else{
        resposta.redirect('login.html');
    }
}

app.listen(porta, host,() => {
    console.log(`O servidor está executando em https://${host}:${porta}`);
});