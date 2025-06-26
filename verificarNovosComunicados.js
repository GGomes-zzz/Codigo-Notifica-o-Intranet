function verificarNovosComunicados() {
  var folderId = "ID_DA_PASTA_GOOGLE_DRIVE"; 
  var webhookUrl = "LINK_WEBHOOK_GOOGLECHAT"; 
  var properties = PropertiesService.getScriptProperties();
  
  var pasta = DriveApp.getFolderById(folderId);
  var arquivos = pasta.getFiles();
  
  var ultimoArquivoRegistrado = properties.getProperty("ultimoArquivo");
  var novosArquivos = [];
  var maisRecente = ultimoArquivoRegistrado ? new Date(ultimoArquivoRegistrado) : new Date(0);
  
  while (arquivos.hasNext()) {
    var arquivo = arquivos.next();
    var dataCriacao = arquivo.getDateCreated();
    
    if (dataCriacao > maisRecente) {
      var nomeArquivo = arquivo.getName();
      var nomeSemExtensao = nomeArquivo.substring(0, nomeArquivo.lastIndexOf(".")) || nomeArquivo; // Remove a extensão do arquivo que foi colocado no google drive, depois do "."
      novosArquivos.push(nomeSemExtensao);
      
      // Atualiza a data mais recente
      if (dataCriacao > maisRecente) {
        maisRecente = dataCriacao;
      }
    }
  }
  
  if (novosArquivos.length > 0) {
    properties.setProperty("ultimoArquivo", maisRecente.toISOString()); // Salva a última data de criação verificada corretamente

    var mensagem = "*Novos comunicados disponíveis!*\n\n";
    
    novosArquivos.forEach(function(nomeArquivo) {
      mensagem += `📄 *${nomeArquivo}*\n`;
    });

    mensagem += "\n👉 [Acesse todos os comunicados aqui](link da intranet aqui)";

    var payload = {
      text: mensagem
    };

    var options = {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify(payload)
    };

    UrlFetchApp.fetch(webhookUrl, options);
  }
}
