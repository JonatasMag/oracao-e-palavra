# Oração e Palavra

> "Mas nós perseveraremos na oração e no ministério da palavra." — Atos 6:4

Site oficial do projeto **Oração e Palavra**: um espaço digital de evangelização, oração, acolhimento e ensino da Palavra de Deus, sob responsabilidade do **Pr. Jonatas H. Magalhães**.

🔗 Site: https://oracao-e-palavra.chazaq-adm.workers.dev/

---

## Visão geral

O projeto reúne, em um único ecossistema gratuito:

- Um **site público** com apresentação do ministério, pedidos de oração, chat de acolhimento com triagem automática e uma jornada devocional de estudo.
- Uma **Central de Oração** privada, onde a equipe autorizada acompanha e responde aos pedidos recebidos.
- Integração com **WhatsApp** (comunidade diária) e **YouTube** (pregações e conteúdos).
- Um **chat ao vivo** (tawk.to) como segunda camada de atendimento humano.

---

## Estrutura de arquivos

| Arquivo | Descrição |
|---|---|
| `index.html` | Site público: apresentação, comunidade, chat de acolhimento, formulário de pedido de oração, pregações, sobre o projeto. |
| `conhecendo-jesus.html` | Jornada devocional de 7 dias (Salvação, Verdade e Esperança), com referências bíblicas e orações guiadas. |
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

> **Escopo do ministério:** o ecossistema é dedicado ao apoio espiritual. Encaminhamento a autoridades ou órgãos competentes acontece apenas em casos específicos, avaliados pela equipe — não há sinalização automática de risco no painel administrativo por decisão do projeto.

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
4. Testar em aba anônima para evitar cache de navegador (especialmente após trocar o favicon).

---

## Próximos passos (roadmap)

- [x] Canal do YouTube
- [x] Chat de acolhimento com triagem
- [x] Integração com tawk.to
- [x] Central de Oração + Painel administrativo (Supabase)
- [x] SEO e Google Search Console
- [x] Jornada devocional "Conhecendo Jesus" (7 dias)
- [ ] Paginação e atualização em tempo real (Supabase Realtime) no painel
- [ ] Área de pregações mais robusta (catálogo de vídeos)
- [ ] Diretório de igrejas parceiras

---

## Responsável pelo projeto

**Pr. Jonatas H. Magalhães**
Projeto Oração e Palavra — © 2026
