# Documentação de Métricas - App Mobile

## Índice
1. [Visão Geral](#visão-geral)
2. [Estrutura da UI](#estrutura-da-ui)
3. [Filtros e Navegação](#filtros-e-navegação)
4. [Cards de Métricas (KPIs)](#cards-de-métricas-kpis)
5. [Gráficos e Visualizações](#gráficos-e-visualizações)
6. [APIs e Endpoints](#apis-e-endpoints)
7. [Gerenciamento de Estado](#gerenciamento-de-estado)
8. [Processamento de Dados](#processamento-de-dados)
9. [Guia de Implementação Mobile](#guia-de-implementação-mobile)

---

## Visão Geral

O dashboard de métricas é organizado em **3 abas principais** com filtros de data persistentes:

- **Visão Geral**: Métricas gerais de receita e agendamentos
- **Relatórios de Funcionários**: Desempenho individual dos funcionários
- **Relatórios de Serviços**: Análise de serviços ao longo do tempo

**Tecnologias usadas no Web:**
- React Query (TanStack Query) para cache e state management
- Recharts para visualizações
- nuqs para persistência de estado na URL
- date-fns para manipulação de datas
- Zod para validação de tipos

---

## Estrutura da UI

### Layout Principal

```
┌─────────────────────────────────┐
│  [Filtros de Data]              │
│  Início: DD/MM/AAAA             │
│  Fim: DD/MM/AAAA                │
│  [Limpar Filtros]               │
├─────────────────────────────────┤
│  [Tabs]                         │
│  • Visão Geral                  │
│  • Funcionários                 │
│  • Serviços                     │
└─────────────────────────────────┘
```

### Aba 1: Visão Geral

**Layout Responsivo:**

```
Mobile (1 coluna):
┌────────────────────┐
│ Receita Total      │
├────────────────────┤
│ Receita Líquida    │
├────────────────────┤
│ Ticket Médio       │
├────────────────────┤
│ Agendamentos       │
├────────────────────┤
│ Receita Diária     │
│ (Gráfico de Barras)│
├────────────────────┤
│ Formas Pagamento   │
│ (Gráfico Pizza)    │
├────────────────────┤
│ Top Serviços       │
│ (Gráfico Pizza)    │
├────────────────────┤
│ Mais Agendados     │
│ (Gráfico Pizza)    │
└────────────────────┘

Tablet/Desktop (Grid):
┌─────────┬─────────┬─────────┬─────────┐
│ Receita │ Líquida │ Ticket  │ Agend.  │
│ Total   │         │ Médio   │         │
├─────────┴─────────┴─────────┴─────────┤
│  Receita Diária (Gráfico de Barras)   │
├───────────┬───────────┬───────────────┤
│  Formas   │   Top     │     Mais      │
│ Pagamento │ Serviços  │  Agendados    │
│  (Pizza)  │  (Pizza)  │    (Pizza)    │
└───────────┴───────────┴───────────────┘
```

### Aba 2: Relatórios de Funcionários

```
┌─────────────────┬─────────────────┐
│ Receita por     │ Comissão por    │
│ Funcionário     │ Funcionário     │
│ (Barras Horiz.) │ (Barras)        │
├─────────────────┴─────────────────┤
│   Serviços por Funcionário        │
│   (Gráfico de Pizza)              │
└───────────────────────────────────┘
```

### Aba 3: Relatórios de Serviços

```
┌─────────────────────────────────┐
│  [Filtro: Selecione o Serviço] │
│  • Todos os serviços            │
│  • Corte Masculino              │
│  • Barba                        │
│  • ...                          │
├─────────────────────────────────┤
│  Serviços Mensais               │
│  (Gráfico de Barras - 12 meses) │
└─────────────────────────────────┘
```

---

## Filtros e Navegação

### Filtro de Data

**Componente:** Dashboard Filters
**Localização Web:** `src/pages/app/dashboard/-components/dashboard-filters.tsx`

**Funcionalidades:**
- 2 campos de data: Data Início e Data Fim
- Botão "Limpar Filtros" que reseta para o mês atual
- Estado persistido na URL (web) ou localStorage/AsyncStorage (mobile)
- Formato de data: ISO 8601 (YYYY-MM-DD)
- Valor padrão: Primeiro e último dia do mês atual

**Comportamento:**
```typescript
// Valores padrão ao carregar
startDate = primeiro dia do mês atual (ex: "2025-01-01")
endDate = último dia do mês atual (ex: "2025-01-31")

// Ao limpar filtros
startDate = startOfMonth(hoje)
endDate = endOfMonth(hoje)
```

**Estados:**
- `startDate`: string | null (formato YYYY-MM-DD)
- `endDate`: string | null (formato YYYY-MM-DD)

**Validações:**
- Data início não pode ser posterior à data fim
- Datas devem estar no formato ISO correto
- Se apenas uma data for fornecida, usar defaults inteligentes

### Navegação por Abas

**Estados possíveis:**
- `tab = "overview"` (Visão Geral)
- `tab = "employees"` (Funcionários)
- `tab = "services"` (Serviços)

**Comportamento:**
- Filtros de data são mantidos ao trocar de aba
- Cada aba carrega seus próprios dados independentemente
- Loading states individuais por métrica

---

## Cards de Métricas (KPIs)

Todos os cards seguem o mesmo padrão visual e de estados.

### 1. Receita Total

**API:** `GET /establishments/daily-revenue`
**Hook:** `useDailyRevenue`
**Arquivo Web:** `src/components/total-revenue-card.tsx`

**Dados:**
```typescript
// Response
{
  items: [
    { date: "2025-01-01", value: 15000 }, // valor em centavos
    { date: "2025-01-02", value: 22500 },
    ...
  ]
}

// Cálculo
totalRevenue = items.reduce((sum, item) => sum + item.value, 0)
```

**UI Card:**
```
┌─────────────────────────┐
│ Receita Total           │
│ R$ 1.234,56            │
│ (ícone: DollarSign)    │
└─────────────────────────┘
```

### 2. Receita Líquida

**API:** `GET /establishments/net-revenue`
**Hook:** `useNetRevenue`
**Arquivo Web:** `src/components/net-revenue-card.tsx`

**Dados:**
```typescript
// Response
{
  value: 98750 // em centavos
}
```

**UI Card:**
```
┌─────────────────────────┐
│ Receita Líquida         │
│ R$ 987,50              │
│ (ícone: TrendingUp)    │
└─────────────────────────┘
```

### 3. Ticket Médio

**API:** `GET /establishments/average-ticket`
**Hook:** `useAverageTicket`
**Arquivo Web:** `src/components/average-ticket-card.tsx`

**Dados:**
```typescript
// Response
{
  value: 7500 // em centavos
}
```

**UI Card:**
```
┌─────────────────────────┐
│ Ticket Médio            │
│ R$ 75,00               │
│ (ícone: Receipt)       │
└─────────────────────────┘
```

### 4. Agendamentos

**API:** `GET /establishments/appointments-metrics`
**Hook:** `useAppointmentsCount`
**Arquivo Web:** `src/components/appointments-count-card.tsx`

**Dados:**
```typescript
// Response
{
  appointmentsCount: 145,
  value: 89 // clientes únicos
}
```

**UI Card:**
```
┌─────────────────────────┐
│ Agendamentos            │
│ 145                    │
│ 89 clientes únicos     │
│ (ícone: Calendar)      │
└─────────────────────────┘
```

### Padrão de Estados dos Cards

**Loading:**
```
┌─────────────────────────┐
│ [Skeleton Animation]    │
│ ███████████            │
│                        │
└─────────────────────────┘
```

**Erro:**
```
┌─────────────────────────┐
│ Erro ao Carregar        │
│ Não foi possível        │
│ carregar os dados       │
│ [Tentar Novamente]     │
└─────────────────────────┘
```

**Sucesso:**
```
┌─────────────────────────┐
│ Título da Métrica       │
│ Valor Principal        │
│ (Info adicional)       │
└─────────────────────────┘
```

---

## Gráficos e Visualizações

### 1. Receita Diária (Gráfico de Barras)

**API:** `GET /establishments/daily-revenue`
**Hook:** `useDailyRevenue`
**Arquivo Web:** `src/components/daily-revenue-chart.tsx`

**Dados:**
```typescript
// Response
{
  items: [
    { date: "2025-01-01", value: 15000 },
    { date: "2025-01-02", value: 22500 },
    { date: "2025-01-03", value: 18000 },
    ...
  ]
}
```

**Configuração do Gráfico:**
- Tipo: Gráfico de Barras Vertical
- Eixo X: Datas formatadas (ex: "01/01")
- Eixo Y: Valores em reais (ex: "R$ 150,00")
- Cor: Variável `--chart-1` (azul primário)
- Tooltip: Data completa + valor formatado

**Processamento:**
```typescript
// Formatar data para exibição
const formattedData = items.map(item => ({
  date: format(parseISO(item.date), "dd/MM", { locale: ptBR }),
  value: item.value / 100, // converter centavos para reais
  fullDate: format(parseISO(item.date), "dd 'de' MMMM", { locale: ptBR })
}));

// Total para o header
const total = items.reduce((sum, item) => sum + item.value, 0);
```

**UI:**
```
┌─────────────────────────────────────┐
│ Receita Diária                      │
│ Total: R$ 1.234,56                 │
├─────────────────────────────────────┤
│     ┃                               │
│     ┃    ┃         ┃                │
│  ┃  ┃ ┃  ┃  ┃   ┃  ┃    ┃          │
│ ─┴──┴─┴──┴──┴───┴──┴────┴─────     │
│ 01 02 03 04 05 06 07 08 09 ...     │
└─────────────────────────────────────┘
```

### 2. Top Serviços por Receita (Gráfico Pizza)

**API:** `GET /establishments/top-services`
**Hook:** `useTopServices`
**Arquivo Web:** `src/components/top-services-chart.tsx`

**Dados:**
```typescript
// Response
{
  items: [
    { service: "Corte Masculino", totalRevenueInCents: 45000 },
    { service: "Barba", totalRevenueInCents: 28000 },
    { service: "Coloração", totalRevenueInCents: 35000 },
    ...
  ]
}
```

**Configuração do Gráfico:**
- Tipo: Gráfico de Pizza com Legenda
- Cores: Dinâmicas (`--chart-1` a `--chart-7`)
- Label: Nome do serviço
- Valor: Receita em reais
- Tooltip: Serviço + valor formatado

**UI:**
```
┌─────────────────────────────────┐
│ Top Serviços                    │
├─────────────────┬───────────────┤
│      ╱──╲       │ ■ Corte M.   │
│    ╱      ╲     │   R$ 450,00  │
│   │    ◉   │    │               │
│    ╲      ╱     │ ■ Barba      │
│      ╲──╱       │   R$ 280,00  │
│                 │               │
│                 │ ■ Coloração  │
│                 │   R$ 350,00  │
└─────────────────┴───────────────┘
```

### 3. Serviços Mais Agendados (Gráfico Pizza)

**API:** `GET /establishments/most-booked-services`
**Hook:** `useMostBookedServices`
**Arquivo Web:** `src/components/most-booked-services-chart.tsx`

**Dados:**
```typescript
// Response
{
  items: [
    { service: "Corte Masculino", totalBookings: 85 },
    { service: "Barba", totalBookings: 52 },
    { service: "Unhas", totalBookings: 43 },
    ...
  ]
}
```

**Configuração:**
- Mesmo padrão do gráfico de Top Serviços
- Valor mostrado: Número de agendamentos (não receita)

### 4. Formas de Pagamento (Gráfico Pizza)

**API:** `GET /establishments/top-payment-methods`
**Hook:** `useTopPaymentMethods`
**Arquivo Web:** `src/components/top-payment-methods-chart.tsx`

**Dados:**
```typescript
// Response
{
  items: [
    { paymentMethod: "Pix", totalRevenueInCents: 65000 },
    { paymentMethod: "Dinheiro", totalRevenueInCents: 35000 },
    { paymentMethod: "Cartão Débito", totalRevenueInCents: 28000 },
    { paymentMethod: "Cartão Crédito", totalRevenueInCents: 42000 },
    ...
  ]
}
```

**Configuração:**
- Tipo: Gráfico de Pizza
- Label: Nome do método de pagamento
- Valor: Receita total

### 5. Receita por Funcionário (Barras Horizontais)

**API:** `GET /establishments/employee-revenue`
**Hook:** `useEmployeeRevenue`
**Arquivo Web:** `src/components/employee-revenue-chart.tsx`

**Dados:**
```typescript
// Response
{
  items: [
    { employee: "João Silva", revenueInCents: 85000 },
    { employee: "Maria Santos", revenueInCents: 72000 },
    { employee: "Pedro Costa", revenueInCents: 63000 },
    ...
  ]
}
```

**Configuração:**
- Tipo: Gráfico de Barras Horizontal
- Eixo Y: Nomes dos funcionários
- Eixo X: Receita em reais
- Cor: `--chart-2`

**UI:**
```
┌─────────────────────────────────┐
│ Receita por Funcionário         │
├─────────────────────────────────┤
│ João Silva    ██████████ 850,00│
│ Maria Santos  ████████   720,00│
│ Pedro Costa   ███████    630,00│
└─────────────────────────────────┘
```

### 6. Comissão por Funcionário (Gráfico de Barras)

**API:** `GET /establishments/employee-commission`
**Hook:** `useEmployeeCommission`
**Arquivo Web:** `src/components/employee-commission-chart.tsx`

**Dados:**
```typescript
// Response
{
  items: [
    { employee: "João Silva", commissionInCents: 17000 },
    { employee: "Maria Santos", commissionInCents: 14400 },
    ...
  ]
}
```

### 7. Serviços por Funcionário (Gráfico Pizza)

**API:** `GET /establishments/services-by-employee`
**Hook:** `useServicesByEmployee`
**Arquivo Web:** `src/components/services-by-employee-chart.tsx`

**Dados:**
```typescript
// Response
{
  items: [
    { employee: "João Silva", totalBookings: 92 },
    { employee: "Maria Santos", totalBookings: 78 },
    ...
  ]
}
```

### 8. Serviços Mensais (Gráfico de Barras)

**API:** `GET /establishments/monthly-services`
**Hook:** `useMonthlyServices`
**Arquivo Web:** `src/components/monthly-services-chart.tsx`

**Dados:**
```typescript
// Request
{
  serviceId?: string // opcional
}

// Response
{
  items: [
    { month: 1, value: 45 },  // Janeiro
    { month: 2, value: 52 },  // Fevereiro
    { month: 3, value: 63 },  // Março
    ...
    { month: 12, value: 78 }  // Dezembro
  ]
}
```

**Configuração:**
- Tipo: Gráfico de Barras Vertical
- Eixo X: Nomes dos meses (Jan, Fev, Mar, ...)
- Eixo Y: Número de agendamentos
- Filtro adicional: Dropdown para selecionar serviço específico

**Processamento:**
```typescript
const monthNames = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez"
];

const chartData = items.map(item => ({
  month: monthNames[item.month - 1],
  value: item.value
}));
```

**UI:**
```
┌─────────────────────────────────┐
│ Serviços Mensais                │
│ [Selecione o Serviço ▼]        │
├─────────────────────────────────┤
│      ┃                          │
│   ┃  ┃     ┃                    │
│   ┃  ┃  ┃  ┃  ┃    ┃           │
│ ──┴──┴──┴──┴──┴────┴──────     │
│ Jan Fev Mar Abr Mai Jun ...    │
└─────────────────────────────────┘
```

---

## APIs e Endpoints

**Base URL:** `{API_URL}/establishments`

### Tabela Completa de Endpoints

| Endpoint | Método | Params | Response | Descrição |
|----------|--------|--------|----------|-----------|
| `/appointments-metrics` | GET | `startDate`, `endDate` | `{ appointmentsCount, value }` | Total de agendamentos e clientes únicos |
| `/average-ticket` | GET | `startDate`, `endDate` | `{ value }` | Ticket médio (em centavos) |
| `/daily-revenue` | GET | `startDate`, `endDate` | `{ items: [{ date, value }] }` | Receita diária no período |
| `/employee-commission` | GET | `startDate`, `endDate` | `{ items: [{ employee, commissionInCents }] }` | Comissão por funcionário |
| `/employee-revenue` | GET | `startDate`, `endDate` | `{ items: [{ employee, revenueInCents }] }` | Receita por funcionário |
| `/monthly-services` | GET | `serviceId?` | `{ items: [{ month, value }] }` | Agendamentos mensais (12 meses) |
| `/most-booked-services` | GET | `startDate`, `endDate` | `{ items: [{ service, totalBookings }] }` | Serviços mais agendados |
| `/net-revenue` | GET | `startDate`, `endDate` | `{ value }` | Receita líquida (em centavos) |
| `/services-by-employee` | GET | `startDate`, `endDate` | `{ items: [{ employee, totalBookings }] }` | Distribuição de serviços |
| `/top-payment-methods` | GET | `startDate`, `endDate` | `{ items: [{ paymentMethod, totalRevenueInCents }] }` | Métodos de pagamento |
| `/top-services` | GET | `startDate`, `endDate` | `{ items: [{ service, totalRevenueInCents }] }` | Top serviços por receita |

### Formato de Parâmetros

**Datas:**
```typescript
startDate: string; // formato: "YYYY-MM-DD" (ex: "2025-01-01")
endDate: string;   // formato: "YYYY-MM-DD" (ex: "2025-01-31")
```

**Query Params:**
```
GET /establishments/daily-revenue?startDate=2025-01-01&endDate=2025-01-31
```

### Headers Necessários

```typescript
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

### Tratamento de Erros

**Códigos de Status:**
- `200` - Sucesso
- `400` - Parâmetros inválidos
- `401` - Não autenticado
- `403` - Sem permissão
- `500` - Erro do servidor

**Formato de Erro:**
```typescript
{
  message: string;
  statusCode: number;
}
```

---

## Gerenciamento de Estado

### React Query (Recomendado para Mobile)

**No web, todos os hooks usam React Query.** Recomenda-se usar uma biblioteca similar no mobile:

**Para React Native:**
- TanStack Query (React Query) - mesma API
- SWR - alternativa leve

**Para Flutter:**
- flutter_query
- cached_network_image + state management

**Padrão de Hook:**
```typescript
// Exemplo: useDailyRevenue
export function useDailyRevenue(params: { startDate: string; endDate: string }) {
  return useQuery({
    queryKey: ["reports", "daily-revenue", params],
    queryFn: () => getDailyRevenue(params),
    enabled: !!params.startDate && !!params.endDate,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
```

### Query Keys (Cache Invalidation)

**Estrutura centralizada de chaves:**

```typescript
// lib/query-keys.ts
export const queryKeys = {
  reports: {
    dailyRevenue: (params) => ["reports", "daily-revenue", params],
    netRevenue: (params) => ["reports", "net-revenue", params],
    averageTicket: (params) => ["reports", "average-ticket", params],
    appointmentsCount: (params) => ["reports", "appointments-count", params],
    topPaymentMethods: (params) => ["reports", "top-payment-methods", params],
    topServices: (params) => ["reports", "top-services", params],
    mostBookedServices: (params) => ["reports", "most-booked-services", params],
    employeeCommission: (params) => ["reports", "employee-commission", params],
    employeeRevenue: (params) => ["reports", "employee-revenue", params],
    servicesByEmployee: (params) => ["reports", "services-by-employee", params],
    monthlyServices: (params) => ["reports", "monthly-services", params],
  }
};
```

### Configuração de Cache

**Recomendações:**
- `staleTime`: 5 minutos (dados financeiros mudam frequentemente)
- `cacheTime`: 10 minutos
- `refetchOnWindowFocus`: false (evitar refetches excessivos)
- `retry`: 2 (tentar 2 vezes em caso de erro)

### Estados de Loading

**Cada query retorna:**
```typescript
{
  data,           // dados da resposta
  isLoading,      // carregamento inicial
  isFetching,     // carregamento em background
  isError,        // erro ocorreu
  error,          // objeto de erro
  refetch,        // função para refetch manual
}
```

---

## Processamento de Dados

### Formatação de Valores

**Conversão de Centavos:**
```typescript
// Função principal
function formatPriceFromCents(valueInCents: number): string {
  const valueInReais = valueInCents / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valueInReais);
}

// Exemplos
formatPriceFromCents(15000) // "R$ 150,00"
formatPriceFromCents(7550)  // "R$ 75,50"
formatPriceFromCents(100)   // "R$ 1,00"
```

**Formatação de Datas:**
```typescript
// Para exibição curta (gráficos)
format(parseISO(date), "dd/MM") // "01/01"

// Para exibição completa (tooltips)
format(parseISO(date), "dd 'de' MMMM", { locale: ptBR }) // "01 de janeiro"

// Para API (sempre ISO)
format(date, "yyyy-MM-dd") // "2025-01-01"
```

**Formatação de Números:**
```typescript
// Números grandes
new Intl.NumberFormat("pt-BR").format(1234) // "1.234"

// Porcentagens
new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 1,
}).format(0.156) // "15,6%"
```

### Transformações de Dados

**Para Gráficos de Pizza:**
```typescript
// Adicionar cores dinâmicas
const chartData = items.map((item, index) => ({
  ...item,
  fill: `hsl(var(--chart-${(index % 7) + 1}))`,
}));
```

**Para Gráficos de Barras:**
```typescript
// Adicionar labels formatados
const chartData = items.map(item => ({
  date: format(parseISO(item.date), "dd/MM"),
  value: item.value / 100,
  fullDate: format(parseISO(item.date), "dd 'de' MMMM", { locale: ptBR })
}));
```

**Cálculos Agregados:**
```typescript
// Somar total
const total = items.reduce((sum, item) => sum + item.value, 0);

// Calcular média
const average = total / items.length;

// Encontrar máximo
const max = Math.max(...items.map(item => item.value));
```

### Memoização (Performance)

**Use memoização para cálculos pesados:**
```typescript
// React
const chartData = useMemo(() => {
  return items.map(item => ({
    ...item,
    formattedValue: formatPriceFromCents(item.value),
  }));
}, [items]);

// Flutter (com Riverpod ou similar)
final chartData = useMemoized(() {
  return items.map((item) => {
    return ChartData(
      value: item.value,
      formattedValue: formatPrice(item.value),
    );
  }).toList();
}, [items]);
```

---

## Guia de Implementação Mobile

### Passo 1: Setup Inicial

**1.1. Configurar Cliente HTTP**
```typescript
// React Native (axios ou fetch)
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para token
apiClient.interceptors.request.use((config) => {
  const token = getAuthToken(); // do seu auth provider
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**1.2. Configurar React Query**
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Envolver o app
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### Passo 2: Criar Serviços API

**Estrutura de pastas:**
```
src/
  services/
    api/
      reports/
        getDailyRevenue.ts
        getNetRevenue.ts
        getAverageTicket.ts
        getAppointmentsMetrics.ts
        ... (todos os endpoints)
```

**Exemplo de serviço:**
```typescript
// services/api/reports/getDailyRevenue.ts
import { apiClient } from '@/lib/api-client';
import { z } from 'zod';

const getDailyRevenueSchema = z.object({
  items: z.array(
    z.object({
      date: z.string(),
      value: z.number(),
    })
  ),
});

export type GetDailyRevenueParams = {
  startDate: string;
  endDate: string;
};

export type GetDailyRevenueResponse = z.infer<typeof getDailyRevenueSchema>;

export async function getDailyRevenue(
  params: GetDailyRevenueParams
): Promise<GetDailyRevenueResponse> {
  const { data } = await apiClient.get('/establishments/daily-revenue', {
    params,
  });

  return getDailyRevenueSchema.parse(data);
}
```

### Passo 3: Criar Hooks Customizados

**Estrutura:**
```
src/
  hooks/
    useDailyRevenue.ts
    useNetRevenue.ts
    useAverageTicket.ts
    ... (todos os hooks)
```

**Exemplo de hook:**
```typescript
// hooks/useDailyRevenue.ts
import { useQuery } from '@tanstack/react-query';
import { getDailyRevenue, GetDailyRevenueParams } from '@/services/api/reports/getDailyRevenue';
import { queryKeys } from '@/lib/query-keys';

export function useDailyRevenue(params: GetDailyRevenueParams) {
  return useQuery({
    queryKey: queryKeys.reports.dailyRevenue(params),
    queryFn: () => getDailyRevenue(params),
    enabled: !!params.startDate && !!params.endDate,
  });
}
```

### Passo 4: Implementar Filtros

**Componente de Filtros de Data:**
```typescript
// components/DashboardFilters.tsx
import React, { useState } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import DatePicker from 'react-native-date-picker'; // ou biblioteca de sua escolha

type DashboardFiltersProps = {
  startDate: string | null;
  endDate: string | null;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onClearFilters: () => void;
};

export function DashboardFilters({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClearFilters,
}: DashboardFiltersProps) {
  return (
    <View style={styles.container}>
      <DatePicker
        label="Data Início"
        value={startDate ? new Date(startDate) : startOfMonth(new Date())}
        onChange={(date) => onStartDateChange(format(date, 'yyyy-MM-dd'))}
      />

      <DatePicker
        label="Data Fim"
        value={endDate ? new Date(endDate) : endOfMonth(new Date())}
        onChange={(date) => onEndDateChange(format(date, 'yyyy-MM-dd'))}
      />

      <Button onPress={onClearFilters}>
        Limpar Filtros
      </Button>
    </View>
  );
}
```

**State Management dos Filtros:**
```typescript
// hooks/useDashboardFilters.ts
import { useState, useCallback } from 'react';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FILTERS_KEY = '@dashboard:filters';

export function useDashboardFilters() {
  const [startDate, setStartDate] = useState(
    format(startOfMonth(new Date()), 'yyyy-MM-dd')
  );
  const [endDate, setEndDate] = useState(
    format(endOfMonth(new Date()), 'yyyy-MM-dd')
  );

  const clearFilters = useCallback(() => {
    const today = new Date();
    setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'));
    setEndDate(format(endOfMonth(today), 'yyyy-MM-dd'));
  }, []);

  // Persistir filtros
  useEffect(() => {
    AsyncStorage.setItem(FILTERS_KEY, JSON.stringify({ startDate, endDate }));
  }, [startDate, endDate]);

  return {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    clearFilters,
  };
}
```

### Passo 5: Criar Cards de Métricas

**Componente genérico de Card:**
```typescript
// components/MetricCard.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

type MetricCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  isLoading,
  isError,
  onRetry,
}: MetricCardProps) {
  if (isLoading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator />
        <Text>Carregando...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.card}>
        <Text>Erro ao carregar</Text>
        <Button onPress={onRetry}>Tentar Novamente</Button>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        {icon}
        <Text style={styles.title}>{title}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}
```

**Card específico (exemplo: Receita Total):**
```typescript
// components/TotalRevenueCard.tsx
import React from 'react';
import { DollarSign } from 'lucide-react-native';
import { MetricCard } from './MetricCard';
import { useDailyRevenue } from '@/hooks/useDailyRevenue';
import { formatPriceFromCents } from '@/lib/utils';

type TotalRevenueCardProps = {
  startDate: string;
  endDate: string;
};

export function TotalRevenueCard({ startDate, endDate }: TotalRevenueCardProps) {
  const { data, isLoading, isError, refetch } = useDailyRevenue({
    startDate,
    endDate,
  });

  const total = data?.items.reduce((sum, item) => sum + item.value, 0) ?? 0;

  return (
    <MetricCard
      title="Receita Total"
      value={formatPriceFromCents(total)}
      icon={<DollarSign size={24} />}
      isLoading={isLoading}
      isError={isError}
      onRetry={refetch}
    />
  );
}
```

### Passo 6: Implementar Gráficos

**Biblioteca recomendada:** `react-native-chart-kit` ou `victory-native`

**Exemplo de Gráfico de Barras:**
```typescript
// components/DailyRevenueChart.tsx
import React, { useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useDailyRevenue } from '@/hooks/useDailyRevenue';
import { formatPriceFromCents } from '@/lib/utils';

type DailyRevenueChartProps = {
  startDate: string;
  endDate: string;
};

export function DailyRevenueChart({ startDate, endDate }: DailyRevenueChartProps) {
  const { data, isLoading } = useDailyRevenue({ startDate, endDate });

  const chartData = useMemo(() => {
    if (!data?.items) return { labels: [], datasets: [{ data: [0] }] };

    return {
      labels: data.items.map(item =>
        format(parseISO(item.date), 'dd/MM', { locale: ptBR })
      ),
      datasets: [{
        data: data.items.map(item => item.value / 100),
      }],
    };
  }, [data]);

  const total = data?.items.reduce((sum, item) => sum + item.value, 0) ?? 0;

  if (isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Receita Diária</Text>
        <Text style={styles.total}>{formatPriceFromCents(total)}</Text>
      </View>

      <BarChart
        data={chartData}
        width={Dimensions.get('window').width - 32}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 2,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        style={styles.chart}
      />
    </View>
  );
}
```

**Exemplo de Gráfico de Pizza:**
```typescript
// components/TopServicesChart.tsx
import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useTopServices } from '@/hooks/useTopServices';
import { formatPriceFromCents } from '@/lib/utils';

const CHART_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // green
  '#6366f1', // indigo
  '#f43f5e', // rose
];

type TopServicesChartProps = {
  startDate: string;
  endDate: string;
};

export function TopServicesChart({ startDate, endDate }: TopServicesChartProps) {
  const { data, isLoading } = useTopServices({ startDate, endDate });

  const chartData = useMemo(() => {
    if (!data?.items) return [];

    return data.items.map((item, index) => ({
      name: item.service,
      value: item.totalRevenueInCents / 100,
      color: CHART_COLORS[index % CHART_COLORS.length],
      legendFontColor: '#000',
      legendFontSize: 12,
    }));
  }, [data]);

  if (isLoading) {
    return <ActivityIndicator />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Top Serviços</Text>

      <PieChart
        data={chartData}
        width={Dimensions.get('window').width - 32}
        height={220}
        chartConfig={{
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        accessor="value"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
      />

      {/* Legenda customizada */}
      <View style={styles.legend}>
        {chartData.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text>{item.name}</Text>
            <Text>{formatPriceFromCents(item.value * 100)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
```

### Passo 7: Criar Telas de Dashboard

**Estrutura de navegação:**
```typescript
// screens/DashboardScreen.tsx
import React from 'react';
import { ScrollView, View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useDashboardFilters } from '@/hooks/useDashboardFilters';
import { DashboardFilters } from '@/components/DashboardFilters';
import { OverviewTab } from './tabs/OverviewTab';
import { EmployeesTab } from './tabs/EmployeesTab';
import { ServicesTab } from './tabs/ServicesTab';

const Tab = createMaterialTopTabNavigator();

export function DashboardScreen() {
  const { startDate, endDate, setStartDate, setEndDate, clearFilters } =
    useDashboardFilters();

  return (
    <View style={{ flex: 1 }}>
      <DashboardFilters
        startDate={startDate}
        endDate={endDate}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onClearFilters={clearFilters}
      />

      <Tab.Navigator>
        <Tab.Screen name="Overview">
          {() => <OverviewTab startDate={startDate} endDate={endDate} />}
        </Tab.Screen>
        <Tab.Screen name="Employees">
          {() => <EmployeesTab startDate={startDate} endDate={endDate} />}
        </Tab.Screen>
        <Tab.Screen name="Services">
          {() => <ServicesTab startDate={startDate} endDate={endDate} />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}
```

**Aba de Visão Geral:**
```typescript
// screens/tabs/OverviewTab.tsx
import React from 'react';
import { ScrollView, View } from 'react-native';
import { TotalRevenueCard } from '@/components/TotalRevenueCard';
import { NetRevenueCard } from '@/components/NetRevenueCard';
import { AverageTicketCard } from '@/components/AverageTicketCard';
import { AppointmentsCountCard } from '@/components/AppointmentsCountCard';
import { DailyRevenueChart } from '@/components/DailyRevenueChart';
import { TopServicesChart } from '@/components/TopServicesChart';
import { MostBookedServicesChart } from '@/components/MostBookedServicesChart';
import { TopPaymentMethodsChart } from '@/components/TopPaymentMethodsChart';

type OverviewTabProps = {
  startDate: string;
  endDate: string;
};

export function OverviewTab({ startDate, endDate }: OverviewTabProps) {
  return (
    <ScrollView style={styles.container}>
      {/* Grid de Cards */}
      <View style={styles.cardsGrid}>
        <TotalRevenueCard startDate={startDate} endDate={endDate} />
        <NetRevenueCard startDate={startDate} endDate={endDate} />
        <AverageTicketCard startDate={startDate} endDate={endDate} />
        <AppointmentsCountCard startDate={startDate} endDate={endDate} />
      </View>

      {/* Gráfico de Receita Diária */}
      <DailyRevenueChart startDate={startDate} endDate={endDate} />

      {/* Grid de Gráficos de Pizza */}
      <View style={styles.chartsGrid}>
        <TopPaymentMethodsChart startDate={startDate} endDate={endDate} />
        <TopServicesChart startDate={startDate} endDate={endDate} />
        <MostBookedServicesChart startDate={startDate} endDate={endDate} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 24,
  },
  chartsGrid: {
    gap: 16,
  },
});
```

### Passo 8: Utilitários e Helpers

**Arquivo de utilitários:**
```typescript
// lib/utils.ts
export function formatPriceFromCents(valueInCents: number): string {
  const valueInReais = valueInCents / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valueInReais);
}

export function formatDate(date: string, formatStr: string = 'dd/MM/yyyy'): string {
  return format(parseISO(date), formatStr, { locale: ptBR });
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}
```

### Passo 9: Testes

**Exemplo de teste de hook:**
```typescript
// hooks/__tests__/useDailyRevenue.test.ts
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDailyRevenue } from '../useDailyRevenue';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useDailyRevenue', () => {
  it('should fetch daily revenue data', async () => {
    const { result } = renderHook(
      () => useDailyRevenue({
        startDate: '2025-01-01',
        endDate: '2025-01-31'
      }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();
    expect(result.current.data.items).toBeInstanceOf(Array);
  });
});
```

### Passo 10: Otimizações

**Performance:**
1. **Lazy loading de abas** - Carregar dados apenas quando a aba é ativada
2. **Virtualized lists** - Para listas longas de dados
3. **Memoização** - `useMemo` e `React.memo` para evitar re-renders
4. **Debounce de filtros** - Evitar chamadas excessivas ao mudar datas
5. **Pagination** - Se houver muitos dados nos gráficos

**Exemplo de lazy loading:**
```typescript
const OverviewTab = React.lazy(() => import('./tabs/OverviewTab'));
const EmployeesTab = React.lazy(() => import('./tabs/EmployeesTab'));
const ServicesTab = React.lazy(() => import('./tabs/ServicesTab'));
```

---

## Checklist de Implementação

### Setup
- [ ] Configurar cliente HTTP (axios/fetch)
- [ ] Instalar e configurar React Query
- [ ] Configurar formatação de datas (date-fns)
- [ ] Configurar biblioteca de gráficos
- [ ] Configurar AsyncStorage para persistência

### APIs
- [ ] Criar serviço para `getDailyRevenue`
- [ ] Criar serviço para `getNetRevenue`
- [ ] Criar serviço para `getAverageTicket`
- [ ] Criar serviço para `getAppointmentsMetrics`
- [ ] Criar serviço para `getTopServices`
- [ ] Criar serviço para `getMostBookedServices`
- [ ] Criar serviço para `getTopPaymentMethods`
- [ ] Criar serviço para `getEmployeeRevenue`
- [ ] Criar serviço para `getEmployeeCommission`
- [ ] Criar serviço para `getServicesByEmployee`
- [ ] Criar serviço para `getMonthlyServices`

### Hooks
- [ ] Criar hook `useDailyRevenue`
- [ ] Criar hook `useNetRevenue`
- [ ] Criar hook `useAverageTicket`
- [ ] Criar hook `useAppointmentsCount`
- [ ] Criar hook `useTopServices`
- [ ] Criar hook `useMostBookedServices`
- [ ] Criar hook `useTopPaymentMethods`
- [ ] Criar hook `useEmployeeRevenue`
- [ ] Criar hook `useEmployeeCommission`
- [ ] Criar hook `useServicesByEmployee`
- [ ] Criar hook `useMonthlyServices`
- [ ] Criar hook `useDashboardFilters`

### Componentes
- [ ] Criar componente `DashboardFilters`
- [ ] Criar componente genérico `MetricCard`
- [ ] Criar componente `TotalRevenueCard`
- [ ] Criar componente `NetRevenueCard`
- [ ] Criar componente `AverageTicketCard`
- [ ] Criar componente `AppointmentsCountCard`
- [ ] Criar componente `DailyRevenueChart`
- [ ] Criar componente `TopServicesChart`
- [ ] Criar componente `MostBookedServicesChart`
- [ ] Criar componente `TopPaymentMethodsChart`
- [ ] Criar componente `EmployeeRevenueChart`
- [ ] Criar componente `EmployeeCommissionChart`
- [ ] Criar componente `ServicesByEmployeeChart`
- [ ] Criar componente `MonthlyServicesChart`

### Telas
- [ ] Criar tela principal `DashboardScreen`
- [ ] Criar aba `OverviewTab`
- [ ] Criar aba `EmployeesTab`
- [ ] Criar aba `ServicesTab`
- [ ] Configurar navegação entre abas

### Utilitários
- [ ] Criar função `formatPriceFromCents`
- [ ] Criar função `formatDate`
- [ ] Criar função `formatNumber`
- [ ] Criar arquivo de query keys centralizado
- [ ] Criar constantes de cores para gráficos

### Testes
- [ ] Testar hooks de dados
- [ ] Testar componentes de cards
- [ ] Testar componentes de gráficos
- [ ] Testar integração de filtros
- [ ] Testar estados de loading e erro

### Polimentos
- [ ] Adicionar skeleton loading states
- [ ] Adicionar tratamento de erros
- [ ] Adicionar retry em caso de falha
- [ ] Adicionar pull-to-refresh
- [ ] Adicionar feedback visual de loading
- [ ] Testar responsividade em diferentes tamanhos
- [ ] Adicionar dark mode (opcional)

---

## Referências de Arquivos Web

### Páginas
- `src/pages/app/dashboard/index.tsx` - Página principal do dashboard

### Componentes de Filtros
- `src/pages/app/dashboard/-components/dashboard-filters.tsx` - Filtros de data

### Cards de Métricas
- `src/components/total-revenue-card.tsx`
- `src/components/net-revenue-card.tsx`
- `src/components/average-ticket-card.tsx`
- `src/components/appointments-count-card.tsx`

### Componentes de Gráficos
- `src/components/daily-revenue-chart.tsx`
- `src/components/top-services-chart.tsx`
- `src/components/most-booked-services-chart.tsx`
- `src/components/top-payment-methods-chart.tsx`
- `src/components/employee-revenue-chart.tsx`
- `src/components/employee-commission-chart.tsx`
- `src/components/services-by-employee-chart.tsx`
- `src/components/monthly-services-chart.tsx`

### Serviços API
- `src/http/reports/get-daily-revenue.ts`
- `src/http/reports/get-net-revenue.ts`
- `src/http/reports/get-average-ticket.ts`
- `src/http/reports/get-appointments-metrics.ts`
- `src/http/reports/get-top-services.ts`
- `src/http/reports/get-most-booked-services.ts`
- `src/http/reports/get-top-payment-methods.ts`
- `src/http/reports/get-employee-revenue.ts`
- `src/http/reports/get-employee-commission.ts`
- `src/http/reports/get-services-by-employee.ts`
- `src/http/reports/get-monthly-services.ts`

### Hooks
- `src/hooks/use-daily-revenue.ts`
- `src/hooks/use-net-revenue.ts`
- `src/hooks/use-average-ticket.ts`
- `src/hooks/use-appointments-count.ts`
- `src/hooks/use-top-services.ts`
- `src/hooks/use-most-booked-services.ts`
- `src/hooks/use-top-payment-methods.ts`
- `src/hooks/use-employee-revenue.ts`
- `src/hooks/use-employee-commission.ts`
- `src/hooks/use-services-by-employee.ts`
- `src/hooks/use-monthly-services.ts`

### Utilitários
- `src/lib/utils.ts` - Formatação de preços e números
- `src/lib/query-keys.ts` - Query keys centralizadas
- `src/lib/api-client.ts` - Cliente HTTP

---

## Notas Finais

Esta documentação cobre toda a implementação das métricas do app web. Para o app mobile:

1. **Mantenha a mesma estrutura de dados** - Use os mesmos endpoints e formatos
2. **Adapte os componentes visuais** - Use bibliotecas nativas de gráficos
3. **Mantenha a lógica de negócio** - Formatações, cálculos e validações devem ser idênticos
4. **Use React Query ou similar** - Para cache e gerenciamento de estado
5. **Teste extensivamente** - Garanta que os números batam com o web

Para dúvidas ou problemas, consulte os arquivos originais do web listados nas referências.
