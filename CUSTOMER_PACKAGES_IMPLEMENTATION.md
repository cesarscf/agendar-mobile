# Documentação: Aba de Pacotes do Cliente

## Visão Geral

A aba de pacotes é um componente que exibe os pacotes de serviços adquiridos por um cliente específico. Ela fornece uma visualização clara do status, progresso de uso e informações de pagamento de cada pacote.

**Localização**: `src/pages/app/customers/$customerId/-components/customer-packages.tsx`

---

## Estrutura de Dados

### Tipo `CustomerPackage`

```typescript
type CustomerPackage = {
  id: string;
  remainingSessions: number;
  totalSessions: number;
  paid: boolean;
  name: string | null;
  description: string | null;
  usedSessions: number;
};
```

**Campos**:
- `id`: Identificador único do pacote
- `remainingSessions`: Número de sessões/serviços restantes
- `totalSessions`: Total de sessões incluídas no pacote
- `paid`: Indica se o pagamento foi realizado
- `name`: Nome do pacote (opcional)
- `description`: Descrição do pacote (opcional)
- `usedSessions`: Número de sessões já utilizadas

---

## API

**Endpoint**: `GET /me/packages/:customerId`

**Função**: `getCustomerPackages(id: string)`

**Localização**: `src/http/customers/get-customer-packages.ts`

Retorna um array de pacotes (`CustomerPackage[]`) associados ao cliente.

---

## Componente Principal

### `CustomerPackages`

**Props**:
```typescript
interface CustomerPackagesProps {
  customerId: string;
}
```

### Tecnologias Utilizadas

- **React Query**: Gerenciamento de estado assíncrono e cache
- **Lucide React**: Ícones (CheckCircle, Clock, Loader2, Package)
- **shadcn/ui**: Componentes UI (Badge, Card, Progress)

---

## Estados do Componente

### 1. Loading (Carregando)

Exibe um spinner centralizado enquanto os dados são carregados.

```tsx
<Loader2 className="h-8 w-8 animate-spin" />
```

### 2. Error (Erro)

Mostra mensagem de erro caso a requisição falhe.

```
"Erro ao carregar pacotes do cliente"
```

### 3. Empty (Vazio)

Exibido quando o cliente não possui nenhum pacote.

**Elementos**:
- Ícone de pacote (Package)
- Título: "Nenhum pacote encontrado"
- Descrição: "Este cliente ainda não possui nenhum pacote de serviços."

### 4. Success (Sucesso com dados)

Renderiza a grid de pacotes com todas as informações.

---

## Lógica de Negócio

### Função `getPackageStatus`

Determina o status visual do pacote baseado nas sessões restantes:

| Condição | Status | Variante | Ícone |
|----------|--------|----------|-------|
| `remainingSessions === 0` | "Finalizado" | secondary | CheckCircle |
| `remainingSessions > 0` | "Em andamento" | default | Clock |
| Outros casos | "Inativo" | outline | Package |

### Função `getUsagePercentage`

Calcula a porcentagem de uso do pacote:

```typescript
(usedSessions / totalSessions) * 100
```

---

## Interface do Usuário

### Layout

```
┌─────────────────────────────────────────────┐
│ 📦 Pacotes de Serviços                      │
└─────────────────────────────────────────────┘
┌──────────┬──────────┬──────────┐
│ Pacote 1 │ Pacote 2 │ Pacote 3 │
│          │          │          │
└──────────┴──────────┴──────────┘
```

**Grid responsiva**:
- Desktop (lg): 3 colunas
- Tablet (md): 2 colunas
- Mobile: 1 coluna

### Card de Pacote

Cada card contém:

#### Header
- **Nome do pacote** (ou "Pacote sem nome" se null)
- **Badge de status** com ícone e label
- **Descrição** (se disponível)

#### Content

1. **Barra de Progresso**
   - Label: "Progresso de uso"
   - Porcentagem calculada
   - Componente Progress visual

2. **Grid de Estatísticas** (2 colunas)
   - Serviços usados: `usedSessions`
   - Serviços restantes: `remainingSessions`

3. **Total de Serviços**
   - Display do `totalSessions`

4. **Status de Pagamento**
   - Badge verde ("Pago") se `paid === true`
   - Badge vermelho ("Pendente") se `paid === false`

---

## Fluxo de Dados

```
┌─────────────┐
│   Cliente   │
│  (User ID)  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│   React Query       │
│ queryKey: customer- │
│   packages + id     │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ getCustomerPackages │
│   (API Call)        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  CustomerPackage[]  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Render UI Cards    │
└─────────────────────┘
```

---

## Cache e Otimizações

**Query Key**: `["customer-packages", customerId]`

O React Query gerencia automaticamente:
- Cache dos dados por cliente
- Revalidação em background
- Deduplicação de requisições
- Loading states

---

## Exemplos de Estados Visuais

### Pacote em Andamento
```
┌────────────────────────────────────┐
│ Pacote Premium        🕐 Em andamento │
│ Sessões de massagem relaxante      │
├────────────────────────────────────┤
│ Progresso de uso          60%      │
│ ████████████░░░░░░░░               │
│                                    │
│ Serviços usados:      6            │
│ Serviços restantes:   4            │
│ Total de serviços:    10           │
│                                    │
│ Status do pagamento:  ✓ Pago      │
└────────────────────────────────────┘
```

### Pacote Finalizado
```
┌────────────────────────────────────┐
│ Pacote Básico        ✓ Finalizado  │
├────────────────────────────────────┤
│ Progresso de uso         100%      │
│ ████████████████████████           │
│                                    │
│ Serviços usados:      5            │
│ Serviços restantes:   0            │
│ Total de serviços:    5            │
│                                    │
│ Status do pagamento:  ⚠ Pendente  │
└────────────────────────────────────┘
```

---

## Possíveis Melhorias Futuras

1. **Filtros e Ordenação**
   - Filtrar por status (ativo, finalizado, pendente)
   - Ordenar por data de criação ou nome

2. **Ações sobre Pacotes**
   - Botões para renovar pacote
   - Editar informações
   - Gerar relatório de uso

3. **Detalhes Expandidos**
   - Histórico de sessões utilizadas
   - Datas de uso
   - Profissionais que realizaram os serviços

4. **Notificações**
   - Alerta quando pacote estiver próximo do fim
   - Notificação de pagamento pendente

5. **Imagem do Pacote**
   - Campo `image` já existe no tipo mas está comentado
   - Poderia exibir imagem ilustrativa do pacote

---

## Dependências

```json
{
  "@tanstack/react-query": "Gerenciamento de estado",
  "lucide-react": "Ícones",
  "@/components/ui/badge": "Componente Badge",
  "@/components/ui/card": "Componente Card",
  "@/components/ui/progress": "Barra de progresso"
}
```

---

## Considerações de UX

- **Feedback visual claro**: Cores e ícones distintos para cada status
- **Informação hierarquizada**: Dados mais importantes em destaque
- **Responsividade**: Adapta-se a diferentes tamanhos de tela
- **Loading states**: Evita frustração durante o carregamento
- **Empty states**: Orientação clara quando não há dados
- **Accessibility**: Uso de cores contrastantes e semântica adequada
