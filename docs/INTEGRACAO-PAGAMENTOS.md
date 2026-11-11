# Integração de pagamentos

## Situação atual

A loja **não processa cobranças**. O checkout registra o pedido com status `pending_payment` (“Aguardando pagamento”) e o administrador confirma o recebimento manualmente. Nenhuma transação é marcada como aprovada automaticamente e nenhum dado de cartão é solicitado no site.

O ponto de extensão está em `src/lib/payments.ts`:

- `PaymentIntentInput`
- `PaymentIntentResult`
- `PaymentAdapter`
- `getPaymentAdapter()` — atualmente retorna `null`

Também existe `getPaymentProviderStatus()` para exibir no painel se há credenciais configuradas. Credenciais presentes **não** significam integração concluída.

## Recomendação de arquitetura

Usar um provedor com **checkout hospedado** (Mercado Pago Checkout Pro, Stripe Checkout ou equivalente) para PIX e cartão. O cliente é redirecionado para o ambiente do provedor; o site não recebe nem armazena dados de cartão. Isso reduz o escopo PCI.

Fluxo sugerido:

1. Checkout valida carrinho, endereço e estoque no servidor.
2. Pedido é criado no banco com `pending_payment`.
3. Backend cria uma preferência/sessão no provedor com:
   - número do pedido;
   - valor em centavos;
   - método escolhido;
   - nome, e-mail e telefone do cliente;
   - URL de retorno para `/pedido/[token]`.
4. A resposta do provedor é gravada (referência externa e URL de pagamento).
5. Cliente é direcionado ao checkout hospedado.
6. O status do pedido só muda para `confirmed` após um **webhook assinado e verificado** informar pagamento aprovado.
7. O admin acompanha o pedido e avança o status operacional.

## O que implementar

### 1. Persistência

Adicionar campos ao pedido (com migração idempotente em `src/lib/schema.ts`):

- `payment_provider`
- `payment_reference`
- `payment_status`
- `paid_at`

E, preferencialmente, uma tabela `payment_events` para idempotência de webhooks.

### 2. Adapter

Implementar `getPaymentAdapter()` para retornar um objeto que cumpra `PaymentAdapter`, somente quando as credenciais estiverem presentes **e** o código de integração estiver concluído. Não retornar um adapter simulado em produção.

O método `createPayment` deve:

- criar a cobrança no provedor com valor calculado no servidor;
- nunca aceitar preço vindo do navegador;
- devolver `status: "pending"` com `providerReference` e `redirectUrl`;
- lançar erro se a configuração estiver incompleta.

### 3. Webhook

Criar uma rota dedicada (por exemplo `src/app/api/payments/webhook/route.ts`) que:

- valide a assinatura/segredo do provedor;
- leia o evento bruto, sem confiar apenas no corpo JSON;
- registre o evento com chave idempotente;
- localize o pedido por número ou referência;
- confira valor e moeda;
- marque `confirmed` somente em evento de pagamento aprovado;
- não use a página de retorno do cliente como confirmação;
- responda rápido e processe de forma tolerante a reenvios.

### 4. Cancelamento e reembolso

- Cancelar o pedido no painel devolve o estoque (já implementado).
- Se o pagamento já tiver sido capturado, o cancelamento deve gerar estorno no provedor e registrar o retorno.
- Nunca devolver estoque duas vezes: a transição de status é validada no servidor.

## Variáveis de ambiente

O `.env.example` já prevê:

```env
PAYMENT_PROVIDER=none
# MERCADOPAGO_ACCESS_TOKEN=
# MERCADOPAGO_PUBLIC_KEY=
# STRIPE_SECRET_KEY=
# PAYMENT_WEBHOOK_SECRET=
```

Mantenha `PAYMENT_PROVIDER=none` até a integração estar testada.

## Checklist de segurança

- [ ] Nenhum dado de cartão trafega pelo site.
- [ ] Preço recalculado no servidor.
- [ ] Webhook com assinatura verificada.
- [ ] Idempotência de eventos.
- [ ] Confirmação apenas pelo provedor, nunca pelo redirecionamento do navegador.
- [ ] Logs sem dados sensíveis.
- [ ] HTTPS em produção.
- [ ] Testes em sandbox antes de ativar.
- [ ] Reembolso e conciliação documentados.

## O que NÃO fazer

- Não marcar pedidos como pagos automaticamente por ausência de gateway.
- Não exibir “pagamento aprovado” sem confirmação real.
- Não armazenar número completo de cartão, CVV ou senha.
- Não usar credenciais de terceiros sem autorização.
- Não contratar gateway pago sem aprovação da cliente.
