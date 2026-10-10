-- Copia o conteúdo atual do site para o painel (rode UMA vez, depois do schema-cms.sql).
-- Só insere se as tabelas ainda estiverem vazias.

insert into public.materiais (titulo,categoria,categoria_nome,descricao,capa_url,pdf_url,ordem)
select * from (values
  ('6 Lições Surpreendentes de Gênesis','estudo','Estudo Bíblico','Uma reflexão sobre seis lições de Gênesis e como suas narrativas apontam para princípios espirituais relacionados à graça de Deus, responsabilidade humana, aliança, intercessão e transformação espiritual.','./biblioteca/Estudos/capas/1_6-Licoes-Surpreendentes-de-Genesis.png','./biblioteca/Estudos/6-Licoes-Surpreendentes-de-Genesis.pdf',0),
  ('Cinco Passos para o Homem Chegar à Eternidade','folheto','Folheto','Um roteiro simples e direto, com referências bíblicas: arrependimento, batismo, o dom do Espírito Santo, paz com todos e santidade no viver.','./biblioteca/Estudos/capas/CINCO%20PASSOS1.png','./biblioteca/folhetos/CINCO%20PASSOS.pdf',1),
  ('Mateus 28:19 — O Batismo Segundo a Ordem de Jesus','doutrina','Doutrina','Um estudo sobre a ordem de batismo dada por Jesus em Mateus 28:19, examinando como a igreja primitiva a cumpriu segundo o livro de Atos.','./biblioteca/Estudos/capas/mateus-28-19.png','./biblioteca/doutrina/mateus-28-19.pdf',2),
  ('O Que a Bíblia Fala Sobre o Batismo','doutrina','Doutrina','Um estudo doutrinário sobre o batismo nas águas à luz das Escrituras.','./biblioteca/Estudos/capas/o-que-a-biblia-fala-sobre-o-batismo.png','./biblioteca/doutrina/o-que-a-biblia-fala-sobre-o-batismo.pdf',3),
  ('1ª Semana - Raiz/Pessoal','devocional','Devocional','A vida pessoal com Deus em primeiro lugar - 7 dias de cura pessoal.','./biblioteca/Estudos/capas/pessoal.png','./biblioteca/devocionais/pessoal.pdf',4),
  ('2ª Semana - Lar/Família','devocional','Devocional','O amor que se multiplica em casa - 7 dias de cura Familiar.','./biblioteca/Estudos/capas/familia.png','./biblioteca/devocionais/familia.pdf',5),
  ('3ª Semana - Mordomia/Finanças','devocional','Devocional','Confiança nas mãos de Deus com o que Ele confiou às suas - 7 dias de cura Financeira.','./biblioteca/Estudos/capas/financeira.png','./biblioteca/devocionais/financeira.pdf',6),
  ('4ª Semana - Ponte/Social','devocional','Devocional','O amor que alcança o próximo - 7 dias de cura Social.','./biblioteca/Estudos/capas/social.png','./biblioteca/devocionais/social.pdf',7)) as v(titulo,categoria,categoria_nome,descricao,capa_url,pdf_url,ordem)
where not exists (select 1 from public.materiais);

insert into public.igrejas (nome,endereco,cidade,estado,cep,telefone,latitude,longitude)
select * from (values
  ('Igreja Pentecostal Unida do Brasil - Fátima','Rua Padre Augusto, 370 - Fátima','Joinville','SC','89229-030','47 9 9273-4973',-26.317315::float8,-48.8170867::float8)) as v(nome,endereco,cidade,estado,cep,telefone,latitude,longitude)
where not exists (select 1 from public.igrejas);

insert into public.pregacoes (tipo,titulo,descricao,url,ordem)
select * from (values
  ('PREGAÇÃO','Quando Jesus está no barco','Fé em meio à tempestade.','https://www.youtube.com/@ProjetoOra%C3%A7%C3%A3oePalavra/featured',1),
  ('ESTUDO BÍBLICO','Oração e ministério da Palavra','Atos 6:4 e a prioridade apostólica.','https://www.youtube.com/@ProjetoOra%C3%A7%C3%A3oePalavra/featured',2),
  ('PALAVRA DE HOJE','Uma palavra para o seu coração','Mensagens curtas para o cotidiano.','https://www.youtube.com/@ProjetoOra%C3%A7%C3%A3oePalavra/featured',3)
) as v(tipo,titulo,descricao,url,ordem)
where not exists (select 1 from public.pregacoes);
