# Oração e Palavra

> "Mas nós perseveraremos na oração e no ministério da palavra." — Atos 6:4

Site oficial do projeto **Oração e Palavra**: um espaço digital de evangelização, oração, acolhimento e ensino da Palavra de Deus, sob responsabilidade do **Pr. Jonatas H. Magalhães**.

🔗 Site: https://oracao-e-palavra.chazaq-adm.workers.dev/

---

## Visão geral

O projeto reúne, em um único ecossistema gratuito:

- Um **site público** com apresentação do ministério, pedidos de oração, chat de acolhimento com triagem automática e uma jornada devocional de estudo.
- Uma **Biblioteca de Estudos** com estudos bíblicos, folhetos, doutrina apostólica e devocionais em PDF, gratuitos para baixar.
- Um **mapa de igrejas parceiras**, para ajudar o visitante a encontrar uma congregação perto de si.
- Uma **Central de Oração** privada, onde a equipe autorizada acompanha e responde aos pedidos recebidos.
- Integração com **WhatsApp** (comunidade diária) e **YouTube** (pregações e conteúdos).
- Um **chat ao vivo** (tawk.to) como segunda camada de atendimento humano.

---

## Estrutura de arquivos

| Arquivo / pasta | Descrição |
|---|---|
| `index.html` | Site público: apresentação, comunidade, chat de acolhimento, formulário de pedido de oração, pregações, sobre o projeto. |
| `conhecendo-jesus.html` | Jornada devocional de 7 dias (Salvação, Verdade e Esperança), com referências bíblicas e orações guiadas. |
| `blog.html` | Biblioteca de Estudos: lista estudos bíblicos, folhetos, doutrina apostólica e devocionais, com filtro por categoria, carregados a partir de `biblioteca.json`. |
| `biblioteca.json` | Catálogo dos materiais exibidos em `blog.html` (título, categoria, descrição, capa e PDF de cada item). |
| `biblioteca/` | Arquivos dos materiais da Biblioteca: PDFs (`Estudos/`, `folhetos/`, `doutrina/`, `devocionais/`) e capas (`Estudos/capas/`). |
| `igrejas.html` | Mapa interativo (Leaflet) com as igrejas parceiras do projeto: endereço, telefone/WhatsApp e rota no Google Maps. |
| `igrejas.json` | Cadastro das igrejas parceiras exibidas em `igrejas.html` (nome, endereço, cidade, telefone, coordenadas). |
| `central.html` | Tela de login da equipe (autenticação via Supabase Auth). |
| `painel.html` | Painel administrativo: indicadores, listagem, filtro e gestão dos pedidos de oração. |
| `robots.txt` | Regras de indexação para buscadores (bloqueia `central.html` e `painel.html`). |
| `sitemap.xml` | Mapa do site enviado ao Google Search Console. |
| `logo-oracao-e-palavra.png` | Logotipo do projeto. |
| `favicon-oracao-e-palavra.png` | Ícone do site (aba do navegador). |
| `qr-comunidade.png` | QR Code de acesso à comunidade do WhatsApp. |

---

## Tecnologias utilizadas

Stack 100% gratuita, sem custos de manutenção:

- **Cloudflare Pages / Workers** — hospedagem do site.
- **GitHub** — versionamento e publicação do código.
- **Supabase** — banco de dados (PostgreSQL) e autenticação da equipe.
- **tawk.to** — chat ao vivo com a equipe de atendimento.
- **WhatsApp** — comunidade diária de devocionais e avisos.
- **YouTube** — canal de pregações e conteúdos em vídeo.
- **Leaflet + OpenStreetMap** — mapa interativo das igrejas parceiras.

---

## Banco de dados (Supabase)

### Tabela `pedidos_oracao`
Armazena os pedidos enviados pelo formulário público.

| Coluna | Descrição |
|---|---|
| `id` | Identificador único do pedido. |
| `created_at` | Data e hora do envio. |
| `nome` | Nome informado (opcional). |
| `pedido` | Texto do pedido de oração. |
| `contato` | WhatsApp ou e-mail para retorno (opcional). |
| `preferencia_contato` | `nao` / `whatsapp` / `email`. |
| `consentimento` | Confirmação de autorização para armazenar os dados (LGPD). |
| `status` | `novo` / `em_oracao` / `em_acompanhamento` / `encerrado`. |
| `responsavel` | `user_id` do membro da equipe responsável pelo pedido. |
| `observacoes_internas` | Anotações internas da equipe (não visíveis ao público). |

### Tabela `equipe_oracao`
Define quem tem acesso à Central de Oração.

| Coluna | Descrição |
|---|---|
| `user_id` | Referência ao usuário autenticado no Supabase Auth. |
| `nome` | Nome do membro da equipe. |
| `funcao` | `administrador` / `lider` / `intercessor`. |
| `ativo` | Define se o acesso está liberado ou bloqueado. |

### Segurança (RLS)
- **Row Level Security ativo e testado** em ambas as tabelas.
- Envio de pedidos (`insert`) é público, mas leitura e edição exigem que o usuário esteja autenticado **e** presente em `equipe_oracao` com `ativo = true`.
- Cadastro público de novos usuários deve permanecer **desabilitado** no Supabase Auth — todo acesso é criado, bloqueado e desbloqueado manualmente pelo administrador.
- Não há fluxo de "esqueci minha senha" ativo; redefinições são feitas direto pelo painel do Supabase (Authentication → Users).

---

## Chat de acolhimento

O `index.html` conta com um chat de triagem (seção **Acolhimento**) que:

- Responde por temas: pedido de oração, conhecer Jesus, momento difícil, encontrar uma igreja.
- Detecta palavras-chave de risco (ex. menções a desistir da vida) e, nesses casos, exibe imediatamente o contato do **CVV (188)** e do **SAMU (192)** em destaque, priorizando conectar a pessoa a um ser humano.
- Ao final de cada resposta, oferece os botões **"Pedir oração"** e **"Falar com alguém agora"** — este último abre o widget do tawk.to (`Tawk_API.maximize()`) quando disponível.
- No tema "encontrar uma igreja", indica a página `igrejas.html` como caminho para o visitante localizar uma congregação parceira perto de si.

> **Escopo do ministério:** o ecossistema é dedicado ao apoio espiritual. Encaminhamento a autoridades ou órgãos competentes acontece apenas em casos específicos, avaliados pela equipe — não há sinalização automática de risco no painel administrativo por decisão do projeto.

---

## Biblioteca de Estudos

A página `blog.html` lista os materiais cadastrados em `biblioteca.json`, com filtro por categoria:

| Categoria (`categoria`) | Rótulo exibido | Conteúdo atual |
|---|---|---|
| `estudo` | Estudos Bíblicos | "6 Lições Surpreendentes de Gênesis" |
| `folheto` | Folhetos | "Cinco Passos para o Homem Chegar à Eternidade" |
| `doutrina` | Doutrina Apostólica | "Mateus 28:19 — O Batismo Segundo a Ordem de Jesus" e "O Que a Bíblia Fala Sobre o Batismo" |
| `devocional` | Devocionais | Jornada de 30 dias em 4 semanas temáticas: **Raiz** (pessoal), **Lar** (família), **Mordomia** (finanças) e **Ponte** (social), cada uma com sua capa e PDF próprios |

Cada item do `biblioteca.json` tem: `titulo`, `categoria`, `categoria_nome`, `descricao`, `capa` (caminho da imagem) e `pdf` (caminho do arquivo). **Atenção:** o valor de `categoria` precisa ser idêntico ao usado nos botões de filtro de `blog.html` (ex.: `devocional`, no singular) — um valor diferente faz o item deixar de aparecer ao filtrar.

Para adicionar um novo material: colocar o PDF e a capa dentro de `biblioteca/`, e acrescentar um novo objeto em `biblioteca.json` apontando para esses arquivos.

---

## Mapa de igrejas parceiras

A página `igrejas.html` exibe um mapa interativo (Leaflet + OpenStreetMap) com as igrejas cadastradas em `igrejas.json`. Para cada igreja são mostrados nome, endereço, telefone (com link direto para WhatsApp) e um botão de rota que abre o Google Maps com as coordenadas cadastradas.

Para cadastrar uma nova igreja parceira, adicionar um objeto em `igrejas.json` com `nome`, `endereco`, `cidade`, `estado`, `cep`, `telefone`, `latitude`, `longitude` e `coordenada_aproximada` (`true` quando a coordenada ainda não foi conferida com precisão).

---

## SEO

- Meta tags Open Graph e Twitter Card configuradas com URL absoluta do domínio.
- `robots.txt` e `sitemap.xml` publicados na raiz do site.
- Propriedade verificada no **Google Search Console** (método: tag HTML) e sitemap enviado.

---

## Como publicar atualizações

1. Editar os arquivos localmente (ou via Claude).
2. Subir as alterações para o repositório no GitHub.
3. O Cloudflare Pages/Workers publica automaticamente a nova versão a partir do repositório conectado.
4. Testar em aba anônima para evitar cache de navegador (especialmente após trocar o favicon ou atualizar `biblioteca.json`/`igrejas.json`).

---

## Próximos passos (roadmap)

- [x] Canal do YouTube
- [x] Chat de acolhimento com triagem
- [x] Integração com tawk.to
- [x] Central de Oração + Painel administrativo (Supabase)
- [x] SEO e Google Search Console
- [x] Jornada devocional "Conhecendo Jesus" (7 dias)
- [x] Biblioteca de Estudos (estudos, folhetos, doutrina e devocionais em PDF)
- [x] Devocional de 30 dias em 4 semanas temáticas (Raiz, Lar, Mordomia, Ponte)
- [x] Diretório/mapa de igrejas parceiras
- [ ] Paginação e atualização em tempo real (Supabase Realtime) no painel
- [ ] Área de pregações mais robusta (catálogo de vídeos)

---

## Responsável pelo projeto

**Pr. Jonatas H. Magalhães**
Projeto Oração e Palavra — © 2026
