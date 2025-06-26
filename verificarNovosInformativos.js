function verificarNovosInformativos() {
  var folderId = "ID_PASTA_GOOGLE_DRIVE"; 
  var webhookUrl = "LINK_WEBHOOK_GOOGLE_CHAT"; 
  var properties = PropertiesService.getScriptProperties();
  
  var pasta = DriveApp.getFolderById(folderId);
  var arquivos = pasta.getFiles();
  
  var ultimoArquivoRegistrado = properties.getProperty("ultimoArquivoInformativo");
  var novosArquivos = [];
  var maisRecente = ultimoArquivoRegistrado ? new Date(ultimoArquivoRegistrado) : new Date(0);
  
  while (arquivos.hasNext()) {
    var arquivo = arquivos.next();
    var dataCriacao = arquivo.getDateCreated();
    
    if (dataCriacao > maisRecente) {
      // Se for Google Docs, vai ler o que está escrito dentro do documento
      var textoExtra = "";
      if (arquivo.getMimeType() === MimeType.GOOGLE_DOCS) {
        var doc = DocumentApp.openById(arquivo.getId());
        textoExtra = doc.getBody().getText().trim();
      }

      novosArquivos.push({
        texto: textoExtra
      });

      if (dataCriacao > maisRecente) {
        maisRecente = dataCriacao;
      }
    }
  }
  
  if (novosArquivos.length > 0) {
    // Atualiza a data do último arquivo adicionado no google drive
    properties.setProperty("ultimoArquivoInformativo", maisRecente.toISOString());
    
    novosArquivos.forEach(function(arquivoInfo) {
      var mensagem = "*Novos Informativos REAÇÃO disponíveis!*\n\n";
      
      if (arquivoInfo.texto) {
        mensagem += arquivoInfo.texto + "\n\n";
      }
      
      mensagem += "[Acesse todos os Informativos aqui](link da pagina de informativos/comunicados)";
      
      var payload = {
        text: mensagem
      };
      
      var options = {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload)
      };
      
      UrlFetchApp.fetch(webhookUrl, options);
    });
  }
}
