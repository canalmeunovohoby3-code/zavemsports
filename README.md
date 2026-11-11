# ZEVEN SPORTS — Loja virtual

Loja virtual completa da ZEVEN SPORTS, construída com Next.js 16, React 19, Tailwind CSS 4 e SQLite. O projeto sai de fábrica **sem produtos, sem preços e sem imagens de catálogo**: o catálogo é criado pelo painel administrativo, com o conteúdo real fornecido pela loja.

## Direção visual

- Fundo predominante claro: branco nas vitrines e off-white `#F7F7F5` em seções alternadas.
- Preto `#000000` em textos, navegação e títulos.
- Verde-limão `#ACFA04` em botões, etiquetas e pequenos detalhes de marca.
- Cabeçalho branco com busca, navegação por categoria e sacola.
- Home organizada como e-commerce: banner comercial largo, vitrines de produtos logo no início, categorias visuais, benefícios e bloco institucional no fim da página.
- O painel administrativo permanece em tema escuro para leitura operacional, sem alterar as funcionalidades.
- Fotos editoriais de Pexels/Unsplash são temporárias e substituíveis. Nenhum produto fictício é publicado.

## Requisitos

- Node.js 22 ou superior
- NPM 10 ou superior
- Sistema com disco persistente para o banco SQLite e os uploads

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

Na primeira execução:

1. No terminal do projeto, execute `npm run admin:create` e informe nome, e-mail e senha (mínimo de 10 caracteres). Não existe cadastro administrativo público.
2. Acesse `/admin/login` com o acesso criado.
3. Cadastre os produtos, imagens, preços e a grade de tamanhos.
4. Configure logo, banner, WhatsApp e Instagram em `/admin/configuracoes`.
5. Monte as seções da home em `/admin/vitrines`.

O banco e as pastas de dados são criados automaticamente na primeira requisição.

## Scripts

```bash
npm run dev        # ambiente de desenvolvimento
npm run build      # build de produção
npm start          # servidor de produção
npm run lint       # ESLint
npm run typecheck  # TypeScript
npm run admin:create # cria o primeiro administrador (executar uma única vez)
```

## Arquitetura

- **Next.js 16 / App Router / React 19**: páginas da loja, painel administrativo e Server Actions.
- **Tailwind CSS 4**: design system em `src/app/globals.css`.
- **SQLite + better-sqlite3**: banco local em `data/zeven.db`, sem serviço externo.
- **Sharp**: validação e conversão das imagens enviadas para WebP.
- **bcryptjs + sessões em banco**: autenticação administrativa com cookie `httpOnly`.
- **Zod**: validação de formulários e dados no servidor.

Estrutura principal:

```
src/
  app/
    (store)/          loja pública
    admin/            login, setup e painel protegido
    api/              uploads e mídia
  components/         UI da loja e do painel
  config/site.ts      identidade e padrões centralizados
  lib/                banco, consultas, sessão, pedidos, validação
  data/               banco e uploads (não versionados)
```

## Configuração centralizada

- **Identidade e contatos padrão**: `src/config/site.ts`.
- **Configurações editáveis**: `/admin/configuracoes` (banner, anúncio, logo, WhatsApp, Instagram, e-mail). O painel grava no banco e alimenta toda a loja.
- **WhatsApp**: o número informado pela cliente, `(16) 99774-070`, está salvo como **pendente de confirmação**. O sistema não cria link `wa.me` enquanto o número não for um celular válido com DDD. Exiba-o como contato e use o painel para atualizar após a confirmação oficial.
- **Instagram**: espaço preparado. Enquanto não houver URL, a loja exibe “Em breve”. Com a URL, o rodapé mostra um link para o perfil.
- **Logo**: a logo oficial já está aplicada em `public/brand/logo-zeven.png` e configurada como padrão. O cabeçalho e o painel usam a imagem; uma nova versão pode ser enviada em `/admin/configuracoes`.
- **Banner**: a home usa uma foto editorial horizontal temporária em um banner comercial largo. Ao enviar uma imagem em `/admin/configuracoes`, a imagem oficial substitui a temporária. As imagens de categoria também podem ser trocadas no painel.
- **Imagens editoriais temporárias**: banner, categorias e institucional usam fotos de Pexels/Unsplash como referência visual. Elas não representam produtos reais da cliente e devem ser substituídas pelas fotos oficiais. Consulte `docs/IMAGENS-TEMPORARIAS.md`.

## Catálogo e estoque

- Categorias iniciais criadas automaticamente: Camisetas Adulto, Bermudas Adulto, Camisetas Plus Size, Bermudas Plus Size, Camisetas Infantil e Bermudas Infantil.
- Cada produto tem sua própria grade de tamanhos. O admin pode:
  - criar tamanhos manualmente;
  - usar as predefinições **Plus G1–G3** e **Infantil 02–14**;
  - usar “Tamanho único”;
  - definir estoque e SKU por tamanho.
- A grade adulto completa **não foi inventada**. O painel informa que ela deve ser cadastrada conforme a confirmação da cliente.
- Tamanhos sem estoque aparecem riscados/desabilitados na loja e não podem ser adicionados ao carrinho.
- O estoque é reduzido em transação no momento em que o pedido é registrado. Ao cancelar o pedido, as quantidades são devolvidas.
- Produtos inativos não aparecem na loja nem nos filtros públicos.

## Carrinho e checkout

- Carrinho persistido no navegador (`localStorage`), com gaveta lateral e página completa.
- O checkout recalcula preços e estoque no servidor; valores enviados pelo navegador não são confiáveis.
- O pedido é registrado com status **Aguardando pagamento**. Nenhuma transação é apresentada como aprovada.
- Endereço de entrega com preenchimento de CEP via ViaCEP (serviço gratuito, sem credenciais).
- Frete e prazo **não são inventados**: o checkout exibe “A calcular” e informa que serão confirmados pela loja. A abstração está em `src/lib/shipping.ts`.
- Após o pedido, o cliente recebe um link com token para acompanhar o status. A consulta em `/conta` exige número do pedido + e-mail.

## Pagamentos

O pagamento on-line **não está integrado**. O fluxo implementado é:

1. O pedido é gravado como `pending_payment`.
2. A loja confirma o recebimento manualmente no painel.
3. O status avança conforme a operação (pagamento confirmado, preparação, envio, entrega).
4. Cancelamentos devolvem o estoque.

O adapter está preparado em `src/lib/payments.ts` (`PaymentAdapter`, `PaymentIntentInput`, `PaymentIntentResult`) e retorna `null` enquanto não houver implementação real. Nenhum dado de cartão é solicitado no site. Leia `docs/INTEGRACAO-PAGAMENTOS.md` antes de integrar PIX/cartão.

## Painel administrativo

Rotas protegidas:

- `/admin` — visão geral, pendências, pedidos recentes e estoque baixo
- `/admin/produtos` — catálogo, imagens, preço, destaque e status
- `/admin/categorias` — organização de linhas e tipos
- `/admin/vitrines` — vitrines e seções da página inicial, com produtos e ordem próprios
- `/admin/pedidos` — pedidos, status e restauração de estoque no cancelamento
- `/admin/clientes` — dados de contato e pedidos
- `/admin/configuracoes` — banner, logo, WhatsApp, Instagram e anúncio
- `/admin/conta` — troca de senha (encerra todas as sessões)

A sessão usa cookie `httpOnly`, `SameSite=Lax` e expira em 7 dias. O primeiro administrador é criado apenas pelo comando `npm run admin:create`, no servidor. A rota pública de setup foi removida; o login e a sessão exigem `role = admin` no banco.

## Vitrines da página inicial

- Gerenciadas em `/admin/vitrines`.
- Cada vitrine tem título, subtítulo, imagem opcional, status, ordem, modo de seleção e produtos próprios.
- Modos disponíveis: seleção manual, mais vendidos, novidades, por categoria e por público.
- A seleção manual permite adicionar, remover e reordenar produtos sem alterar o catálogo.
- A home exibe apenas vitrines ativas, na ordem definida, e apenas produtos ativos.
- As seis vitrines iniciais são criadas uma única vez, sem duplicação, quando a tabela está vazia.

## Acesso temporário de demonstração (somente desenvolvimento)

Para apresentar o painel sem criar o acesso definitivo da proprietária:

```bash
npm run admin:demo
```

O comando cria ou rotaciona o usuário `demo@zeven.local`, gera uma senha aleatória, grava apenas o hash bcrypt e exibe a senha uma única vez no terminal. A sessão dura até 8 horas.

- Funciona somente com `NODE_ENV=development`.
- É bloqueado em produção mesmo que o usuário exista no banco.
- Não reabre `/admin/setup`.
- Para encerrar e apagar as sessões: `npm run admin:demo:remove`.
- Nenhuma senha fixa é gravada no código ou no repositório.

Antes de criar o acesso definitivo com `npm run admin:create`, remova o acesso de demonstração.

## Uploads

- Imagens são validadas, convertidas para WebP e salvas em `data/uploads`.
- Limite: 8 MB por arquivo; formatos JPG, PNG, WEBP e AVIF.
- Servidas por `/api/media/[arquivo]` com cache imutável.
- A rota de upload exige sessão administrativa e valida a origem da requisição.
- Em produção, use **disco persistente** ou migre a função de storage para S3/Cloudinary. Arquivos removidos de um produto não são apagados automaticamente do disco; faça limpeza periódica se necessário.

## Banco de dados

Arquivo padrão: `data/zeven.db` (SQLite, WAL). As tabelas são criadas de forma idempotente no primeiro acesso:

- `users`, `admin_sessions`
- `categories`, `products`, `product_images`, `product_variants`
- `customers`
- `orders`, `order_items`
- `settings`
- `home_sections`, `home_section_products`

Para reiniciar o ambiente de desenvolvimento, pare o servidor e remova a pasta `data/` (isso apaga catálogo, pedidos e uploads). **Nunca faça isso em produção sem backup.**

## Segurança

- Senhas com bcrypt (custo 12).
- Sessões revogáveis armazenadas no banco; token do cookie é hasheado.
- Rate limit básico de tentativas de login em memória (5 falhas por e-mail em 15 minutos). Em múltiplas instâncias, use Redis.
- Todas as consultas SQL usam prepared statements.
- Server Actions validam sessão e dados no servidor; preços e estoque são recalculados.
- Pedido e estoque são gravados na mesma transação; redução de estoque usa atualização condicional.
- JSON-LD é escapado para evitar injeção via conteúdo administrativo.
- Cabeçalhos `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy` e `Permissions-Policy`.
- Cookie de sessão fica `secure` em produção. Use HTTPS.
- **Crie o administrador via CLI** (`npm run admin:create`) antes de liberar o painel. Não existe rota pública de cadastro administrativo.
- O papel `role` é verificado no login e na validação de cada sessão; somente usuários `admin` acessam o painel.
- No modo demonstração da Vercel, todas as rotas administrativas e `/api/admin/*` são bloqueadas antes de qualquer acesso ao banco.

## Deploy e operação

Recomendado: VPS/Node.js com disco persistente, atrás de proxy HTTPS (Nginx/Caddy).

```bash
npm ci
npm run build
npm start
```

- Defina `NEXT_PUBLIC_SITE_URL` com a URL pública.
- Defina `DATABASE_PATH` e `UPLOAD_DIR` para caminhos persistentes fora da pasta de build.
- Faça backup periódico de `data/zeven.db` e `data/uploads`.
- **Não use Vercel/serverless** com SQLite e uploads locais: o sistema de arquivos não é persistente. Se for necessário serverless, migre o banco para Postgres e os uploads para storage externo.
- Configure um gateway de pagamento apenas depois de credenciais reais e revisão do fluxo.

### Demonstração pública na Vercel (sem SQLite)

Para publicar a loja apenas para apresentação, sem banco persistente:

1. Configure na Vercel:
   - `STORE_DEMO_MODE=true`
   - `NEXT_PUBLIC_SITE_URL=https://seu-endereco.vercel.app`
2. Não configure `DATABASE_PATH` nem `UPLOAD_DIR` para essa demonstração.
3. Faça o deploy normalmente.

No modo demo:

- A loja pública usa dados versionados em `src/lib/demo-data.ts`.
- São carregadas as seis categorias e as seis vitrines, sem produtos.
- Nenhuma consulta, migração ou criação de arquivo SQLite é executada.
- Nenhum upload local é necessário; todas as imagens usadas estão em `public/`.
- `/admin`, `/admin/login` e `/api/admin/*` ficam bloqueados com uma mensagem própria.
- Checkout e consulta de pedidos ficam indisponíveis.

Para desativar, remova `STORE_DEMO_MODE` ou defina `STORE_DEMO_DISABLE=true` e faça novo deploy. **Nunca deixe o modo demo ativo na produção definitiva.**

## O que ainda depende da cliente

- Imagens oficiais do banner/campanha (a logo já foi aplicada).
- Grade adulto completa (além de G1, G2 e G3 já confirmados).
- Confirmação do número de WhatsApp.
- URL do Instagram.
- Catálogo real: nomes, descrições, composições, preços, imagens e estoque.
- Políticas de troca/devolução e informações de frete/prazo.
- Credenciais do gateway de pagamento, se houver cobrança on-line.
- Dados legais/CNPJ e canais oficiais que devem constar no rodapé.

Não foram criados produtos, preços, avaliações, prazos ou valores de frete fictícios.
