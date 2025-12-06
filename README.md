# Diário Escolar de Química - Portal do Aluno

Uma aplicação web desenvolvida com **Google Apps Script** para permitir que alunos consultem suas notas e boletins de forma simples, rápida e responsiva. O sistema utiliza o Google Sheets como banco de dados.

## Sobre o Projeto

Este projeto é um **Portal do Aluno** onde o estudante pode realizar login selecionando sua turma, nome e e-mail para visualizar seu boletim escolar. A interface foi construída focando na experiência do usuário (UX), utilizando o framework **Materialize CSS** para garantir um design moderno e adaptável a dispositivos móveis.

## Funcionalidades

* **Login de Aluno:** Autenticação simples via seleção de turma, nome e e-mail.
* **Carregamento Dinâmico:** A lista de turmas (`select`) é populada automaticamente a partir dos dados da planilha.
* **Visualização de Boletim:** Exibição clara das notas e resultados (área `tela-resultados`).
* **Responsividade:** Interface adaptada para funcionar em Desktops e Smartphones.

## Tecnologias Utilizadas

* **Backend:** [Google Apps Script](https://script.google.com/) (JavaScript na nuvem do Google).
* **Banco de Dados:** Google Sheets (Planilhas Google).
* **Frontend:** HTML5, CSS3.
* **Framework CSS:** [Materialize CSS (v1.0.0)](https://materializecss.com/).
* **Motor de Template:** Scriptlets do GAS (`<? ?>` e `<?= ?>`).

<img width="1150" height="592" alt="Pagina de busca do app" src="https://github.com/user-attachments/assets/22b82953-c05e-49df-9185-d2cf5c1b01c6" />

<img width="1149" height="700" alt="Pagina de visualizaçao do app" src="https://github.com/user-attachments/assets/9bff9c65-9a1b-4013-b04b-897a98dc24d9" />

## 📂 Estrutura do Projeto

O projeto no Google Apps Script deve ser organizado da seguinte forma:

```text
├── Code.gs             # Lógica do servidor (doGet, funções de busca na planilha)
├── index.html          # Estrutura principal da página (Login e Área de Resultados)
├── javaScript.html     # Lógica do cliente (interações de botão, validação)

```

## 📊 Estrutura da Planilha (Banco de Dados)

O sistema utiliza uma Planilha Google como backend. Para que a aplicação funcione corretamente, a planilha deve seguir rigorosamente a estrutura de colunas abaixo.

O script busca uma aba (guia) específica — a partir do nome da turma inserido no campo turma do frontEnd - conforme o modelo de planilha disponibilizado: [Diario Escolar - Aluno](Diario Escolar - Aluno.xlsx) 

O select (lista de seleçao) é populado a partir da aba configuracoes. Nela são inseridos as turmas de acardo com as abas disponiveis na planilha.

> **⚠️ Importante:**
> * **Login:** O aluno só conseguirá acessar se a combinação de **Turma** e **Nome** digitada no formulário for *exatamente igual* ao que está cadastrado nesta planilha.
