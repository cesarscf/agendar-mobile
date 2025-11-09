# Documentação: Tela de Atualização de Disponibilidade do Estabelecimento

## Visão Geral

A funcionalidade de atualização de disponibilidade permite que estabelecimentos configurem seus horários de funcionamento para cada dia da semana, incluindo horários de abertura, fechamento e intervalos para almoço.

## Estrutura de Arquivos

```
src/pages/app/store/
├── index.tsx                                    # Página principal com tabs
└── -components/
    ├── update-availability-form.tsx             # Formulário principal
    └── day-availability-card.tsx                # Card de configuração por dia

src/http/establishment/
└── update-establishment-availability.ts         # API call

src/lib/validations/
└── availability.ts                              # Schemas Zod

src/lib/
└── utils.ts                                     # Funções de conversão de timezone
```

## Modelo de Dados

### Interface `Availability`

```typescript
interface Availability {
  id: string;              // ID do registro (vazio para novos)
  weekday: number;         // 0-6 (Domingo-Sábado)
  opensAt: string;         // Horário de abertura (formato "HH:mm")
  closesAt: string;        // Horário de fechamento (formato "HH:mm")
  breakStart?: string;     // Início do intervalo (opcional)
  breakEnd?: string;       // Fim do intervalo (opcional)
}
```

### Payload da API

```typescript
interface UpdateAvailabilityRequest {
  availability: Array<{
    weekday: number;
    opensAt: string;       // Em UTC
    closesAt: string;      // Em UTC
    breakStart?: string;   // Em UTC (opcional)
    breakEnd?: string;     // Em UTC (opcional)
  }>;
}
```

## Arquitetura da UI

### 1. Página Principal (`/app/store/`)

A página usa um sistema de **tabs** com duas seções:
- **Geral**: Informações do estabelecimento
- **Funcionamento**: Configuração de horários

```tsx
// src/pages/app/store/index.tsx:69-88
<TabsContent value="availability">
  <h1>Funcionamento da loja</h1>

  {availabilityIsLoading ? (
    <LoadingSpinner />
  ) : (
    <UpdateAvailabilityForm availabilities={availabilities ?? []} />
  )}
</TabsContent>
```

**Carregamento de Dados:**
- Usa `useQuery` do TanStack Query
- Endpoint: `GET /establishments/availability`
- Cache key: `["availabilities"]`

### 2. Formulário Principal (`UpdateAvailabilityForm`)

**Responsabilidades:**
- Gerenciar estado de todos os 7 dias da semana
- Converter horários entre local e UTC
- Submeter dados para a API

**Estrutura:**

```tsx
// src/pages/app/store/-components/update-availability-form.tsx:14-152
export function UpdateAvailabilityForm({ availabilities }) {
  // Estados individuais para cada dia
  const [sunday, setSunday] = useState<Availability>(...)
  const [monday, setMonday] = useState<Availability>(...)
  // ... outros dias

  // Mutation para salvar
  const { mutateAsync, isPending } = useMutation({
    mutationFn: updateEstablishmentAvailability
  })

  // Renderiza cards para cada dia
  return (
    <form onSubmit={onSubmit}>
      <DayAvailabilityCard weekdayLabel="Domingo" ... />
      <DayAvailabilityCard weekdayLabel="Segunda-feira" ... />
      {/* ... outros dias */}
      <Button type="submit">Salvar Horários</Button>
    </form>
  )
}
```

#### Inicialização de Estado

A função `getInitialAvailability` é executada para cada dia:

```tsx
// src/pages/app/store/-components/update-availability-form.tsx:19-43
const getInitialAvailability = (weekday: number): Availability => {
  const existing = availabilities.find((a) => a.weekday === weekday);

  if (existing) {
    // Converte horários de UTC para timezone local
    return {
      ...existing,
      opensAt: convertUTCToLocalTime(existing.opensAt),
      closesAt: convertUTCToLocalTime(existing.closesAt),
      breakStart: convertUTCToLocalTime(existing.breakStart || ""),
      breakEnd: convertUTCToLocalTime(existing.breakEnd || ""),
    };
  }

  // Retorna objeto vazio se não existir
  return {
    id: "",
    weekday,
    opensAt: "",
    closesAt: "",
    breakStart: "",
    breakEnd: "",
  };
}
```

#### Submissão do Formulário

```tsx
// src/pages/app/store/-components/update-availability-form.tsx:77-105
async function onSubmit(e: React.FormEvent) {
  e.preventDefault();

  const allAvailabilities = [
    sunday, monday, tuesday, wednesday, thursday, friday, saturday
  ];

  // Filtra apenas dias ativos (com horários preenchidos)
  const activeAvailabilities = allAvailabilities
    .filter((item) => item.opensAt && item.closesAt)
    .map((item) => ({
      weekday: item.weekday,
      opensAt: convertLocalTimeToUTC(item.opensAt),      // Converte para UTC
      closesAt: convertLocalTimeToUTC(item.closesAt),    // Converte para UTC
      breakStart: item.breakStart
        ? convertLocalTimeToUTC(item.breakStart)
        : undefined,
      breakEnd: item.breakEnd
        ? convertLocalTimeToUTC(item.breakEnd)
        : undefined,
    }));

  await mutateAsync({ availability: activeAvailabilities });
}
```

### 3. Card de Dia (`DayAvailabilityCard`)

Componente individual que gerencia a configuração de um dia específico.

**Props:**
```typescript
interface DayAvailabilityCardProps {
  weekdayLabel: string;              // "Domingo", "Segunda-feira", etc.
  availability: Availability;        // Estado do dia
  onUpdate: (availability: Availability) => void;  // Callback de atualização
}
```

**Layout Visual:**

```
┌─────────────────────────────────────────────────────┐
│ Segunda-feira          [🗑️] [Aberto/Fechado] [Switch]│
├─────────────────────────────────────────────────────┤
│                                                     │
│   Abre às               Fecha às                   │
│   [🕐] [09:00]         [🕐] [18:00]               │
│                                                     │
│   ─────────────────────────────────────────────    │
│                                                     │
│   [☕] Intervalo para almoço           [Switch]    │
│                                                     │
│      Início do intervalo    Fim do intervalo      │
│      [🕐] [12:00]          [🕐] [13:00]          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Estados do Card:**

1. **Fechado** (inativo):
   - Switch desligado
   - Campos de horário ocultos
   - `opensAt` e `closesAt` vazios

2. **Aberto** (ativo sem intervalo):
   - Switch ligado
   - Campos de abertura/fechamento visíveis
   - Seção de intervalo oculta

3. **Aberto com Intervalo**:
   - Switch principal ligado
   - Switch de intervalo ligado
   - Todos os campos visíveis

#### Funções de Controle

```tsx
// src/pages/app/store/-components/day-availability-card.tsx:24-40
const toggleDayActive = (active: boolean) => {
  if (active) {
    // Ativa o dia com horários padrão
    onUpdate({
      ...availability,
      opensAt: availability.opensAt || "09:00",
      closesAt: availability.closesAt || "18:00",
    });
  } else {
    // Desativa e limpa todos os horários
    onUpdate({
      ...availability,
      opensAt: "",
      closesAt: "",
      breakStart: "",
      breakEnd: "",
    });
  }
};
```

```tsx
// src/pages/app/store/-components/day-availability-card.tsx:42-56
const toggleBreak = (hasBreak: boolean) => {
  if (hasBreak) {
    // Adiciona intervalo com valores padrão
    onUpdate({
      ...availability,
      breakStart: availability.breakStart || "12:00",
      breakEnd: availability.breakEnd || "13:00",
    });
  } else {
    // Remove intervalo
    onUpdate({
      ...availability,
      breakStart: "",
      breakEnd: "",
    });
  }
};
```

```tsx
// src/pages/app/store/-components/day-availability-card.tsx:58-66
const clearDay = () => {
  // Limpa todos os campos do dia
  onUpdate({
    ...availability,
    opensAt: "",
    closesAt: "",
    breakStart: "",
    breakEnd: "",
  });
};
```

```tsx
// src/pages/app/store/-components/day-availability-card.tsx:68-73
const updateField = (key: keyof Availability, value: string) => {
  // Atualiza um campo específico
  onUpdate({
    ...availability,
    [key]: value,
  });
};
```

#### Componentes de Input

**Input de Horário:**
```tsx
// src/pages/app/store/-components/day-availability-card.tsx:105-113
<div className="relative flex w-full items-center gap-2">
  <Clock2Icon className="text-muted-foreground pointer-events-none absolute left-2.5 size-4" />
  <Input
    type="time"
    className="appearance-none pl-8 [&::-webkit-calendar-picker-indicator]:hidden"
    value={availability.opensAt}
    onChange={(e) => updateField("opensAt", e.target.value)}
  />
</div>
```

**Características:**
- Tipo `time` nativo do HTML5
- Ícone de relógio decorativo à esquerda
- Picker do navegador oculto com CSS
- Formato automático "HH:mm"

## Conversão de Timezone

### Problema

O backend armazena horários em **UTC**, mas o usuário precisa visualizar e editar em **timezone local**.

### Solução

Funções utilitárias em `src/lib/utils.ts`:

#### 1. Local → UTC (ao salvar)

```typescript
// src/lib/utils.ts:296-309
export const convertLocalTimeToUTC = (time: string): string => {
  if (!time) return "";

  const [hours, minutes] = time.split(":").map(Number);

  // Cria Date com horário local
  const localDate = new Date();
  localDate.setHours(hours, minutes, 0, 0);

  // Extrai horário UTC (aplica offset automaticamente)
  const utcHours = localDate.getUTCHours().toString().padStart(2, "0");
  const utcMinutes = localDate.getUTCMinutes().toString().padStart(2, "0");

  return `${utcHours}:${utcMinutes}`;
};
```

**Exemplo:**
- Input: `"17:00"` (5 PM no Brasil, UTC-3)
- Output: `"20:00"` (8 PM UTC)

#### 2. UTC → Local (ao carregar)

```typescript
// src/lib/utils.ts:317-330
export const convertUTCToLocalTime = (time: string): string => {
  if (!time) return "";

  const [hours, minutes] = time.split(":").map(Number);

  // Cria Date com horário UTC
  const utcDate = new Date();
  utcDate.setUTCHours(hours, minutes, 0, 0);

  // Extrai horário local (aplica offset automaticamente)
  const localHours = utcDate.getHours().toString().padStart(2, "0");
  const localMinutes = utcDate.getMinutes().toString().padStart(2, "0");

  return `${localHours}:${localMinutes}`;
};
```

**Exemplo:**
- Input: `"20:00"` (8 PM UTC)
- Output: `"17:00"` (5 PM no Brasil, UTC-3)

### Fluxo Completo

```
┌──────────────┐
│   Backend    │
│ (UTC 20:00)  │
└──────┬───────┘
       │
       │ GET /establishments/availability
       ↓
┌──────────────┐
│ convertUTC   │
│ ToLocalTime  │  ← Executa em getInitialAvailability
└──────┬───────┘
       │
       ↓
┌──────────────┐
│  React State │
│ (Local 17:00)│  ← Usuário visualiza e edita
└──────┬───────┘
       │
       │ onSubmit
       ↓
┌──────────────┐
│ convertLocal │
│ TimeToUTC    │  ← Executa antes de enviar
└──────┬───────┘
       │
       │ POST /establishments/availability
       ↓
┌──────────────┐
│   Backend    │
│ (UTC 20:00)  │
└──────────────┘
```

## API

### Endpoint

```
POST /establishments/availability
```

### Request Body

```json
{
  "availability": [
    {
      "weekday": 1,
      "opensAt": "12:00",      // UTC
      "closesAt": "21:00",     // UTC
      "breakStart": "15:00",   // UTC (opcional)
      "breakEnd": "16:00"      // UTC (opcional)
    },
    {
      "weekday": 2,
      "opensAt": "12:00",
      "closesAt": "21:00"
    }
    // ... outros dias ativos
  ]
}
```

### Response

```
Status: 200 OK
```

### Implementação

```typescript
// src/http/establishment/update-establishment-availability.ts:4-12
export async function updateEstablishmentAvailability(
  inputs: UpdateAvailabilityRequest,
) {
  const payload = {
    ...inputs,
  };

  await api.post("/establishments/availability", payload);
}
```

## Validações

### Schema Zod

```typescript
// src/lib/validations/availability.ts:3-14
export const availabilitySchema = z.object({
  id: z.string(),
  weekday: z.number(),
  opensAt: z.string(),
  closesAt: z.string(),
  breakStart: z.string().optional(),
  breakEnd: z.string().optional(),
});

export const updateAvailabilitySchema = z.object({
  availability: z.array(availabilitySchema.omit({ id: true })),
});
```

### Validações Implícitas

1. **Dias Ativos**: Apenas dias com `opensAt` E `closesAt` são enviados
2. **Intervalo Completo**: Se `breakStart` existe, `breakEnd` também deve existir
3. **Formato de Horário**: Input HTML5 type="time" valida automaticamente

## Estado e Gerenciamento

### React Query

```typescript
// Buscar disponibilidades
const { data: availabilities, isLoading } = useQuery({
  queryKey: ["availabilities"],
  queryFn: getEstablishmentAvailability,
});

// Atualizar disponibilidades
const { mutateAsync, isPending } = useMutation({
  mutationFn: updateEstablishmentAvailability,
  onSuccess: () => {
    toast.success("Horários salvos com sucesso!");
  },
  onError: () => {
    toast.error("Erro ao salvar horários");
  },
});
```

### Estado Local

Cada dia tem seu próprio estado:

```typescript
const [sunday, setSunday] = useState<Availability>(...)
const [monday, setMonday] = useState<Availability>(...)
// ... etc
```

**Vantagem**: Atualizações independentes, sem re-renders desnecessários

## Feedback Visual

### Loading States

1. **Carregamento Inicial:**
```tsx
{availabilityIsLoading && (
  <div className="animate-spin rounded-full h-12 w-12 border-b-2" />
)}
```

2. **Salvando:**
```tsx
<Button disabled={isPending}>
  {isPending ? "Salvando..." : "Salvar Horários"}
</Button>
```

### Toasts

```typescript
onSuccess: () => toast.success("Horários salvos com sucesso!")
onError: () => toast.error("Erro ao salvar horários")
```

## Comportamentos de UX

### 1. Ativar Dia

**Ação:** Usuário liga o switch principal
**Resultado:**
- Campos de horário aparecem
- Valores padrão: `09:00` - `18:00`

### 2. Desativar Dia

**Ação:** Usuário desliga o switch principal
**Resultado:**
- Todos os campos são limpos
- Card recolhe
- Intervalo também é removido

### 3. Adicionar Intervalo

**Ação:** Usuário liga o switch de intervalo
**Resultado:**
- Campos de intervalo aparecem
- Valores padrão: `12:00` - `13:00`

### 4. Remover Intervalo

**Ação:** Usuário desliga o switch de intervalo
**Resultado:**
- Campos de intervalo desaparecem
- Valores são limpos

### 5. Limpar Dia

**Ação:** Usuário clica no ícone de lixeira
**Resultado:**
- Todos os campos são limpos
- Switch volta para "Fechado"
- Equivalente a desativar o dia

### 6. Editar Horários

**Ação:** Usuário altera valor em input de horário
**Resultado:**
- Estado atualiza imediatamente
- Nenhuma validação visual até submit

## Estilos e Layout

### Responsividade

```tsx
// Grid responsivo para horários
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>Abre às</div>
  <div>Fecha às</div>
</div>
```

- **Mobile**: Campos empilhados verticalmente
- **Desktop**: Campos lado a lado

### Componentes UI

- **Card**: Container do shadcn/ui
- **Switch**: Toggle de shadcn/ui
- **Input**: Input de shadcn/ui com type="time"
- **Button**: Botão de shadcn/ui
- **Label**: Label de shadcn/ui
- **Separator**: Linha divisória de shadcn/ui

### Ícones (lucide-react)

- `Clock2Icon`: Indicador de campo de horário
- `Coffee`: Indicador de intervalo para almoço
- `Trash2`: Botão de limpar dia

## Considerações para Mobile

### 1. Input de Horário

No mobile, `<input type="time">` abre picker nativo:
- **iOS**: Wheel picker
- **Android**: Relógio analógico/digital

**Recomendação:** Manter o mesmo comportamento

### 2. Layout Responsivo

Já está otimizado:
```tsx
className="grid grid-cols-1 md:grid-cols-2 gap-4"
```

**Mobile:** 1 coluna
**Desktop:** 2 colunas

### 3. Scrolling

Lista de 7 cards pode ser longa em mobile:
- Cards são independentes
- Usuário pode scrollar naturalmente
- Botão "Salvar" fica fixo no final

### 4. Switches

Componente Switch já é touch-friendly:
- Área de toque adequada
- Feedback visual claro

## Fluxo de Dados Completo

```
1. CARREGAMENTO
   ↓
   GET /establishments/availability
   ↓
   Resposta com horários em UTC
   ↓
   getInitialAvailability() converte UTC → Local
   ↓
   setState() para cada dia
   ↓
   Renderiza cards com valores locais

2. EDIÇÃO
   ↓
   Usuário altera horário no input
   ↓
   onChange() captura evento
   ↓
   updateField() atualiza estado
   ↓
   Re-render do card específico

3. SALVAMENTO
   ↓
   Usuário clica em "Salvar"
   ↓
   onSubmit() é chamado
   ↓
   Filtra dias ativos (com opensAt e closesAt)
   ↓
   Converte horários Local → UTC
   ↓
   POST /establishments/availability
   ↓
   Toast de sucesso/erro
```

## Checklist de Implementação Mobile

### Backend/API
- [ ] Endpoint `/establishments/availability` funcionando
- [ ] Suporte para formato `{ availability: [...] }`
- [ ] Horários armazenados em UTC

### Data Layer
- [ ] Função para GET disponibilidades
- [ ] Função para POST disponibilidades
- [ ] Cache/estado global (React Query, Redux, etc)

### Utilities
- [ ] `convertLocalTimeToUTC(time: string): string`
- [ ] `convertUTCToLocalTime(time: string): string`
- [ ] Array de weekdays traduzidos

### UI Components
- [ ] `UpdateAvailabilityForm` (componente principal)
- [ ] `DayAvailabilityCard` (card individual)
- [ ] Time Picker (nativo ou biblioteca)
- [ ] Switch/Toggle component
- [ ] Button component
- [ ] Loading states

### Lógica
- [ ] Estado para cada dia da semana
- [ ] Inicialização com dados do backend
- [ ] Conversão UTC ↔ Local
- [ ] Toggle dia ativo/inativo
- [ ] Toggle intervalo
- [ ] Atualização de campos
- [ ] Filtro de dias ativos no submit
- [ ] Mutation com feedback (toast/snackbar)

### UX/Styling
- [ ] Layout responsivo
- [ ] Estados visuais (loading, error, success)
- [ ] Validação de formulário
- [ ] Feedback tátil (mobile)
- [ ] Acessibilidade (labels, aria-*)

## Possíveis Melhorias

### 1. Validações Adicionais

```typescript
// Validar se closesAt > opensAt
if (closesAt <= opensAt) {
  toast.error("Horário de fechamento deve ser após abertura");
  return;
}

// Validar se intervalo está dentro do expediente
if (breakStart < opensAt || breakEnd > closesAt) {
  toast.error("Intervalo deve estar dentro do horário de funcionamento");
  return;
}
```

### 2. Copiar Horários

```tsx
<Button onClick={() => copyToAllDays(monday)}>
  Copiar para todos os dias
</Button>
```

### 3. Preset de Horários

```typescript
const presets = {
  comercial: { opensAt: "09:00", closesAt: "18:00" },
  noturno: { opensAt: "18:00", closesAt: "02:00" },
  // ...
};
```

### 4. Validação de Intervalo

Garantir que `breakEnd` > `breakStart`:

```typescript
if (breakEnd <= breakStart) {
  toast.error("Fim do intervalo deve ser após o início");
  return;
}
```

### 5. Cache Invalidation

```typescript
onSuccess: () => {
  queryClient.invalidateQueries(["availabilities"]);
  toast.success("Horários salvos!");
}
```

## Resumo Técnico

### Stack
- **Framework**: React
- **Gerenciamento de Estado**: React useState + TanStack Query
- **Validação**: Zod
- **UI**: shadcn/ui
- **Ícones**: lucide-react
- **Notificações**: sonner (toast)
- **Timezone**: Date API nativa do JavaScript

### Pontos-Chave
1. **7 estados independentes** para cada dia da semana
2. **Conversão UTC ↔ Local** ao carregar e salvar
3. **Filtro de dias ativos** antes de enviar (apenas com opensAt e closesAt)
4. **Intervalo opcional** com toggle dedicado
5. **Inputs type="time"** do HTML5 para seleção de horário
6. **Layout responsivo** com grid adaptável

### Complexidade
- **Baixa**: UI simples, componentes reutilizáveis
- **Média**: Lógica de conversão de timezone
- **Baixa**: Gerenciamento de estado local

---

**Versão:** 1.0
**Última atualização:** 2025-11-09
