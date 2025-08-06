const express = require('express');
const path = require('path');
const app = express();
const PORT = 3001;

console.log(' Iniciando servidor...');

// IMPORTANTE: A ordem dos middlewares importa!
// 1. Primeiro os middlewares de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Middleware de log
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('Body da requisição:', req.body);
    }
    next();
});

// 3. Depois os arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Função para calcular IMC
function calcularIMC(peso, altura) {
    const imc = peso / (altura * altura);
    let classificacao = '';
    
    if (imc < 18.5) {
        classificacao = 'Abaixo do peso';
    } else if (imc >= 18.5 && imc < 25) {
        classificacao = 'Peso normal';
    } else if (imc >= 25 && imc < 30) {
        classificacao = 'Sobrepeso';
    } else if (imc >= 30 && imc < 35) {
        classificacao = 'Obesidade grau I';
    } else if (imc >= 35 && imc < 40) {
        classificacao = 'Obesidade grau II';
    } else {
        classificacao = 'Obesidade grau III';
    }
    
    return {
        imc: parseFloat(imc.toFixed(2)),
        classificacao: classificacao
    };
}

// Rota para calcular IMC - DEVE VIR ANTES da rota estática
app.post('/calcular-imc', (req, res) => {
    console.log(' POST /calcular-imc recebido');
    
    // Verificar se é uma requisição JSON
    if (!req.is('application/json')) {
        console.log(' Content-Type não é JSON:', req.get('Content-Type'));
        return res.status(400).json({
            erro: 'Content-Type deve ser application/json'
        });
    }
    
    try {
        console.log(' Dados recebidos:', req.body);
        
        const { nome, altura, peso } = req.body;
        
        // Validações
        if (!nome || typeof nome !== 'string' || nome.trim() === '') {
            console.log(' Nome inválido:', nome);
            return res.status(400).json({
                erro: 'Nome é obrigatório e deve ser uma string válida'
            });
        }
        
        const alturaNum = parseFloat(altura);
        const pesoNum = parseFloat(peso);
        
        if (isNaN(alturaNum) || alturaNum <= 0 || alturaNum > 3) {
            console.log(' Altura inválida:', altura);
            return res.status(400).json({
                erro: 'Altura deve ser um número entre 0.5 e 3.0 metros'
            });
        }
        
        if (isNaN(pesoNum) || pesoNum <= 0 || pesoNum > 500) {
            console.log(' Peso inválido:', peso);
            return res.status(400).json({
                erro: 'Peso deve ser um número entre 1 e 500 kg'
            });
        }
        
        // Calcular IMC
        const resultado = calcularIMC(pesoNum, alturaNum);
        
        const resposta = {
            nome: nome.trim(),
            altura: alturaNum,
            peso: pesoNum,
            imc: resultado.imc,
            classificacao: resultado.classificacao
        };
        
        console.log(' Enviando resposta:', resposta);
        
        // Garantir que está enviando JSON
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(resposta);
        
    } catch (error) {
        console.error(' Erro no servidor:', error);
        res.status(500).json({
            erro: 'Erro interno do servidor: ' + error.message
        });
    }
});

// Rota para página principal
app.get('/', (req, res) => {
    console.log(' Servindo página principal');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware para rotas não encontradas
app.use((req, res) => {
    console.log(' Rota não encontrada:', req.method, req.url);
    res.status(404).json({
        erro: `Rota ${req.method} ${req.url} não encontrada`
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log('=================================');
    console.log(` Servidor rodando em: http://localhost:${PORT}`);
    console.log(` Servindo arquivos de: ${path.join(__dirname, 'public')}`);
    console.log('=================================');
});