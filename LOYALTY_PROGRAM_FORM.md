# Formulário de Criação de Programa de Fidelidade

## Visão Geral

O formulário de criação de programa de fidelidade permite cadastrar novos programas de fidelização com regras personalizadas de acúmulo de pontos. O formulário está localizado em `/app/loyalty-programs/new/` e implementa validação completa com gerenciamento dinâmico de regras.

## Arquitetura

### Arquivos Principais

- **Componente**: `src/pages/app/loyalty-programs/new/index.tsx`
- **Validação**: `src/lib/validations/loyalty-program.ts`
- **API**: `src/http/loyalty/create-loyalty-program.ts`

## Estrutura do Formulário

### 1. Campos Principais

#### Serviço de Recompensa (`serviceRewardId`)
- **Tipo**: Select (dropdown)
- **Obrigatório**: Sim
- **Validação**: UUID obrigatório
- **Descrição**: Define qual serviço será oferecido como recompensa quando o cliente atingir os pontos necessários
- **Fonte de dados**: Lista de serviços obtida via `getServices()`

#### Nome do Programa (`name`)
- **Tipo**: Input de texto
- **Obrigatório**: Sim
- **Validação**: String com mínimo de 1 caractere
- **Descrição**: Nome identificador do programa de fidelidade
- **Placeholder**: "Digite o nome do programa"

#### Pontos Necessários (`requiredPoints`)
- **Tipo**: Input numérico
- **Obrigatório**: Sim
- **Validação**: Número inteiro >= 1
- **Descrição**: Quantidade total de pontos que o cliente precisa acumular para receber a recompensa
- **Placeholder**: "Ex: 100"

### 2. Regras Dinâmicas (`rules`)

O formulário implementa um sistema de regras dinâmico usando `useFieldArray` do React Hook Form, permitindo adicionar/remover múltiplas regras de pontuação.

#### Estrutura de uma Regra

Cada regra define quantos pontos o cliente ganha ao realizar um determinado serviço:

```typescript
{
  serviceId: string,  // UUID do serviço
  points: number      // Pontos ganhos (min: 1)
}
```

#### Funcionalidades

- **Adicionar Regra**: Botão "Adicionar regra" com ícone Plus
- **Remover Regra**: Botão de deletar em cada regra (ícone Trash)
- **Validação**: Mínimo de 1 regra obrigatória

#### Campos de Cada Regra

1. **Serviço** (`serviceId`)
   - Select com lista de serviços disponíveis
   - Validação: Obrigatório

2. **Pontos** (`points`)
   - Input numérico
   - Validação: Mínimo 1
   - Width: 32 (classe w-32)
   - Placeholder: "Ex: 50"

## Schema de Validação (Zod)

```typescript
createLoyaltyProgramSchema = {
  serviceRewardId: string (min 1),
  name: string (min 1),
  requiredPoints: number (min 1),
  rules: array (min 1) [
    {
      serviceId: string (min 1),
      points: number (min 1)
    }
  ]
}
```

### Mensagens de Erro

- `serviceRewardId`: "Selecione um serviço de recompensa"
- `name`: "O nome é obrigatório"
- `requiredPoints`: "Os pontos necessários devem ser pelo menos 1"
- `rules`: "Adicione pelo menos uma regra"
- `rules.serviceId`: "Selecione um serviço"
- `rules.points`: "Os pontos devem ser pelo menos 1"

## Gerenciamento de Estado

### React Hook Form

```typescript
const form = useForm<Inputs>({
  resolver: zodResolver(createLoyaltyProgramSchema),
  defaultValues: {
    serviceRewardId: "",
    name: "",
    requiredPoints: 0,
    rules: [],
  },
});
```

### Field Array (Regras)

```typescript
const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "rules",
});
```

- **append**: Adiciona nova regra com `{ serviceId: "", points: 1 }`
- **remove**: Remove regra pelo índice

## Fluxo de Submissão

### 1. Validação do Formulário
- React Hook Form valida todos os campos usando o schema Zod
- Mensagens de erro são exibidas em tempo real

### 2. Chamada da API
```typescript
async function onSubmit(values: Inputs) {
  setIsLoading(true);

  await mutateAsync(values);  // POST /loyalty-programs

  queryClient.invalidateQueries({ queryKey: ["loyalty-programs"] });
  navigate({ to: "/app/loyalty-programs" });

  setIsLoading(false);
}
```

### 3. Estados de Loading
- `isPending`: Estado da mutation (TanStack Query)
- `isLoading`: Estado local adicional
- Botão desabilitado durante submissão
- Ícone de loading (Loader2 com animação spin)

### 4. Pós-Submissão
- Invalida cache da lista de programas
- Redireciona para `/app/loyalty-programs`

## Integração com API

### Endpoint
```typescript
POST /loyalty-programs
```

### Payload
```typescript
{
  serviceRewardId: string,
  name: string,
  requiredPoints: number,
  rules: [
    {
      serviceId: string,
      points: number
    }
  ]
}
```

### Dependências de Dados

- **Serviços**: `useQuery({ queryKey: ["services"], queryFn: getServices })`
  - Usados para popular os selects de serviço de recompensa e regras

## UI/UX

### Layout
- Container com padding: `p-6`
- Formulário com largura máxima: `max-w-lg`
- Espaçamento entre campos: `space-y-8`

### Componentes UI
- **Button**: Botão de voltar, adicionar regra, deletar e salvar
- **Input**: Campos de texto e numérico
- **Select**: Dropdowns para seleção de serviços
- **Form**: Componentes do shadcn/ui com FormField, FormItem, FormLabel, FormControl, FormMessage

### Navegação
- Botão de voltar (ícone ChevronLeft) para `/app/loyalty-programs`
- Link usando TanStack Router

### Regras Visuais
- Cada regra em container com:
  - Border e padding: `border p-4 rounded-lg`
  - Layout flex com gap: `flex items-end gap-4`
  - Campo de serviço ocupa espaço flexível: `flex-1`
  - Campo de pontos com largura fixa: `w-32`

## Exemplo de Uso

1. Usuário acessa `/app/loyalty-programs/new/`
2. Seleciona o serviço de recompensa (ex: "Massagem Relaxante")
3. Define o nome do programa (ex: "Programa Relax")
4. Define pontos necessários (ex: 100)
5. Adiciona regras:
   - "Corte de Cabelo" → 10 pontos
   - "Manicure" → 15 pontos
   - "Pedicure" → 15 pontos
6. Clica em "Salvar"
7. Sistema valida, envia para API e redireciona

## Tecnologias Utilizadas

- **React Hook Form**: Gerenciamento de formulário
- **Zod**: Validação de schema
- **TanStack Query**: Gerenciamento de estado assíncrono
- **TanStack Router**: Navegação
- **shadcn/ui**: Componentes de UI
- **Lucide React**: Ícones
