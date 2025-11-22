# Documentação: Aba de Fidelidade do Cliente

## Visão Geral

A aba de fidelidade é um componente que exibe os programas de fidelidade dos quais um cliente participa. Ela fornece uma visualização clara do progresso de pontuação, status de cada programa e a possibilidade de resgate de recompensas.

**Localização**: `src/pages/app/customers/$customerId/-components/customer-loyalty-programs.tsx`

---

## Estrutura de Dados

### Tipo `CustomerLoyaltyProgram`

```typescript
type CustomerLoyaltyProgram = {
  id: string;
  name: string;
  points: number;
  requiredPoints: number;
  active: boolean;
  rewardService: {
    id: string;
    name: string;
  };
  progress: number;
  canRedeem: boolean;
};
```

**Campos**:
- `id`: Identificador único do programa de fidelidade
- `name`: Nome do programa
- `points`: Pontuação atual do cliente no programa
- `requiredPoints`: Pontos necessários para resgatar a recompensa
- `active`: Indica se o programa está ativo
- `rewardService`: Objeto contendo informações do serviço de recompensa
  - `id`: ID do serviço
  - `name`: Nome do serviço que será oferecido como recompensa
- `progress`: Porcentagem de progresso (0-100) calculada automaticamente
- `canRedeem`: Indica se o cliente já pode resgatar a recompensa

---

## API

**Endpoint**: `GET /my-loyalty-programs`

**Função**: `getCustomerLoyaltyPrograms({ customerPhone: string })`

**Localização**: `src/http/customers/get-customer-loyalty-programs.ts`

**Headers personalizados**:
- `x-customer-phone`: Telefone do cliente para identificação

Retorna um objeto contendo um array de programas de fidelidade (`GetCustomerLoyaltyProgramResponse`).

---

## Componente Principal

### `CustomerLoyaltyPrograms`

**Props**:
```typescript
interface CustomerLoyaltyProgramsProps {
  customerPhone: string;
}
```

### Tecnologias Utilizadas

- **React Query**: Gerenciamento de estado assíncrono e cache
- **Lucide React**: Ícones (Gift, Loader2, Star)
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
"Erro ao carregar programas de fidelidade"
```

### 3. Empty (Vazio)

Exibido quando o cliente não participa de nenhum programa de fidelidade.

**Elementos**:
- Ícone de presente (Gift)
- Título: "Nenhum programa de fidelidade"
- Descrição: "Este cliente ainda não participa de nenhum programa de fidelidade."

### 4. Success (Sucesso com dados)

Renderiza a grid de programas com todas as informações.

---

## Lógica de Negócio

### Status do Programa

O status visual é determinado pelo campo `active`:

| Valor | Badge | Variante |
|-------|-------|----------|
| `true` | "Ativo" | default |
| `false` | "Inativo" | secondary |

### Indicador de Resgate

Quando `canRedeem === true`, um badge especial é exibido:
- Cor verde com ícone de presente
- Texto: "Pode resgatar recompensa"
- Estilo: outline com border e texto verde

### Cálculo de Progresso

O progresso é calculado no backend e retornado como porcentagem (0-100).

```typescript
Math.round(program.progress) // Arredonda para número inteiro
```

---

## Interface do Usuário

### Layout

```
┌─────────────────────────────────────────────┐
│ ⭐ Programas de Fidelidade                  │
└─────────────────────────────────────────────┘
┌──────────┬──────────┬──────────┐
│ Programa │ Programa │ Programa │
│    1     │    2     │    3     │
└──────────┴──────────┴──────────┘
```

**Grid responsiva**:
- Desktop (lg): 3 colunas
- Tablet (md): 2 colunas
- Mobile: 1 coluna

### Card de Programa

Cada card contém:

#### Header
- **Nome do programa** (título)
- **Badge de status** (Ativo/Inativo)
- **Nome do serviço de recompensa** (subtítulo em texto muted)

#### Content

1. **Barra de Progresso**
   - Label: "Progresso"
   - Porcentagem arredondada
   - Componente Progress visual (altura 2)

2. **Pontos Atuais**
   - Label: "Pontos atuais"
   - Valor em destaque

3. **Pontos Necessários**
   - Label: "Pontos necessários"
   - Valor em destaque

4. **Badge de Resgate** (condicional)
   - Exibido apenas quando `canRedeem === true`
   - Ícone de presente + texto
   - Largura total, centralizado
   - Estilo verde

---

## Fluxo de Dados

```
┌─────────────┐
│   Cliente   │
│ (Phone)     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│   React Query       │
│ queryKey: customer- │
│ loyalty-programs +  │
│   phone             │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────────┐
│ getCustomerLoyalty      │
│   Programs (API Call)   │
│ Header: x-customer-phone│
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  CustomerLoyalty        │
│     Program[]           │
└──────┬──────────────────┘
       │
       ▼
┌─────────────────────────┐
│  Render UI Cards        │
└─────────────────────────┘
```

---

## Cache e Otimizações

**Query Key**: `["customer-loyalty-programs", customerPhone]`

O React Query gerencia automaticamente:
- Cache dos dados por telefone do cliente
- Revalidação em background
- Deduplicação de requisições
- Loading states

---

## Exemplos de Estados Visuais

### Programa Ativo com Possibilidade de Resgate

```
┌────────────────────────────────────┐
│ Programa VIP          [Ativo]      │
│ Massagem Relaxante                 │
├────────────────────────────────────┤
│ Progresso                    100%  │
│ ████████████████████████████       │
│                                    │
│ Pontos atuais:        10           │
│ Pontos necessários:   10           │
│                                    │
│ 🎁 Pode resgatar recompensa        │
└────────────────────────────────────┘
```

### Programa Ativo em Andamento

```
┌────────────────────────────────────┐
│ Programa Básico       [Ativo]      │
│ Corte de Cabelo                    │
├────────────────────────────────────┤
│ Progresso                     60%  │
│ ████████████████░░░░░░░░░░░        │
│                                    │
│ Pontos atuais:        6            │
│ Pontos necessários:   10           │
└────────────────────────────────────┘
```

### Programa Inativo

```
┌────────────────────────────────────┐
│ Programa Antigo      [Inativo]     │
│ Manicure                           │
├────────────────────────────────────┤
│ Progresso                     30%  │
│ ████████░░░░░░░░░░░░░░░░░░░        │
│                                    │
│ Pontos atuais:        3            │
│ Pontos necessários:   10           │
└────────────────────────────────────┘
```

---

## Possíveis Melhorias Futuras

1. **Ações sobre Programas**
   - Botão para resgatar recompensa diretamente do card
   - Histórico de resgates anteriores
   - Ver regras detalhadas do programa

2. **Notificações**
   - Alerta quando estiver próximo de completar um programa
   - Notificação quando puder resgatar recompensa
   - Avisos quando programa estiver inativo

3. **Detalhes Expandidos**
   - Histórico de pontos ganhos
   - Datas de acúmulo de pontos
   - Serviços que geraram pontos
   - Validade dos pontos

4. **Filtros e Ordenação**
   - Filtrar por status (ativo/inativo)
   - Filtrar por possibilidade de resgate
   - Ordenar por progresso ou pontos

5. **Gamificação**
   - Animações ao ganhar pontos
   - Conquistas e badges especiais
   - Ranking de clientes mais fiéis

6. **Compartilhamento**
   - Compartilhar progresso nas redes sociais
   - Indicar amigos para ganhar pontos

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

- **Feedback visual imediato**: Badge verde indica possibilidade de resgate
- **Clareza de informações**: Progresso visual + numérico
- **Status transparente**: Diferenciação clara entre programas ativos e inativos
- **Informação hierarquizada**: Nome do programa em destaque, seguido da recompensa
- **Responsividade**: Adapta-se a diferentes tamanhos de tela
- **Loading states**: Evita frustração durante o carregamento
- **Empty states**: Orientação clara quando não há programas
- **Motivação**: Barra de progresso incentiva continuidade
- **Accessibility**: Uso de cores contrastantes e semântica adequada

---

## Diferenças em relação aos Pacotes

| Aspecto | Pacotes | Fidelidade |
|---------|---------|------------|
| Identificação | `customerId` | `customerPhone` |
| Métrica principal | Sessões restantes | Pontos acumulados |
| Status | Finalizado/Em andamento/Inativo | Ativo/Inativo |
| Ação principal | Usar sessões | Acumular e resgatar pontos |
| Pagamento | Vinculado (Pago/Pendente) | Não aplicável |
| Recompensa | Próprio pacote | Serviço específico |

---

## Integração com Sistema

### Autenticação
O componente utiliza o telefone do cliente como identificador único, enviado via header customizado `x-customer-phone`.

### Sincronização
- Pontos são atualizados automaticamente após agendamentos
- O campo `canRedeem` é calculado no backend
- Progresso é sempre consistente com pontos/requiredPoints

### Regras de Negócio
- Cliente pode participar de múltiplos programas simultaneamente
- Programas inativos continuam visíveis para histórico
- Possibilidade de resgate independe do status ativo/inativo
