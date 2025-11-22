# Listagem de Programas de Fidelidade

Este documento descreve como funciona a listagem de programas de fidelidade no sistema.

## Visão Geral

A listagem de programas de fidelidade permite visualizar todos os programas cadastrados no estabelecimento, exibindo informações como nome, status, pontos necessários, regras de pontuação e serviço de recompensa.

## Arquitetura

### 1. Camada de Apresentação (UI)

**Arquivo:** `src/pages/app/loyalty-programs/index.tsx`

A página de listagem utiliza o padrão de roteamento do TanStack Router e é dividida em três estados principais:

#### Estado de Carregamento
```tsx
if (isLoading) {
  // Exibe 6 cards com skeleton (animação de loading)
}
```

#### Estado Vazio
```tsx
if (data?.length === 0) {
  // Exibe mensagem "Nenhum programa encontrado"
}
```

#### Estado com Dados
```tsx
// Exibe grid responsivo com cards dos programas
// - 1 coluna em mobile
// - 2 colunas em tablet (md)
// - 3 colunas em desktop (lg)
```

### 2. Camada de Dados (React Query)

**Arquivo:** `src/pages/app/loyalty-programs/index.tsx:16-19`

```tsx
const { data, isLoading } = useQuery({
  queryKey: ["loyalty-programs"],
  queryFn: getLoyaltyPrograms,
});
```

O React Query é responsável por:
- Gerenciar o estado de carregamento
- Cachear os dados em memória
- Sincronizar com o servidor
- Revalidar quando necessário

**Query Key:** `["loyalty-programs"]` (definida em `src/lib/query-keys.ts:44`)

### 3. Camada HTTP

**Arquivo:** `src/http/loyalty/get-loyalty-programs.ts`

```tsx
export async function getLoyaltyPrograms() {
  const response = await api.get<LoyaltyProgram[]>("/loyalty-programs");
  return response.data;
}
```

#### Cliente HTTP (Axios)

**Arquivo:** `src/lib/api-client.ts`

O cliente é configurado com:
- **Base URL:** Definida em `env.VITE_API_URL`
- **Interceptor de Request:** Adiciona automaticamente o token de autenticação

```tsx
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});
```

### 4. Tipagem e Validação

**Arquivo:** `src/lib/validations/loyalty-program.ts`

#### Estrutura de Dados

```typescript
type LoyaltyProgram = {
  id: string;              // UUID do programa
  name: string;            // Nome do programa
  serviceRewardId: string; // ID do serviço de recompensa
  serviceRewardName: string; // Nome do serviço de recompensa
  requiredPoints: number;  // Pontos necessários para resgatar
  active: boolean;         // Se o programa está ativo
  rules: PointRule[];      // Regras de pontuação
}

type PointRule = {
  serviceId: string;       // ID do serviço
  serviceName: string;     // Nome do serviço
  points: number;          // Pontos ganhos ao realizar o serviço
}
```

## Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Componente LoyaltyPrograms                               │
│    - Monta na tela                                           │
│    - Chama useQuery                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. React Query                                               │
│    - Verifica cache (queryKey: ["loyalty-programs"])        │
│    - Se não houver cache ou estiver stale, chama queryFn    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. getLoyaltyPrograms()                                      │
│    - Função HTTP que faz a requisição                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Axios Client (api)                                        │
│    - Interceptor adiciona Authorization: Bearer <token>     │
│    - Faz GET request para: {VITE_API_URL}/loyalty-programs  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. API Backend                                               │
│    - Valida token                                            │
│    - Busca programas do estabelecimento                      │
│    - Retorna array de LoyaltyProgram                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Resposta                                                  │
│    - Dados são tipados como LoyaltyProgram[]                │
│    - React Query armazena em cache                           │
│    - Componente re-renderiza com os dados                    │
└─────────────────────────────────────────────────────────────┘
```

## Interface de Usuário

### Card de Programa

Cada programa é exibido em um card com as seguintes informações:

```
┌─────────────────────────────────────────────┐
│ 🎁  [Nome do Programa]      [Badge Status]  │
│     Recompensa: [Serviço]                   │
│                                             │
│ Pontos Necessários: [X]                     │
│                                             │
│ Regras:                                     │
│ • [Serviço 1]              +[X] pts        │
│ • [Serviço 2]              +[X] pts        │
│                                             │
│ ──────────────────────────────────────────  │
│ Ver detalhes                           →   │
└─────────────────────────────────────────────┘
```

### Interações

- **Hover:** Card eleva levemente e ganha sombra
- **Click:** Navega para página de detalhes do programa (`/app/loyalty-programs/$programId`)
- **Botão "Adicionar":** Navega para criação de novo programa (`/app/loyalty-programs/new`)

### Estados do Badge

- **Ativo:** Badge verde com texto "Ativo" (`variant="default"`)
- **Inativo:** Badge cinza com texto "Inativo" (`variant="secondary"`)

## Hook Customizado (Opcional)

**Arquivo:** `src/hooks/use-loyalty-programs.ts:18-23`

Embora não seja usado na página principal, existe um hook customizado disponível:

```tsx
export function useLoyaltyPrograms() {
  return useQuery({
    queryKey: queryKeys.loyaltyPrograms,
    queryFn: getLoyaltyPrograms,
  });
}
```

Este hook pode ser usado em outros componentes que precisem da mesma listagem.

## Invalidação de Cache

O cache é invalidado automaticamente quando:
- Um programa é criado (`useCreateLoyaltyProgram`)
- Um programa é atualizado (`useUpdateLoyaltyProgram`)
- Um programa é ativado (`useActivateLoyaltyProgram`)
- Um programa é desativado (`useDesactiveLoyaltyProgram`)
- Um programa é deletado (`useDeleteLoyaltyProgram`)

Todos esses hooks executam `queryClient.invalidateQueries({ queryKey: queryKeys.loyaltyPrograms })` no callback `onSuccess`.

## Endpoints da API

### GET `/loyalty-programs`

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta de Sucesso (200):**
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Cabelo Premiado",
    "serviceRewardId": "660e8400-e29b-41d4-a716-446655440000",
    "serviceRewardName": "Corte Grátis",
    "requiredPoints": 10,
    "active": true,
    "rules": [
      {
        "serviceId": "770e8400-e29b-41d4-a716-446655440000",
        "serviceName": "Corte de Cabelo",
        "points": 2
      },
      {
        "serviceId": "880e8400-e29b-41d4-a716-446655440000",
        "serviceName": "Barba",
        "points": 1
      }
    ]
  }
]
```

## Tecnologias Utilizadas

- **TanStack Router:** Roteamento e navegação
- **TanStack Query (React Query):** Gerenciamento de estado servidor
- **Axios:** Cliente HTTP
- **Zod:** Validação de esquemas e tipagem
- **Shadcn/ui:** Componentes de UI (Card, Badge, Button)
- **Lucide React:** Ícones
- **Tailwind CSS:** Estilização

## Considerações de Performance

1. **Cache:** React Query mantém os dados em cache, evitando requisições desnecessárias
2. **Skeleton Loading:** Melhora a percepção de performance durante o carregamento
3. **Grid Responsivo:** Layout otimizado para diferentes tamanhos de tela
4. **Lazy Loading:** Página carregada apenas quando acessada (via TanStack Router)
