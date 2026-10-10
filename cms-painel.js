/* Abas de publicação do painel (somente administrador). */
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const C = window.OP_CONFIG;
const sb = createClient(C.supabaseUrl, C.supabaseKey);
const $ = (id) => document.getElementById(id);
const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const CATEGORIAS = [
  ['estudo', 'Estudo Bíblico'], ['folheto', 'Folheto'], ['doutrina', 'Doutrina'], ['devocional', 'Devocional']
];

const VISTAS = {
  materiais: {
    titulo: 'Biblioteca de estudos', singular: 'material', tabela: 'materiais', ordem: ['ordem', 'criado_em'],
    colunas: [['titulo', 'Título'], ['categoria_nome', 'Categoria'], ['publicado', 'Publicado']],
    campos: [
      { k: 'titulo', l: 'Título', t: 'text', req: true },
      { k: 'categoria', l: 'Categoria', t: 'select', opcoes: CATEGORIAS },
      { k: 'descricao', l: 'Descrição (aparece no cartão)', t: 'textarea' },
      { k: 'pdf_url', l: 'Arquivo PDF', t: 'arquivo', accept: 'application/pdf', pasta: 'pdf' },
      { k: 'capa_url', l: 'Imagem de capa (PNG ou JPG)', t: 'arquivo', accept: 'image/png,image/jpeg,image/webp', pasta: 'capas' },
      { k: 'ordem', l: 'Ordem na lista (0 aparece primeiro)', t: 'number' },
      { k: 'publicado', l: 'Publicado no site', t: 'check' }
    ],
    antesSalvar: (d) => { d.categoria_nome = (CATEGORIAS.find((c) => c[0] === d.categoria) || [])[1] || d.categoria; }
  },
  igrejas: {
    titulo: 'Igrejas parceiras', singular: 'igreja', tabela: 'igrejas', ordem: ['nome'],
    colunas: [['nome', 'Nome'], ['cidade', 'Cidade'], ['publicado', 'Publicada']],
    campos: [
      { k: 'nome', l: 'Nome da igreja', t: 'text', req: true },
      { k: 'endereco', l: 'Endereço (rua, número, bairro)', t: 'text' },
      { k: 'cidade', l: 'Cidade', t: 'text' },
      { k: 'estado', l: 'Estado (sigla)', t: 'text' },
      { k: 'cep', l: 'CEP', t: 'text' },
      { k: 'telefone', l: 'Telefone / WhatsApp', t: 'text' },
      { k: 'latitude', l: 'Latitude', t: 'number', passo: 'any' },
      { k: 'longitude', l: 'Longitude', t: 'number', passo: 'any' },
      { k: 'publicado', l: 'Aparece no site', t: 'check' }
    ],
    extra: 'coordenadas'
  },
  pregacoes: {
    titulo: 'Pregações e vídeos', singular: 'pregação', tabela: 'pregacoes', ordem: ['ordem', 'criado_em'],
    colunas: [['tipo', 'Tipo'], ['titulo', 'Título'], ['publicado', 'Publicada']],
    campos: [
      { k: 'tipo', l: 'Etiqueta (ex.: PREGAÇÃO, ESTUDO BÍBLICO)', t: 'text', req: true },
      { k: 'titulo', l: 'Título', t: 'text', req: true },
      { k: 'descricao', l: 'Frase curta', t: 'text' },
      { k: 'url', l: 'Link do vídeo no YouTube (cole o endereço do vídeo para ele tocar no site)', t: 'text' },
      { k: 'ordem', l: 'Ordem (0 aparece primeiro)', t: 'number' },
      { k: 'publicado', l: 'Aparece no site', t: 'check' }
    ]
  }
};

let vistaAtual = null, registros = [], editando = null;

/* ---------- mensagens ---------- */
function aviso(msg, erro) {
  const a = $('cmsAviso'); a.textContent = msg; a.className = 'cms-aviso ' + (erro ? 'erro' : 'ok'); a.hidden = false;
  clearTimeout(aviso.t); aviso.t = setTimeout(() => (a.hidden = true), 6000);
}
const msgErro = (e) => (e && e.message) ? e.message : String(e);

/* ---------- navegação ---------- */
function abrirAba(nome) {
  document.querySelectorAll('[data-aba]').forEach((b) => b.classList.toggle('ativa', b.dataset.aba === nome));
  $('abaPedidos').hidden = nome !== 'pedidos';
  $('abaConteudo').hidden = nome === 'pedidos';
  if (nome === 'pedidos') return;
  vistaAtual = nome;
  if (VISTAS[nome]) carregarLista(nome);
  else if (nome === 'equipe') carregarEquipe();
  else if (nome === 'textos') carregarTextos();
}

/* ---------- lista genérica ---------- */
async function carregarLista(nome) {
  const v = VISTAS[nome];
  $('cmsConteudo').innerHTML = '<div class="cms-vazio">Carregando…</div>';
  let q = sb.from(v.tabela).select('*');
  v.ordem.forEach((o) => { q = q.order(o, { ascending: o !== 'criado_em' ? true : false }); });
  const { data, error } = await q;
  if (error) { $('cmsConteudo').innerHTML = ''; aviso('Não consegui carregar: ' + msgErro(error) + ' — o SQL do painel já foi executado no Supabase?', true); return; }
  registros = data || [];
  const linhas = registros.map((r) => `<tr>${v.colunas.map(([k]) =>
    `<td>${k === 'publicado' ? (r[k] ? '✅ Sim' : '⏸ Oculto') : esc(r[k])}</td>`).join('')}
    <td class="cms-acoes"><button class="btn btn-outline" data-edit="${r.id}">Editar</button>
    <button class="btn btn-outline" data-del="${r.id}">Excluir</button></td></tr>`).join('');
  $('cmsConteudo').innerHTML = `
    <div class="cms-topo"><h2>${v.titulo}</h2><button class="btn btn-gold" id="cmsNovo">+ Adicionar ${v.singular}</button></div>
    ${registros.length ? `<div class="table-wrap"><table><thead><tr>${v.colunas.map((c) => `<th>${c[1]}</th>`).join('')}<th></th></tr></thead><tbody>${linhas}</tbody></table></div>`
      : '<div class="cms-vazio">Nada cadastrado ainda. Clique em “Adicionar”.</div>'}`;
  $('cmsNovo').onclick = () => abrirForm(null);
  $('cmsConteudo').querySelectorAll('[data-edit]').forEach((b) => b.onclick = () => abrirForm(registros.find((r) => r.id === b.dataset.edit)));
  $('cmsConteudo').querySelectorAll('[data-del]').forEach((b) => b.onclick = () => excluir(b.dataset.del));
}

async function excluir(id) {
  const v = VISTAS[vistaAtual];
  if (!confirm('Excluir este item de vez? Para só esconder do site, use Editar e desmarque “Publicado”.')) return;
  const { error } = await sb.from(v.tabela).delete().eq('id', id);
  if (error) return aviso('Não foi possível excluir: ' + msgErro(error), true);
  aviso('Item excluído.'); carregarLista(vistaAtual);
}

/* ---------- formulário ---------- */
function abrirForm(reg) {
  const v = VISTAS[vistaAtual]; editando = reg;
  const dados = reg || { publicado: true, ordem: 0, categoria: 'estudo', tipo: 'PREGAÇÃO' };
  $('cmsFormTitulo').textContent = (reg ? 'Editar ' : 'Adicionar ') + v.singular;
  $('cmsCampos').innerHTML = v.campos.map((c) => {
    const val = dados[c.k] ?? '';
    const id = 'cf_' + c.k;
    let ctl;
    if (c.t === 'textarea') ctl = `<textarea id="${id}" rows="4">${esc(val)}</textarea>`;
    else if (c.t === 'select') ctl = `<select id="${id}">${c.opcoes.map(([a, b]) => `<option value="${a}" ${a === val ? 'selected' : ''}>${b}</option>`).join('')}</select>`;
    else if (c.t === 'check') return `<label class="cms-check"><input type="checkbox" id="${id}" ${val ? 'checked' : ''}> ${c.l}</label>`;
    else if (c.t === 'arquivo') ctl = `<input type="hidden" id="${id}" value="${esc(val)}">
      <div class="cms-arq"><input type="file" id="${id}_f" accept="${c.accept}">
      <span id="${id}_s" class="cms-dica">${val ? 'Já tem um arquivo enviado. Escolha outro só se quiser trocar.' : 'Nenhum arquivo ainda.'}</span></div>`;
    else ctl = `<input id="${id}" type="${c.t === 'number' ? 'number' : 'text'}" ${c.passo ? `step="${c.passo}"` : ''} value="${esc(val)}">`;
    return `<div class="cms-campo"><label for="${id}">${c.l}${c.req ? ' *' : ''}</label>${ctl}</div>`;
  }).join('') + (v.extra === 'coordenadas' ? '<button type="button" class="btn btn-outline" id="cmsGeo">📍 Descobrir latitude e longitude pelo endereço</button>' : '');
  if (v.extra === 'coordenadas') $('cmsGeo').onclick = buscarCoordenadas;
  v.campos.filter((c) => c.t === 'arquivo').forEach((c) => {
    $('cf_' + c.k + '_f').onchange = (e) => enviarArquivo(c, e.target.files[0]);
  });
  $('cmsModal').classList.add('show');
}
const fecharForm = () => $('cmsModal').classList.remove('show');

async function enviarArquivo(c, arq) {
  if (!arq) return;
  const st = $('cf_' + c.k + '_s');
  if (arq.size > 25 * 1024 * 1024) { st.textContent = 'Arquivo grande demais (máximo 25 MB).'; return; }
  st.textContent = 'Enviando…';
  const nome = arq.name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9._-]+/g, '-');
  const caminho = `${c.pasta}/${Date.now()}-${nome}`;
  const { error } = await sb.storage.from(C.bucket).upload(caminho, arq, { contentType: arq.type, upsert: false });
  if (error) { st.textContent = 'Falha no envio: ' + msgErro(error); return; }
  $('cf_' + c.k).value = sb.storage.from(C.bucket).getPublicUrl(caminho).data.publicUrl;
  st.textContent = '✅ Enviado: ' + arq.name;
}

async function buscarCoordenadas() {
  const f = (k) => $('cf_' + k).value.trim();
  const texto = [f('endereco'), f('cidade'), f('estado'), 'Brasil'].filter(Boolean).join(', ');
  if (!f('endereco') && !f('cidade')) return aviso('Preencha o endereço e a cidade primeiro.', true);
  try {
    const r = await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(texto));
    const j = await r.json();
    if (!j.length) return aviso('Não achei esse endereço no mapa. Tente simplificar (só rua e cidade) ou preencha à mão.', true);
    $('cf_latitude').value = j[0].lat; $('cf_longitude').value = j[0].lon;
    aviso('Coordenadas preenchidas. Confira no mapa depois de salvar.');
  } catch (e) { aviso('Não consegui consultar o mapa agora.', true); }
}

async function salvarForm(ev) {
  ev.preventDefault();
  const v = VISTAS[vistaAtual], d = {};
  for (const c of v.campos) {
    const el = $('cf_' + c.k);
    if (c.t === 'check') d[c.k] = el.checked;
    else if (c.t === 'number') d[c.k] = el.value === '' ? null : Number(el.value);
    else d[c.k] = el.value.trim() || null;
    if (c.req && !d[c.k]) return aviso('Preencha: ' + c.l, true);
  }
  if (v.antesSalvar) v.antesSalvar(d);
  const q = editando ? sb.from(v.tabela).update(d).eq('id', editando.id) : sb.from(v.tabela).insert(d);
  const { error } = await q;
  if (error) return aviso('Não foi possível salvar: ' + msgErro(error), true);
  fecharForm(); aviso('Salvo! Já aparece no site.'); carregarLista(vistaAtual);
}

/* ---------- equipe ---------- */
async function carregarEquipe() {
  $('cmsConteudo').innerHTML = '<div class="cms-vazio">Carregando…</div>';
  const [eq, cv] = await Promise.all([
    sb.from('equipe_oracao').select('user_id,nome,funcao,ativo').order('nome'),
    sb.from('equipe_convites').select('*').order('criado_em')
  ]);
  if (eq.error) return aviso('Não consegui carregar a equipe: ' + msgErro(eq.error), true);
  const funcoes = ['administrador', 'lider', 'intercessor'];
  const meuId = (await sb.auth.getUser()).data.user?.id;
  const linhas = (eq.data || []).map((m) => `<tr><td>${esc(m.nome)}${m.user_id === meuId ? ' (você)' : ''}</td>
    <td><select data-funcao="${m.user_id}" ${m.user_id === meuId ? 'disabled' : ''}>${funcoes.map((f) => `<option ${f === m.funcao ? 'selected' : ''}>${f}</option>`).join('')}</select></td>
    <td>${m.ativo ? '✅ Liberado' : '⛔ Bloqueado'}</td>
    <td class="cms-acoes">${m.user_id === meuId ? '' : `<button class="btn btn-outline" data-ativo="${m.user_id}" data-v="${m.ativo}">${m.ativo ? 'Bloquear' : 'Liberar'}</button>`}</td></tr>`).join('');
  const conv = (cv.data || []).map((c) => `<tr><td>${esc(c.nome)}</td><td>${esc(c.email)}</td><td>${esc(c.funcao)}</td>
    <td class="cms-acoes"><button class="btn btn-outline" data-rmconv="${esc(c.email)}">Cancelar</button></td></tr>`).join('');
  $('cmsConteudo').innerHTML = `
    <div class="cms-topo"><h2>Equipe e intercessores</h2></div>
    <div class="table-wrap"><table><thead><tr><th>Nome</th><th>Função</th><th>Acesso</th><th></th></tr></thead><tbody>${linhas}</tbody></table></div>
    <div class="cms-bloco"><h3>Convidar nova pessoa</h3>
      <p class="cms-dica"><b>Passo 1:</b> preencha aqui. <b>Passo 2:</b> no Supabase, em Authentication → Users → Add user, crie o login com este mesmo e-mail e uma senha (marque “Auto Confirm User”). <b>Passo 3:</b> passe o e-mail e a senha para a pessoa. No primeiro acesso à Central, ela entra sozinha com a função escolhida.</p>
      <form id="cmsConvite" class="cms-linha">
        <input id="cvNome" placeholder="Nome" required>
        <input id="cvEmail" type="email" placeholder="E-mail" required>
        <select id="cvFuncao"><option value="intercessor">intercessor</option><option value="lider">lider</option><option value="administrador">administrador</option></select>
        <button class="btn btn-gold">Convidar</button>
      </form></div>
    ${conv ? `<div class="cms-bloco"><h3>Convites aguardando o primeiro acesso</h3><div class="table-wrap"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Função</th><th></th></tr></thead><tbody>${conv}</tbody></table></div></div>` : ''}`;
  $('cmsConteudo').querySelectorAll('[data-funcao]').forEach((s) => s.onchange = async () => {
    const { error } = await sb.from('equipe_oracao').update({ funcao: s.value }).eq('user_id', s.dataset.funcao);
    error ? aviso(msgErro(error), true) : aviso('Função atualizada.');
  });
  $('cmsConteudo').querySelectorAll('[data-ativo]').forEach((b) => b.onclick = async () => {
    const { error } = await sb.from('equipe_oracao').update({ ativo: b.dataset.v !== 'true' }).eq('user_id', b.dataset.ativo);
    error ? aviso(msgErro(error), true) : (aviso('Acesso atualizado.'), carregarEquipe());
  });
  $('cmsConteudo').querySelectorAll('[data-rmconv]').forEach((b) => b.onclick = async () => {
    await sb.from('equipe_convites').delete().eq('email', b.dataset.rmconv); carregarEquipe();
  });
  $('cmsConvite').onsubmit = async (e) => {
    e.preventDefault();
    const { error } = await sb.from('equipe_convites').upsert({
      nome: $('cvNome').value.trim(), email: $('cvEmail').value.trim().toLowerCase(), funcao: $('cvFuncao').value });
    error ? aviso(msgErro(error), true) : (aviso('Convite criado. Falta só criar o login no Supabase (passo 2).'), carregarEquipe());
  };
}

/* ---------- textos do site ---------- */
const TEXTOS = [
  ['versiculo_topo', 'Versículo da faixa no topo de todas as páginas'],
  ['whatsapp_comunidade', 'Link da comunidade / canal do WhatsApp'],
  ['youtube_canal', 'Link do canal do YouTube']
];
async function carregarTextos() {
  const { data, error } = await sb.from('configuracoes').select('chave,valor');
  if (error) return aviso(msgErro(error), true);
  const m = {}; (data || []).forEach((x) => (m[x.chave] = x.valor));
  $('cmsConteudo').innerHTML = `<div class="cms-topo"><h2>Textos do site</h2></div>
    <form id="cmsTextos" class="cms-bloco">${TEXTOS.map(([k, l]) =>
      `<div class="cms-campo"><label>${l}</label><input id="tx_${k}" value="${esc(m[k] || '')}"></div>`).join('')}
    <button class="btn btn-gold">Salvar textos</button></form>`;
  $('cmsTextos').onsubmit = async (e) => {
    e.preventDefault();
    const { error: er } = await sb.from('configuracoes').upsert(
      TEXTOS.map(([k]) => ({ chave: k, valor: $('tx_' + k).value.trim(), atualizado_em: new Date().toISOString() })));
    er ? aviso(msgErro(er), true) : aviso('Textos salvos.');
  };
}

/* ---------- início ---------- */
async function iniciar() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return;
  const { data: membro } = await sb.from('equipe_oracao').select('funcao,ativo').eq('user_id', session.user.id).maybeSingle();
  if (!membro || !membro.ativo || membro.funcao !== 'administrador') return; // só administrador vê as abas
  $('abas').hidden = false;
  document.querySelectorAll('[data-aba]').forEach((b) => b.onclick = () => abrirAba(b.dataset.aba));
  $('cmsForm').onsubmit = salvarForm;
  $('cmsCancelar').onclick = fecharForm;
}
iniciar();
