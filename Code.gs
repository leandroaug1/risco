const SS = SpreadsheetApp.getActiveSpreadsheet();
const SH_USUARIOS = SS.getSheetByName("Usuarios");
const SH_RISCOS = SS.getSheetByName("Riscos");

// Renderiza a interface
function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate()
      .setTitle('ERP Riscos')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Autenticação
function realizarLogin(login, senha) {
  if (login === "adm" && senha === "adm1274455") {
    return { status: "success", role: "ADM", nome: "Administrador Master" };
  }

  const dados = SH_USUARIOS.getDataRange().getValues();
  for (let i = 1; i < dados.length; i++) {
    if (dados[i][2] == login && dados[i][3] == senha) {
      if (dados[i][9] !== "Aprovado") return { status: "error", message: "Aguarde aprovação do ADM." };
      return { status: "success", role: "USER", nome: dados[i][1] };
    }
  }
  return { status: "error", message: "Credenciais incorretas." };
}

// Registro e Chamados
function registrarNovoUsuario(obj) {
  const id = "U-" + new Date().getTime();
  SH_USUARIOS.appendRow([id, obj.nome, obj.login, obj.senha, obj.departamento, obj.whatsapp, "", "", "", "Pendente"]);
  return "Cadastro enviado!";
}

function enviarRisco(dados) {
  const id = "R-" + new Date().getTime();
  SH_RISCOS.appendRow([id, new Date(), dados.criador, dados.destino, dados.pn, dados.oc, dados.descricao, "Aberto", ""]);
  return "Risco registrado!";
}

// Funções de Fluxo (Tratativa e Aprovação)
function listarMeusChamados(nome) {
  return SH_RISCOS.getDataRange().getValues().filter(r => r[2] === nome || r[3] === nome);
}

function salvarTratativa(id, acao) {
  const dados = SH_RISCOS.getDataRange().getValues();
  for(let i=1; i<dados.length; i++) {
    if(dados[i][0] == id) {
      SH_RISCOS.getRange(i+1, 9).setValue(acao); // Ação Imediata
      SH_RISCOS.getRange(i+1, 8).setValue("Em Validação"); // Status
      return "Tratativa salva!";
    }
  }
}

function aprovarFechamento(id) {
  const dados = SH_RISCOS.getDataRange().getValues();
  for(let i=1; i<dados.length; i++) {
    if(dados[i][0] == id) {
      SH_RISCOS.getRange(i+1, 8).setValue("Fechado");
      return "Chamado encerrado!";
    }
  }
}

function listarPendentes() {
  return SH_USUARIOS.getDataRange().getValues().filter(r => r[9] === "Pendente");
}

function aprovarUsuario(id) {
  const dados = SH_USUARIOS.getDataRange().getValues();
  for(let i=1; i<dados.length; i++) {
    if(dados[i][0] == id) { SH_USUARIOS.getRange(i+1, 10).setValue("Aprovado"); return "Aprovado!"; }
  }
}
