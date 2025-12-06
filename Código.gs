var ss = SpreadsheetApp.getActiveSpreadsheet();

function doGet() {
  var template = HtmlService.createTemplateFromFile('index');

  template.turmas = configurar();

  return template.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function login(dados) {

  const emailLimpo = String(dados.email).trim().toLowerCase();
  
  if (!emailLimpo || emailLimpo === "") {
    throw new Error("O campo e-mail é obrigatório.");
  }

  if (!validarFormatoEmail(emailLimpo)) {
    throw new Error("E-mail inválido. Verifique se digitou corretamente (ex: nome@gmail.com).");
  }

  // Atualiza o objeto dados com o email limpo para usar no resto do código
  dados.email = emailLimpo; 

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const sheetTurma = ss.getSheetByName(dados.turma);
  if (!sheetTurma) throw new Error("Turma não encontrada.");

  const dadosTurma = sheetTurma.getDataRange().getValues();
  let matriculaAluno = null;
  let linhaDoAlunoNaTurma = -1;

  const nomeInput = String(dados.nome).trim().toLowerCase();

  // Loop para achar o aluno na turma
  for (let i = 1; i < dadosTurma.length; i++) {
    const nomePlanilha = String(dadosTurma[i][1]).trim().toLowerCase(); // Coluna B (Nome)

    if (nomePlanilha === nomeInput) {
      matriculaAluno = dadosTurma[i][0]; // Coluna A (Matrícula)
      linhaDoAlunoNaTurma = i;
      break;
    }
  }

  if (!matriculaAluno) {
    throw new Error("Aluno não encontrado nesta turma. Verifique a digitação do nome.");
  }

  const sheetAcesso = ss.getSheetByName("acesso");

  if (!sheetAcesso) ss.insertSheet("acesso").appendRow(["Matrícula", "E-mail Registrado", "Data Cadastro"]);

  const dadosAcesso = sheetAcesso.getDataRange().getValues();
  let emailRegistrado = null;
  let usuarioJaCadastrado = false;

  for (let j = 1; j < dadosAcesso.length; j++) {
    if (String(dadosAcesso[j][0]) === String(matriculaAluno)) {
      usuarioJaCadastrado = true;
      emailRegistrado = dadosAcesso[j][1]; // Coluna B (E-mail)
      break;
    }
  }

  const emailInput = String(dados.email).trim().toLowerCase();

  if (usuarioJaCadastrado) {

    if (String(emailRegistrado).trim().toLowerCase() !== emailInput) {
      throw new Error("Este aluno já foi registrado com outro e-mail. Acesso negado.");
    }
    // Se passou aqui, é o dono da conta. Pode prosseguir.

  } else {
    for (let k = 1; k < dadosAcesso.length; k++) {
      // Coluna B (índice 1) é onde estão os e-mails
      const emailExistente = String(dadosAcesso[k][1]).trim().toLowerCase();

      if (emailExistente === emailInput) {
        throw new Error("Este e-mail já está cadastrado para outro aluno. Use um e-mail único.");
      }
    }
    sheetAcesso.appendRow([
      matriculaAluno,
      emailInput,
      new Date()
    ]);
  }

  const linha = dadosTurma[linhaDoAlunoNaTurma];

  // Função auxiliar para evitar erro se a célula estiver vazia
  // Se for vazio, retorna traço "-", senão formata o número
  const fmt = (v) => (v === "" || v == null) ? "-" : (typeof v === 'number' ? v.toFixed(1) : v);

  // Mapeamento manual das colunas
  // 1º Bim: C(2), D(3), E(4), G(6), H(7)
  // 2º Bim: I(8), J(9), K(10), M(12), N(13)
  // 3º Bim: O(14), P(15), Q(16), S(18), T(19)
  // 4º Bim: U(20), V(21), W(22), Y(24), Z(25)

  const boletim = [
    {
      titulo: "1º Bimestre",
      n1: fmt(linha[2]), rec: fmt(linha[3]), n2: fmt(linha[4]), n3: fmt(linha[6]), media: linha[7]
    },
    {
      titulo: "2º Bimestre",
      n1: fmt(linha[8]), rec: fmt(linha[9]), n2: fmt(linha[10]), n3: fmt(linha[12]), media: linha[13]
    },
    {
      titulo: "3º Bimestre",
      n1: fmt(linha[14]), rec: fmt(linha[15]), n2: fmt(linha[16]), n3: fmt(linha[18]), media: linha[19]
    },
    {
      titulo: "4º Bimestre",
      n1: fmt(linha[20]), rec: fmt(linha[21]), n2: fmt(linha[22]), n3: fmt(linha[24]), media: linha[25]
    }
  ];

  let jaPediuRecuperacao = false;
  const sheetRecup = ss.getSheetByName("Recuperacao_4Bim");

  // Só verifica se a aba existir
  if (sheetRecup) {
    const dadosRecup = sheetRecup.getDataRange().getValues();
    // Loop para procurar a matrícula na lista de pedidos
    // Começa do 1 para pular o cabeçalho
    for (let r = 1; r < dadosRecup.length; r++) {
      // Supondo que a Matrícula está na coluna C (índice 2) na aba de recuperação
      if (String(dadosRecup[r][2]) === String(matriculaAluno)) {
        jaPediuRecuperacao = true;
        break;
      }
    }
  }

  return {
    sucesso: true,
    primeiroAcesso: !usuarioJaCadastrado,
    matricula: matriculaAluno,
    turma: dados.turma,
    aluno: dados.nome,
    dadosBimestres: boletim,
    jaSolicitou: jaPediuRecuperacao
  };
}

function configurar() {
  const abaConfiguracoes = ss.getSheetByName("Configuracoes");

  if (!abaConfiguracoes) {
    Logger.log("Aba não encontrada!");
    return [];
  }

  const ultimaLinha = abaConfiguracoes.getLastRow();

  // Se só tiver o cabeçalho ou estiver vazia, retorna vazio
  if (ultimaLinha <= 1) return [];

  const dadosBrutos = abaConfiguracoes.getRange(2, 1, ultimaLinha - 1).getValues();

  const listaSimples = dadosBrutos.map(linha => linha[0]);

  Logger.log(listaSimples); // Veja o resultado em "Execuções"
  return listaSimples;
}

function registrarInteresseRecuperacao(dados) {
  // dados = { turma: "...", matricula: "...", nome: "..." }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const nomeAba = "Recuperacao_4Bim";
  let sheet = ss.getSheetByName(nomeAba);

  // Se a aba não existe, cria e coloca cabeçalho
  if (!sheet) {
    sheet = ss.insertSheet(nomeAba);
    sheet.appendRow(["Data/Hora", "Turma", "Matrícula", "Nome do Aluno"]);
  }

  // Verifica duplicidade (Opcional: para o aluno não clicar 10 vezes)
  const lista = sheet.getDataRange().getValues();
  for (let i = 1; i < lista.length; i++) {
    // Se já tiver a matrícula na lista, retorna aviso
    if (String(lista[i][2]) === String(dados.matricula)) {
      return "Você já solicitou a recuperação. Aguarde orientações.";
    }
  }

  // Salva o pedido
  sheet.appendRow([
    new Date(),
    dados.turma,
    dados.matricula,
    dados.nome
  ]);

  return "Solicitação enviada com sucesso!";
}

// Função auxiliar para validar formato de e-mail
function validarFormatoEmail(email) {
  // Expressão regular rigorosa:
  // - Precisa ter texto antes do @
  // - Precisa do @
  // - Precisa de texto depois do @
  // - Precisa de um PONTO (.) depois do texto
  var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}
