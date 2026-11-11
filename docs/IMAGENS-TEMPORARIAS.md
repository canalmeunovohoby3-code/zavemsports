# Imagens editoriais temporárias

As fotos abaixo foram usadas apenas para validar a direção visual da loja clara e comercial. Elas **não são produtos oficiais da ZEVEN SPORTS** e devem ser substituídas pelas imagens da campanha e do catálogo da cliente antes do lançamento.

Arquivos em `public/editorial/`:

| Arquivo | Uso | Origem |
| --- | --- | --- |
| `hero-banner.webp` | Banner principal (horizontal) | Pexels, foto 9775889 |
| `category-adulto.webp` | Categoria Adulto | Pexels, foto 19538064 |
| `category-plus.webp` | Categoria Plus Size | Pexels, foto 9164777 |
| `category-infantil.webp` | Categoria Infantil | Pexels, foto 6261878 |
| `category-camisetas.webp` | Categoria Camisetas | Unsplash, `1523381210434-271e8be1f52b` |
| `category-bermudas.webp` | Categoria Bermudas | Pexels, foto 20236324 |
| `kids-feature.webp` | Imagem de apoio infantil/bermudas infantis | Pexels, foto 15179150 |
| `institutional.webp` | Bloco institucional | Unsplash, `1558769132-cb1aea458c5e` |

Licenças: Pexels e Unsplash permitem uso gratuito, incluindo comercial, conforme seus termos. Revise as licenças atuais antes da publicação.

## Como substituir

- **Banner**: `/admin/configuracoes` → Banner da página inicial → enviar imagem.
- **Imagem de categoria**: `/admin/categorias/[id]` → Imagem da categoria.
- **Plus size e infantil**: ao cadastrar imagem nas categorias de camisetas plus size/infantil, a home usa essa imagem nos destaques.
- **Institucional e demais imagens fixas**: substituir os arquivos em `public/editorial/` ou atualizar as referências em `src/config/editorial.ts`.
- **Produtos**: as imagens reais devem ser enviadas no cadastro de cada produto no painel.

## Produtos de teste

Os produtos usados na auditoria visual eram temporários e foram removidos. O banco entregue ao cliente não contém produtos, pedidos ou administradores de teste.
