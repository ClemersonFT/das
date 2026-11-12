# Sistema de Chamados: front-end

Interface em Vue 3 + TypeScript para a API REST do Sistema de Chamados (Spring Boot).
Sem bibliotecas de UI: só Vue, Vue Router e CSS próprio.

## Como rodar

1. Suba o back-end (porta 8080): `.\mvnw spring-boot:run`
2. Neste diretório: `npm install` e depois `npm run dev`
3. Abra http://localhost:5173

Requer Node 20.19+ ou 22+.

O front chama `/api/...` e o Vite repassa para `http://localhost:8080` (veja `vite.config.ts`).
Por isso não é preciso configurar CORS no Spring. O H2 é em memória: os dados somem quando o back reinicia.

## Telas (mapa de telas do guia, Figura 11)

| Rota | Tela |
|---|---|
| `/` | Painel: totais por status e prioridade, chamados recentes |
| `/chamados` | Lista com filtros (status, prioridade, cliente) e paginação, tudo na URL |
| `/chamados/novo`, `/chamados/:id/editar` | Formulário de chamado |
| `/chamados/:id` | Detalhe: status, técnico, comentários |
| `/clientes`, `/clientes/:id` | Cadastro e detalhe com os chamados do cliente |
| `/categorias`, `/tecnicos` | Cadastros |

## Padrão Z

O olhar percorre a página em Z: topo (esquerda para direita), diagonal até o canto inferior esquerdo, base (esquerda para direita).

| Traço | O que fica ali |
|---|---|
| Topo | Marca à esquerda; navegação e **Abrir chamado** à direita. Em cada página, título à esquerda e ação da página à direita |
| Diagonal | No painel, quatro tickets descem da direita para a esquerda na ordem do ciclo do chamado (Abertos, Em atendimento, Aguardando cliente, Fechados). No detalhe, a coluna Andamento (direita) leva à descrição e aos comentários (esquerda) |
| Base | Contexto à esquerda (contagem, Cancelar); ação final à direita (Próxima página, Salvar, Enviar comentário, Cadastrar) |

O amarelo só aparece em ações, justamente onde o olhar termina cada traço.

## Estrutura

```
src/
  api/          tipos dos DTOs, cliente HTTP (erros do GlobalExceptionHandler) e endpoints
  composables/  useLookups (nomes por ID), useCrud (modal criar/editar/excluir), useToast
  components/   cabeçalho, tabela de chamados, modal, selos, paginação...
  views/        uma por tela
  style.css     tokens e estilos globais
```

## Limitações conhecidas

- Excluir cliente, categoria ou técnico com chamados, ou chamado com comentários, retorna 500 no back (chave estrangeira). O front mostra uma mensagem explicando.
- Sem login (a Figura 11 prevê como "futuro").
