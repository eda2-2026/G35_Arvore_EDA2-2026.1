# G35_Arvore_EDA2-2026.1

## Sistema Hospitalar com Arvore Rubro-Negra

Este projeto simula um indexador hospitalar de pacientes usando uma **Arvore Rubro-Negra** como estrutura principal. A ideia e permitir que medicos e equipes administrativas encontrem rapidamente o prontuario de um paciente pelo CPF.

Na proposta original, o sistema poderia tambem usar grafos para mapear contatos entre pacientes. Nesta versao do trabalho, o foco ficou na **estrutura de arvore**, responsavel por cadastrar, buscar e visualizar pacientes de forma eficiente.

## Objetivo

Um sistema hospitalar real precisa consultar pacientes com agilidade, mesmo quando existem muitos registros. Para isso, o CPF do paciente e usado como chave de indexacao dentro da Arvore Rubro-Negra.

Com essa estrutura, as principais operacoes ficam eficientes:

| Operacao | Complexidade esperada |
| --- | --- |
| Cadastro de paciente | O(log n) |
| Busca por CPF | O(log n) |
| Organizacao do indice | O(log n) por insercao |

## Funcionalidades

- Cadastro de pacientes com CPF, nome, idade e prontuario.
- Validacao basica de CPF com 11 digitos numericos.
- Busca instantanea de paciente pelo CPF.
- Visualizacao do prontuario encontrado.
- Renderizacao visual da Arvore Rubro-Negra.
- Destaque das cores dos nos: vermelho e preto.
- Lista dos CPFs em ordem crescente.
- Botao para carregar dados demonstrativos.
- Painel com metricas da arvore:
  - total de pacientes;
  - altura da arvore;
  - quantidade de nos vermelhos;
  - quantidade de nos pretos.

## Estrutura de Dados Utilizada

### Arvore Rubro-Negra

A Arvore Rubro-Negra e uma arvore binaria de busca balanceada. Cada no possui uma cor, vermelho ou preto, e a estrutura aplica rotacoes e recoloracoes apos insercoes para manter o balanceamento.

No projeto, cada no representa um paciente:

```text
CPF -> chave de busca
Nome -> identificacao do paciente
Idade -> idade do paciente
Prontuario -> historico clinico
Cor -> cor do no na Arvore Rubro-Negra
```

O CPF e comparado como string numerica de 11 digitos. Assim, a arvore consegue decidir se o novo paciente deve ir para a subarvore esquerda ou direita.

## Tecnologias

- Python
- Flask
- Flask-CORS
- HTML
- CSS
- JavaScript
- SVG para visualizacao da arvore

## Estrutura do Projeto

```text
G35_Arvore_EDA2-2026.1/
|-- app.py
|-- requirements.txt
|-- README.md
`-- static/
    |-- index.html
    |-- script.js
    |-- style.css
    `-- tree.js
```

### Arquivos principais

| Arquivo | Funcao |
| --- | --- |
| `app.py` | Backend Flask e implementacao da Arvore Rubro-Negra |
| `static/index.html` | Estrutura da interface web |
| `static/style.css` | Estilos visuais e responsividade |
| `static/script.js` | Integracao do frontend com a API |
| `static/tree.js` | Renderizacao da arvore em SVG |
| `requirements.txt` | Dependencias Python do projeto |

## Como Rodar o Projeto

### 1. Clonar ou abrir a pasta do projeto

Entre na pasta do projeto pelo terminal:

```powershell
cd caminho\para\G35_Arvore_EDA2-2026.1
```

Exemplo:

```powershell
cd C:\Users\Carlos\Documents\G35_Arvore_EDA2-2026.1
```

### 2. Criar um ambiente virtual

No Windows:

```powershell
python -m venv .venv
```

Ativar o ambiente virtual:

```powershell
.\.venv\Scripts\activate
```

No Linux/macOS:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Instalar as dependencias

Com o ambiente virtual ativado, rode:

```powershell
pip install -r requirements.txt
```

### 4. Iniciar o servidor

```powershell
python app.py
```

Se tudo estiver certo, o terminal deve mostrar que o Flask iniciou em:

```text
http://localhost:5000
```

### 5. Abrir no navegador

Acesse:

```text
http://localhost:5000
```

## Alternativa com uv

Caso o comando `python` nao esteja configurado corretamente no Windows, tambem e possivel rodar usando `uv`:

```powershell
uv run --python 3.14 --with flask==3.1.0 --with flask-cors==5.0.1 python app.py
```

Depois acesse:

```text
http://localhost:5000
```

## Como Usar a Interface

### Cadastrar paciente

1. Preencha CPF, idade, nome completo e prontuario.
2. Clique em **Cadastrar no indice**.
3. O paciente sera inserido na Arvore Rubro-Negra.
4. A visualizacao da arvore sera atualizada automaticamente.

### Buscar paciente

1. Digite o CPF no campo de busca no topo da tela.
2. Clique em **Buscar**.
3. Se o CPF existir, o prontuario sera exibido e o no correspondente sera destacado na arvore.

### Carregar dados de demonstracao

Clique em **Dados demo** para inserir varios pacientes ficticios e visualizar a arvore preenchida.

## Endpoints da API

### Cadastrar paciente

```http
POST /api/paciente
```

Corpo da requisicao:

```json
{
  "cpf": "12345678901",
  "nome": "Paciente Exemplo",
  "idade": 35,
  "prontuario": "Historico clinico do paciente."
}
```

Resposta esperada:

```json
{
  "sucesso": true,
  "mensagem": "Paciente inserido com sucesso.",
  "dados": {
    "cpf": "12345678901",
    "nome": "Paciente Exemplo",
    "idade": 35,
    "prontuario": "Historico clinico do paciente.",
    "cor": "PRETO"
  }
}
```

### Buscar paciente por CPF

```http
GET /api/paciente/12345678901
```

Resposta esperada:

```json
{
  "sucesso": true,
  "dados": {
    "cpf": "12345678901",
    "nome": "Paciente Exemplo",
    "idade": 35,
    "prontuario": "Historico clinico do paciente.",
    "cor": "PRETO"
  }
}
```

### Exportar estrutura da arvore

```http
GET /api/arvore/estrutura
```

Resposta esperada:

```json
{
  "sucesso": true,
  "arvore": {
    "cpf": "12345678901",
    "nome": "Paciente Exemplo",
    "idade": 35,
    "prontuario": "Historico clinico do paciente.",
    "cor": "PRETO",
    "esquerdo": null,
    "direito": null
  }
}
```

## Testando a API pelo PowerShell

Com o servidor rodando, voce pode testar o cadastro:

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/paciente" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"cpf":"12345678901","nome":"Paciente Teste","idade":30,"prontuario":"Teste de cadastro."}'
```

Buscar o paciente:

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/paciente/12345678901"
```

Ver a arvore:

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/arvore/estrutura"
```

## Observacoes Importantes

- Os dados ficam armazenados apenas em memoria.
- Ao reiniciar o servidor Flask, os pacientes cadastrados sao apagados.
- O projeto nao usa banco de dados externo.
- O CPF precisa ter exatamente 11 digitos.
- CPFs duplicados nao sao cadastrados.
- A arvore e atualizada automaticamente apos cada cadastro.

## Video

[Projeto de EDA2 - Árvore Vermelha e Preta ](https://youtu.be/BPSynM-WhU0)

## Integrantes da Equipe

|  | Matricula | Aluno |
| --- | --- | --- |
| <div align="center"><img src="https://github.com/GeovannaUmbelino.png" alt="geovanna" width="90"></div> | 23/2014450 | <span style="color:black;">[Geovanna Umbelino](https://github.com/GeovannaUmbelino)</span> |
| <div align="center"><img src="https://github.com/Sunamit.png" alt="sunamita" width="90"></div> | 22/1008697 | <span style="color:black;">[Sunamita Vitoria](https://github.com/Sunamit)</span> |
