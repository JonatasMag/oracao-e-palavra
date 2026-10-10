/* Leitura pública do conteúdo publicado no painel.
   Se o Supabase não responder ou a tabela estiver vazia, devolve null
   e a página usa os arquivos .json antigos como reserva. */
window.OP = (function () {
  var c = window.OP_CONFIG;
  function get(tabela, query) {
    return fetch(c.supabaseUrl + '/rest/v1/' + tabela + '?' + query, {
      headers: { apikey: c.supabaseKey, Authorization: 'Bearer ' + c.supabaseKey }
    }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
  }
  function lista(tabela, ordem) {
    return get(tabela, 'select=*&publicado=eq.true&order=' + ordem).then(function (d) {
      return d && d.length ? d : null;
    });
  }
  function configuracoes() {
    return get('configuracoes', 'select=chave,valor').then(function (d) {
      var o = {}; (d || []).forEach(function (x) { o[x.chave] = x.valor; }); return o;
    });
  }
  return {
    materiais: function () { return lista('materiais', 'ordem.asc,criado_em.desc'); },
    igrejas: function () { return lista('igrejas', 'nome.asc'); },
    pregacoes: function () { return lista('pregacoes', 'ordem.asc,criado_em.desc'); },
    configuracoes: configuracoes
  };
})();
