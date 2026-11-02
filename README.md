# Palito

PWA de picolés gourmet. Clientes montam o pedido pelo catálogo e pagam na entrega; o vendedor cuida do estoque, dos pedidos e do QR code do catálogo.

Next.js 16 (App Router, Cache Components) · Postgres com Drizzle · fotos no Cloudinary · Tailwind 4.

## Configuração

Copie `.env.example` para `.env` e preencha `DATABASE_URL`, `CLOUDINARY_URL` e `AUTH_SECRET` (`openssl rand -base64 32`).

```bash
npm install
npm run db:push                               # cria as tabelas
npm run db:seed                               # categorias iniciais e 6 sabores de exemplo (cada um só se a tabela estiver vazia)
npm run vendedor -- voce@email.com sua-senha  # cria a conta do vendedor ou troca a senha
npm run dev
```

## Telas

| Caminho | Quem | O quê |
| --- | --- | --- |
| `/` | cliente | catálogo para pedir; a sacola fica guardada no aparelho |
| `/cardapio` | cliente | só o cardápio (sabores, preços e quantos restam), sem sacola |
| `/sacola` | cliente | forma de pagamento (Pix, Crédito/Débito, Dinheiro) e envio do pedido |
| `/pedido/[token]` | cliente | confirmação do pedido |
| `/vendedor/login` | vendedor | entrar |
| `/vendedor/estoque` | vendedor | ajustar estoque, mostrar/ocultar sabores |
| `/vendedor/produtos/novo`, `/vendedor/produtos/[id]` | vendedor | cadastro com até 4 fotos e categoria |
| `/vendedor/categorias` | vendedor | adicionar e remover categorias (remover não apaga sabores; eles vão para "Outros") |
| `/vendedor/pedidos` | vendedor | confirmar ("Vendido · baixar estoque") ou recusar; atualiza a cada 20 s |
| `/vendedor/pedidos/avulsa` | vendedor | registrar venda feita fora do app |
| `/vendedor/qrcode` | vendedor | QR de qualquer um dos dois links: baixar cartaz, imprimir, compartilhar |

As perguntas de nome, WhatsApp, entrega/retirada e observação estão desligadas. Para voltar a pedir esses dados, mude `ASK_CUSTOMER_INFO` para `true` em `src/lib/ordering.ts`.

Um pedido do cliente **não** baixa o estoque sozinho; o estoque só baixa quando o vendedor confirma a venda.

## PWA

O manifesto está em `src/app/manifest.ts` e o service worker em `public/sw.js`, registrado só em produção. O catálogo e a sacola abrem sem internet; as telas do vendedor não ficam guardadas no aparelho. Para instalar no celular, o app precisa estar em HTTPS.

Para gerar os ícones de novo: `npm run icons`.

`NEXT_PUBLIC_APP_URL` (opcional) define o endereço que vai no QR code; sem ele, usa o endereço aberto no navegador.
