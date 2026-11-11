# Checklist de lançamento — ZEVEN SPORTS

## Informações e materiais da cliente

- [ ] Logo oficial (PNG com boa resolução ou vetor).
- [ ] Imagem oficial do banner/campanha (se a loja for usar foto no hero).
- [ ] Imagens oficiais de cada produto.
- [ ] Nomes, descrições e composição dos produtos.
- [ ] Preços e preços anteriores (se houver).
- [ ] Grade adulto completa.
- [ ] Confirmação do WhatsApp com DDD e nono dígito.
- [ ] URL do Instagram.
- [ ] Política de trocas e devoluções.
- [ ] Prazo e valor de frete ou integração escolhida.
- [ ] Credenciais do gateway de pagamento, se houver cobrança on-line.
- [ ] CNPJ, razão social e endereço fiscal que devem constar no rodapé.
- [ ] E-mail oficial de atendimento.

## Cadastro

- [ ] Criar o administrador em `/admin/setup` imediatamente após o deploy.
- [ ] Enviar a logo em `/admin/configuracoes`.
- [ ] Enviar o banner, se aplicável, e revisar o texto de apoio.
- [ ] Confirmar o número de WhatsApp e o link de atendimento.
- [ ] Configurar Instagram e e-mail.
- [ ] Revisar categorias e ordem do menu.
- [ ] Cadastrar cada produto com imagens, preço, descrição e grade própria.
- [ ] Conferir estoque por tamanho e desativar produtos sem disponibilidade.
- [ ] Marcar produtos de destaque para a home.

## Testes antes de vender

- [ ] Abrir todas as categorias no celular e no desktop.
- [ ] Testar tamanho esgotado: o botão deve ficar desabilitado.
- [ ] Adicionar ao carrinho, alterar quantidade e remover.
- [ ] Finalizar um pedido de teste e conferir:
  - [ ] estoque reduzido;
  - [ ] status “Aguardando pagamento”;
  - [ ] confirmação e acompanhamento;
  - [ ] pedido visível no painel;
  - [ ] cancelamento devolvendo o estoque.
- [ ] Confirmar que nenhum valor de frete ou aprovação de pagamento é fictício.
- [ ] Revisar o console do navegador em busca de erros.
- [ ] Testar login, logout e troca de senha no admin.

## Produção

- [ ] Domínio e HTTPS configurados.
- [ ] `NEXT_PUBLIC_SITE_URL` com a URL final.
- [ ] Disco persistente para `data/zeven.db` e `data/uploads`.
- [ ] Backup automático do banco e dos uploads.
- [ ] `PAYMENT_PROVIDER=none` até a integração estar pronta.
- [ ] Revisão final com a cliente antes de divulgar a loja.
