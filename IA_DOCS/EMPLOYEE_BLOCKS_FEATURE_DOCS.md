# Documentação: Sistema de Bloqueios de Profissionais

## Visão Geral

O sistema de bloqueios permite que estabelecimentos configurem períodos em que profissionais não estarão disponíveis para agendamentos. Existem dois tipos de bloqueios:

1. **Bloqueios Pontuais**: Bloqueios para datas e horários específicos (ex: férias, compromissos médicos)
2. **Bloqueios Recorrentes**: Bloqueios que se repetem semanalmente (ex: todas as quartas das 14h às 16h)

## Estrutura de Arquivos

```
src/pages/app/employees/$employeeId/
├── index.tsx                                    # Página principal com tabs
└── -components/
    ├── blocks.tsx                               # Componente principal de listagem
    ├── create-employee-block.tsx                # Formulário de bloqueio pontual
    └── create-employee-recurring-block.tsx      # Formulário de bloqueio recorrente

src/http/employees/
├── get-employee-blocks.ts                       # GET bloqueios pontuais
├── get-employee-recurring-blocks.ts             # GET bloqueios recorrentes
├── create-employee-block.ts                     # POST bloqueio pontual
├── create-employee-recurring-block.ts           # POST bloqueio recorrente
├── delete-employee-block.ts                     # DELETE bloqueio pontual
└── delete-employee-recurring-block.ts           # DELETE bloqueio recorrente

src/lib/validations/
└── blocks.ts                                    # Schemas Zod
```

## Modelo de Dados

### Interface `EmployeeBlock` (Bloqueio Pontual)

```typescript
interface EmployeeBlock {
  id: string;              // UUID do bloqueio
  startsAt: Date;          // Data/hora de início (Date object)
  endsAt: Date;            // Data/hora de fim (Date object)
  reason: string;          // Motivo do bloqueio
}
```

### Interface `EmployeeRecurringBlock` (Bloqueio Recorrente)

```typescript
interface EmployeeRecurringBlock {
  id: string;              // UUID do bloqueio
  weekday: number;         // 0-6 (Domingo-Sábado)
  startTime: string;       // Horário de início (formato "HH:mm")
  endTime: string;         // Horário de fim (formato "HH:mm")
  reason: string;          // Motivo do bloqueio
}
```

### Payloads da API

#### Criar Bloqueio Pontual

```typescript
interface CreateEmployeeBlockRequest {
  employeeId: string;
  startsAt: Date;          // Data/hora em UTC
  endsAt: Date;            // Data/hora em UTC
  reason: string;
}
```

#### Criar Bloqueio Recorrente

```typescript
interface CreateEmployeeRecurringBlockRequest {
  employeeId: string;
  weekday: number;         // 0-6
  startTime: string;       // Horário em UTC "HH:mm"
  endTime: string;         // Horário em UTC "HH:mm"
  reason: string;
}
```

## Arquitetura da UI

### 1. Página Principal (`/app/employees/$employeeId/`)

A página do profissional usa **tabs** com três seções:
- **Geral**: Informações do profissional
- **Serviços**: Serviços que o profissional realiza
- **Bloqueios**: Gerenciamento de bloqueios (nossa feature)

```tsx
// src/pages/app/employees/$employeeId/index.tsx:95-106
<TabsContent value="blocks">
  <div className="my-4">
    <h1>Atualizar os bloqueios do profissional</h1>
    <p>Atualize os bloqueios do profissional {data.name}</p>
  </div>

  <EmployeeBlocks employeeId={employeeId} />
</TabsContent>
```

### 2. Componente Principal (`EmployeeBlocks`)

**Responsabilidades:**
- Gerenciar sub-tabs (Pontuais vs Recorrentes)
- Listar bloqueios existentes
- Abrir modais de criação
- Executar exclusão de bloqueios

**Estrutura Visual:**

```
┌─────────────────────────────────────────────────────────────┐
│ [Bloqueios Pontuais] [Bloqueios Recorrentes]  [+ Adicionar] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Card 1       │  │ Card 2       │  │ Card 3       │     │
│  │              │  │              │  │              │     │
│  │ Data/Horário │  │ Data/Horário │  │ Data/Horário │     │
│  │ Motivo       │  │ Motivo       │  │ Motivo       │     │
│  │        [🗑️]  │  │        [🗑️]  │  │        [🗑️]  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Sub-Tabs

```tsx
// src/pages/app/employees/$employeeId/-components/blocks.tsx:59-72
<Tabs value={blockType || "blocks"} onValueChange={setBlockType}>
  <TabsList className="grid grid-cols-2">
    <TabsTrigger value="blocks">Bloqueios Pontuais</TabsTrigger>
    <TabsTrigger value="recurring-blocks">Bloqueios Recorrentes</TabsTrigger>
  </TabsList>

  {/* Botão "Adicionar" condicional */}
  {blockType === "blocks" && (
    <Button>+ Adicionar Bloqueio Pontual</Button>
  )}
  {blockType === "recurring-blocks" && (
    <Button>+ Adicionar Bloqueio Recorrente</Button>
  )}
</Tabs>
```

**Estado:**
- URL query parameter `?type=blocks` ou `?type=recurring-blocks`
- Persiste entre reloads

#### Carregamento de Dados

```tsx
// src/pages/app/employees/$employeeId/-components/blocks.tsx:34-42
const { data: blocks } = useQuery({
  queryKey: ["employee", employeeId, "blocks"],
  queryFn: () => getEmployeeBlocks(employeeId),
});

const { data: recurringBlocks } = useQuery({
  queryKey: ["employee", employeeId, "recurring-blocks"],
  queryFn: () => getEmployeeRecurringBlocks(employeeId),
});
```

**Endpoints:**
- `GET /employees/:employeeId/blocks`
- `GET /employees/:employeeId/recurring-blocks`

### 3. Listagem de Bloqueios

#### Cards de Bloqueios Pontuais

```tsx
// src/pages/app/employees/$employeeId/-components/blocks.tsx:130-171
<TabsContent value="blocks">
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {blocks?.map((block) => (
      <Card key={block.id}>
        <CardHeader>
          <CardTitle>{formatDate(block.startsAt, "dd/MM/yyyy HH:mm")}</CardTitle>
          <Button variant="ghost" size="icon" onClick={deleteBlock}>
            <Trash />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {formatDate(block.startsAt, "dd/MM/yyyy HH:mm")} -
            {formatDate(block.endsAt, "dd/MM/yyyy HH:mm")}
          </p>
          <div className="mt-2">
            <Label>Motivo</Label>
            <p>{block.reason}</p>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
</TabsContent>
```

**Layout do Card:**

```
┌────────────────────────────────────┐
│ 15/01/2025 09:00          [🗑️]    │
├────────────────────────────────────┤
│ 15/01/2025 09:00 -                │
│ 15/01/2025 17:00                  │
│                                    │
│ Motivo                             │
│ Consulta médica                    │
└────────────────────────────────────┘
```

#### Cards de Bloqueios Recorrentes

```tsx
// src/pages/app/employees/$employeeId/-components/blocks.tsx:173-215
<TabsContent value="recurring-blocks">
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {recurringBlocks?.map((block) => (
      <Card key={block.id}>
        <CardHeader>
          <CardTitle>{weekdays[block.weekday]}</CardTitle>
          <Button variant="ghost" size="icon" onClick={deleteRecurringBlock}>
            <Trash />
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {block.startTime} - {block.endTime}
          </p>
          <div className="mt-2">
            <Label>Motivo</Label>
            <p>{block.reason}</p>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
</TabsContent>
```

**Layout do Card:**

```
┌────────────────────────────────────┐
│ Quarta-feira              [🗑️]    │
├────────────────────────────────────┤
│ 14:00 - 16:00                     │
│                                    │
│ Motivo                             │
│ Aula de inglês                     │
└────────────────────────────────────┘
```

#### Responsividade da Grid

```tsx
className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
```

- **Mobile**: 1 coluna
- **Tablet (md)**: 2 colunas
- **Desktop (lg)**: 3 colunas

### 4. Exclusão de Bloqueios

#### Bloqueio Pontual

```tsx
// src/pages/app/employees/$employeeId/-components/blocks.tsx:142-151
onClick={async () => {
  if (confirm("Tem certeza que deseja excluir este bloqueio?")) {
    await deleteEmployeeBlockMutate(block.id);
    queryClient.invalidateQueries({
      queryKey: ["employee", employeeId, "blocks"],
    });
  }
}}
```

**Endpoint:** `DELETE /blocks/:blockId`

#### Bloqueio Recorrente

```tsx
// src/pages/app/employees/$employeeId/-components/blocks.tsx:185-195
onClick={async () => {
  if (confirm("Tem certeza que deseja excluir este bloqueio recorrente?")) {
    await deleteEmployeeRecurringBlockMutate(block.id);
    queryClient.invalidateQueries({
      queryKey: ["employee", employeeId, "recurring-blocks"],
    });
  }
}}
```

**Endpoint:** `DELETE /recurring-blocks/:recurringBlockId`

**Características:**
- Confirmação nativa via `confirm()`
- Invalidação automática de cache
- Loading state no botão durante exclusão

## Criação de Bloqueios

### 1. Modal de Criação

Ambos os tipos usam o componente `Dialog` do shadcn/ui:

```tsx
// src/pages/app/employees/$employeeId/-components/blocks.tsx:74-97
<Dialog open={showCreateBlock} onOpenChange={setShowCreateBlock}>
  <DialogTrigger asChild>
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Adicionar Bloqueio Pontual
    </Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-[425px]">
    <DialogHeader>
      <DialogTitle>Adicionar Bloqueio Pontual</DialogTitle>
      <DialogDescription>
        Preencha os detalhes para adicionar um novo bloqueio pontual.
      </DialogDescription>
    </DialogHeader>
    <CreateEmployeeBlock
      employeeId={employeeId}
      onSuccess={() => setShowCreateBlock(false)}
    />
  </DialogContent>
</Dialog>
```

**Comportamento:**
- Modal fecha automaticamente após sucesso
- Estado controlado via `useState`
- Callback `onSuccess` para fechar modal

### 2. Formulário de Bloqueio Pontual

**Componente:** `CreateEmployeeBlock`

**Campos:**
1. **Hora de Início** - DateTime picker (data + hora)
2. **Hora de Fim** - DateTime picker (data + hora)
3. **Motivo** - Textarea

#### DateTime Picker

O componente usa uma combinação de Calendar + Time Input:

```tsx
// src/pages/app/employees/$employeeId/-components/create-employee-block.tsx:73-141
<FormField name="startsAt">
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="outline">
        <CalendarIcon className="mr-2 h-4 w-4" />
        {field.value
          ? format(field.value, "PPP HH:mm", { locale: ptBR })
          : "Selecione a data e hora de início"
        }
      </Button>
    </PopoverTrigger>
    <PopoverContent>
      {/* Calendário */}
      <Calendar
        mode="single"
        selected={field.value}
        onSelect={(date) => {
          // Preserva horário existente ao mudar data
          const existingDate = field.value || new Date();
          const newDateTime = setMinutes(
            setHours(date, existingDate.getHours()),
            existingDate.getMinutes()
          );
          field.onChange(newDateTime);
        }}
        locale={ptBR}
      />

      {/* Input de hora */}
      <div className="p-3 border-t">
        <Clock2Icon />
        <Input
          type="time"
          value={field.value ? format(field.value, "HH:mm") : ""}
          onChange={(e) => {
            const [hours, minutes] = e.target.value.split(":").map(Number);
            const existingDate = field.value || new Date();
            const newDateTime = setMinutes(
              setHours(existingDate, hours),
              minutes
            );
            field.onChange(newDateTime);
          }}
        />
      </div>
    </PopoverContent>
  </Popover>
</FormField>
```

**Funcionamento:**

1. **Botão Trigger:**
   - Mostra valor selecionado ou placeholder
   - Formato: "15 de janeiro de 2025 14:30"

2. **Popover:**
   - **Seção Superior**: Calendário para selecionar data
   - **Seção Inferior**: Input de horário (type="time")

3. **Sincronização:**
   - Ao mudar data: preserva horário
   - Ao mudar hora: preserva data
   - Ambos atualizam o mesmo campo `Date`

**Visual do Picker:**

```
┌──────────────────────────────┐
│ [🗓️] 15 de janeiro de 2025 14:30 │ ← Trigger
└──────────────────────────────┘

┌──────────────────────────────┐
│   Janeiro 2025               │
│ D  S  T  Q  Q  S  S          │
│       1  2  3  4  5          │
│ 6  7  8  9 10 11 12          │
│13 14 [15]16 17 18 19         │ ← Calendário
│20 21 22 23 24 25 26          │
│27 28 29 30 31                │
├──────────────────────────────┤
│ [🕐] [14:30]                 │ ← Input de hora
└──────────────────────────────┘
```

#### Campo de Motivo

```tsx
// src/pages/app/employees/$employeeId/-components/create-employee-block.tsx:216-231
<FormField name="reason">
  <FormLabel>Motivo</FormLabel>
  <FormControl>
    <Textarea
      placeholder="Digite aqui o motivo do bloqueio"
      {...field}
    />
  </FormControl>
  <FormMessage />
</FormField>
```

#### Submissão

```tsx
// src/pages/app/employees/$employeeId/-components/create-employee-block.tsx:53-65
async function onSubmit(values: Inputs) {
  await mutateAsync({
    ...values,
    employeeId,
    startsAt: convertLocalDateToUTC(values.startsAt),  // Converte para UTC
    endsAt: convertLocalDateToUTC(values.endsAt),      // Converte para UTC
  });

  queryClient.invalidateQueries({
    queryKey: ["employee", employeeId, "blocks"],
  });

  onSuccess?.();  // Fecha o modal
}
```

**Endpoint:** `POST /employees/:employeeId/blocks`

### 3. Formulário de Bloqueio Recorrente

**Componente:** `CreateEmployeeRecurringBlock`

**Campos:**
1. **Dia da Semana** - Select dropdown
2. **Hora de Início** - Time input
3. **Hora de Fim** - Time input
4. **Motivo** - Textarea

#### Select de Dia da Semana

```tsx
// src/pages/app/employees/$employeeId/-components/create-employee-recurring-block.tsx:75-101
<FormField name="weekday">
  <FormLabel>Dia da semana</FormLabel>
  <Select
    onValueChange={(value) => field.onChange(Number(value))}
    defaultValue={String(field.value)}
  >
    <FormControl>
      <SelectTrigger>
        <SelectValue placeholder="Selecione o dia da semana" />
      </SelectTrigger>
    </FormControl>
    <SelectContent>
      {weekdays.map((day, index) => (
        <SelectItem key={day} value={String(index)}>
          {day}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  <FormMessage />
</FormField>
```

**Array de Dias:**
```typescript
// src/lib/utils.ts:139-147
export const weekdays = [
  "Domingo",      // 0
  "Segunda-feira", // 1
  "Terça-feira",  // 2
  "Quarta-feira", // 3
  "Quinta-feira", // 4
  "Sexta-feira",  // 5
  "Sábado",       // 6
];
```

#### Inputs de Horário

```tsx
// src/pages/app/employees/$employeeId/-components/create-employee-recurring-block.tsx:103-123
<FormField name="startTime">
  <FormLabel>Hora de Início</FormLabel>
  <FormControl>
    <div className="relative flex w-full items-center gap-2">
      <Clock2Icon className="text-muted-foreground pointer-events-none absolute left-2.5 size-4" />
      <Input
        type="time"
        className="appearance-none pl-8 [&::-webkit-calendar-picker-indicator]:hidden"
        value={field.value}
        onChange={(e) => field.onChange(e.target.value)}
      />
    </div>
  </FormControl>
  <FormMessage />
</FormField>
```

**Características:**
- Input HTML5 nativo (type="time")
- Ícone decorativo à esquerda
- Picker do navegador oculto com CSS
- Formato "HH:mm"

#### Submissão

```tsx
// src/pages/app/employees/$employeeId/-components/create-employee-recurring-block.tsx:54-67
async function onSubmit(values: Inputs) {
  await mutateAsync({
    ...values,
    employeeId,
    startTime: convertLocalTimeToUTC(values.startTime),  // Converte para UTC
    endTime: convertLocalTimeToUTC(values.endTime),      // Converte para UTC
  });

  queryClient.invalidateQueries({
    queryKey: ["employee", employeeId, "recurring-blocks"],
  });

  onSuccess?.();  // Fecha o modal
}
```

**Endpoint:** `POST /employees/:employeeId/recurring-blocks`

## Conversão de Timezone

### Problema

Assim como na feature de availability, o backend armazena dados em **UTC**, mas o usuário edita em **timezone local**.

### Tipos de Conversão

#### 1. Bloqueios Pontuais (Date objects)

**Local → UTC (ao criar):**

```typescript
// src/lib/utils.ts:338-342
export function convertLocalDateToUTC(localDate: Date): Date {
  // Date objects já são internamente UTC
  // toISOString() retorna a representação UTC correta
  return localDate;
}
```

**Exemplo:**
- Input: `Date(2025-01-15T14:30:00)` (local timezone)
- API recebe: `"2025-01-15T17:30:00.000Z"` (UTC via toISOString)

**UTC → Local (ao carregar):**

```typescript
// src/http/employees/get-employee-blocks.ts:15-19
return response.data.map((block) => ({
  ...block,
  startsAt: new Date(convertUTCStringToLocal(block.startsAt)),
  endsAt: new Date(convertUTCStringToLocal(block.endsAt)),
}));
```

```typescript
// src/lib/utils.ts:349-353
export function convertUTCStringToLocal(utcString: string): string {
  // Date constructor já trata ISO strings corretamente
  return new Date(utcString).toISOString();
}
```

#### 2. Bloqueios Recorrentes (Time strings)

Usa as mesmas funções da feature de availability:

**Local → UTC (ao criar):**

```typescript
// src/lib/utils.ts:296-309
export const convertLocalTimeToUTC = (time: string): string => {
  if (!time) return "";

  const [hours, minutes] = time.split(":").map(Number);
  const localDate = new Date();
  localDate.setHours(hours, minutes, 0, 0);

  const utcHours = localDate.getUTCHours().toString().padStart(2, "0");
  const utcMinutes = localDate.getUTCMinutes().toString().padStart(2, "0");

  return `${utcHours}:${utcMinutes}`;
};
```

**UTC → Local (ao carregar):**

```typescript
// src/http/employees/get-employee-recurring-blocks.ts:10-14
return response.data.map((block) => ({
  ...block,
  startTime: convertUTCToLocalTime(block.startTime),
  endTime: convertUTCToLocalTime(block.endTime),
}));
```

```typescript
// src/lib/utils.ts:317-330
export const convertUTCToLocalTime = (time: string): string => {
  if (!time) return "";

  const [hours, minutes] = time.split(":").map(Number);
  const utcDate = new Date();
  utcDate.setUTCHours(hours, minutes, 0, 0);

  const localHours = utcDate.getHours().toString().padStart(2, "0");
  const localMinutes = utcDate.getMinutes().toString().padStart(2, "0");

  return `${localHours}:${localMinutes}`;
};
```

## API Endpoints

### Bloqueios Pontuais

#### Listar
```
GET /employees/:employeeId/blocks
```

**Response:**
```json
[
  {
    "id": "uuid",
    "startsAt": "2025-01-15T17:30:00.000Z",  // UTC
    "endsAt": "2025-01-15T20:00:00.000Z",    // UTC
    "reason": "Consulta médica"
  }
]
```

#### Criar
```
POST /employees/:employeeId/blocks
```

**Request Body:**
```json
{
  "startsAt": "2025-01-15T17:30:00.000Z",  // UTC Date ISO string
  "endsAt": "2025-01-15T20:00:00.000Z",    // UTC Date ISO string
  "reason": "Consulta médica"
}
```

**Response:** `201 Created`

#### Excluir
```
DELETE /blocks/:blockId
```

**Response:** `204 No Content`

### Bloqueios Recorrentes

#### Listar
```
GET /employees/:employeeId/recurring-blocks
```

**Response:**
```json
[
  {
    "id": "uuid",
    "weekday": 3,                // Quarta-feira
    "startTime": "17:00",        // UTC
    "endTime": "19:00",          // UTC
    "reason": "Aula de inglês"
  }
]
```

#### Criar
```
POST /employees/:employeeId/recurring-blocks
```

**Request Body:**
```json
{
  "weekday": 3,
  "startTime": "17:00",        // UTC
  "endTime": "19:00",          // UTC
  "reason": "Aula de inglês"
}
```

**Response:** `201 Created`

#### Excluir
```
DELETE /recurring-blocks/:recurringBlockId
```

**Response:** `204 No Content`

## Validações

### Schemas Zod

```typescript
// src/lib/validations/blocks.ts:3-21
export const blockSchema = z.object({
  id: z.uuid(),
  endsAt: z.date(),
  startsAt: z.date(),
  reason: z.string(),
});

export const recurringBlockSchema = z.object({
  id: z.uuid(),
  weekday: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  reason: z.string(),
});

export const createBlockSchema = blockSchema.omit({ id: true });
export const createRecurringBlockSchema = recurringBlockSchema.omit({ id: true });
```

### Validações Implícitas

1. **Campos Obrigatórios**: Todos os campos são required
2. **Formato de Data**: Validado pelo Calendar component
3. **Formato de Horário**: Validado pelo input type="time"
4. **UUID**: Validado no schema

## Estado e Gerenciamento

### React Query

#### Queries

```typescript
// Bloqueios Pontuais
const { data: blocks } = useQuery({
  queryKey: ["employee", employeeId, "blocks"],
  queryFn: () => getEmployeeBlocks(employeeId),
});

// Bloqueios Recorrentes
const { data: recurringBlocks } = useQuery({
  queryKey: ["employee", employeeId, "recurring-blocks"],
  queryFn: () => getEmployeeRecurringBlocks(employeeId),
});
```

#### Mutations

```typescript
// Criar Bloqueio Pontual
const { mutateAsync, isPending } = useMutation({
  mutationFn: createEmployeeBlock,
});

// Criar Bloqueio Recorrente
const { mutateAsync, isPending } = useMutation({
  mutationFn: createEmployeeRecurringBlock,
});

// Excluir Bloqueio Pontual
const { mutateAsync, isPending } = useMutation({
  mutationFn: deleteEmployeeBlock,
});

// Excluir Bloqueio Recorrente
const { mutateAsync, isPending } = useMutation({
  mutationFn: deleteEmployeeRecurringBlock,
});
```

#### Cache Invalidation

Após criar ou excluir, invalidar cache:

```typescript
queryClient.invalidateQueries({
  queryKey: ["employee", employeeId, "blocks"],
});

queryClient.invalidateQueries({
  queryKey: ["employee", employeeId, "recurring-blocks"],
});
```

### Estado Local

```typescript
// Controle de modais
const [showCreateBlock, setShowCreateBlock] = useState(false);
const [showCreateRecurringBlock, setShowCreateRecurringBlock] = useState(false);

// Tab ativa (sincronizado com URL)
const [blockType, setBlockType] = useQueryState("type", {
  defaultValue: "blocks",
});
```

## Feedback Visual

### Loading States

#### Durante Exclusão

```tsx
<Button
  disabled={deleteEmployeeBlockIsPending}
  onClick={deleteBlock}
>
  <Trash />
</Button>
```

#### Durante Criação

```tsx
<Button type="submit" disabled={isPending}>
  Salvar
  {isPending ? <Loader2 className="size-4 animate-spin ml-2" /> : null}
</Button>
```

### Confirmação de Exclusão

```tsx
if (confirm("Tem certeza que deseja excluir este bloqueio?")) {
  await deleteEmployeeBlockMutate(block.id);
}
```

**Consideração Mobile:** Usar componente de confirmação customizado ao invés de `confirm()` nativo para melhor UX.

## Comportamentos de UX

### 1. Criar Bloqueio Pontual

**Ação:** Usuário clica em "Adicionar Bloqueio Pontual"
**Resultado:**
1. Modal abre
2. Formulário vazio é exibido
3. Campos de DateTime com placeholders

**Fluxo:**
1. Selecionar data de início (calendário)
2. Definir hora de início (input)
3. Selecionar data de fim
4. Definir hora de fim
5. Preencher motivo
6. Clicar em "Salvar"

**Após Salvar:**
- Modal fecha automaticamente
- Lista atualiza com novo bloqueio
- Cache é invalidado

### 2. Criar Bloqueio Recorrente

**Ação:** Usuário clica em "Adicionar Bloqueio Recorrente"
**Resultado:**
1. Modal abre
2. Formulário vazio é exibido

**Fluxo:**
1. Selecionar dia da semana (dropdown)
2. Definir hora de início
3. Definir hora de fim
4. Preencher motivo
5. Clicar em "Salvar"

**Após Salvar:**
- Modal fecha automaticamente
- Lista atualiza com novo bloqueio
- Cache é invalidado

### 3. Excluir Bloqueio

**Ação:** Usuário clica no ícone de lixeira
**Resultado:**
1. Dialog de confirmação aparece
2. Se confirmar: bloqueio é excluído e lista atualiza
3. Se cancelar: nada acontece

### 4. Navegar Entre Tabs

**Ação:** Usuário clica em "Bloqueios Recorrentes"
**Resultado:**
1. URL atualiza para `?type=recurring-blocks`
2. Lista de bloqueios pontuais some
3. Lista de bloqueios recorrentes aparece
4. Botão "Adicionar" muda para bloqueio recorrente

## Formatação de Datas

### Exibição de Bloqueios Pontuais

```typescript
// src/pages/app/employees/$employeeId/-components/blocks.tsx:136
formatDate(block.startsAt, "dd/MM/yyyy HH:mm")
```

**Output:** `"15/01/2025 14:30"`

### Função formatDate

```typescript
// src/lib/utils.ts:165-171
export function formatDate(
  dateInput: string | Date,
  formatString: string,
): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  return format(date, formatString, { locale: ptBR });
}
```

Usa `date-fns` com locale brasileiro.

## Estilos e Layout

### Responsividade

#### Grid de Cards

```tsx
className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
```

- **Mobile (< 768px)**: 1 coluna
- **Tablet (768px - 1024px)**: 2 colunas
- **Desktop (> 1024px)**: 3 colunas

#### Tabs e Botão

```tsx
// src/pages/app/employees/$employeeId/-components/blocks.tsx:66-72
<div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
  <TabsList className="grid grid-cols-2 w-full md:w-auto">
    {/* Tabs */}
  </TabsList>
  <Button className="mt-4 w-full md:ml-4 md:mt-0 md:w-auto">
    {/* Botão Adicionar */}
  </Button>
</div>
```

- **Mobile**: Tabs e botão empilhados verticalmente, full-width
- **Desktop**: Tabs e botão lado a lado

### Componentes UI

- **Card**: Container dos bloqueios (shadcn/ui)
- **Dialog**: Modal de criação (shadcn/ui)
- **Button**: Botões de ação (shadcn/ui)
- **Calendar**: Calendário de seleção de data (shadcn/ui)
- **Popover**: Dropdown do DateTime picker (shadcn/ui)
- **Input**: Inputs de horário (shadcn/ui)
- **Select**: Dropdown de dia da semana (shadcn/ui)
- **Textarea**: Campo de motivo (shadcn/ui)
- **Tabs**: Sistema de tabs (shadcn/ui)

### Ícones (lucide-react)

- `Plus`: Botão de adicionar
- `Trash`: Botão de excluir
- `CalendarIcon`: DateTime picker trigger
- `Clock2Icon`: Indicador de campo de horário
- `Loader2`: Loading spinner
- `ChevronLeft`: Voltar para lista de profissionais

## Fluxo de Dados Completo

### Bloqueios Pontuais

```
1. CARREGAMENTO
   ↓
   GET /employees/:id/blocks
   ↓
   Resposta com dates em UTC (ISO strings)
   ↓
   convertUTCStringToLocal() → new Date()
   ↓
   setState com Date objects em timezone local
   ↓
   Renderiza cards com formatDate()

2. CRIAÇÃO
   ↓
   Usuário abre modal
   ↓
   Preenche DateTime picker (Date objects locais)
   ↓
   Preenche motivo
   ↓
   onSubmit() é chamado
   ↓
   convertLocalDateToUTC() converte Date → ISO string UTC
   ↓
   POST /employees/:id/blocks
   ↓
   Invalidate cache
   ↓
   Modal fecha
   ↓
   Lista recarrega automaticamente

3. EXCLUSÃO
   ↓
   Usuário clica em lixeira
   ↓
   Confirmação aparece
   ↓
   Se confirmar: DELETE /blocks/:id
   ↓
   Invalidate cache
   ↓
   Lista recarrega automaticamente
```

### Bloqueios Recorrentes

```
1. CARREGAMENTO
   ↓
   GET /employees/:id/recurring-blocks
   ↓
   Resposta com times em UTC (strings "HH:mm")
   ↓
   convertUTCToLocalTime() converte cada time
   ↓
   setState com times locais
   ↓
   Renderiza cards

2. CRIAÇÃO
   ↓
   Usuário abre modal
   ↓
   Seleciona dia da semana
   ↓
   Preenche horários (strings "HH:mm" locais)
   ↓
   Preenche motivo
   ↓
   onSubmit() é chamado
   ↓
   convertLocalTimeToUTC() converte times
   ↓
   POST /employees/:id/recurring-blocks
   ↓
   Invalidate cache
   ↓
   Modal fecha
   ↓
   Lista recarrega automaticamente

3. EXCLUSÃO
   ↓
   Usuário clica em lixeira
   ↓
   Confirmação aparece
   ↓
   Se confirmar: DELETE /recurring-blocks/:id
   ↓
   Invalidate cache
   ↓
   Lista recarrega automaticamente
```

## Considerações para Mobile

### 1. DateTime Picker

**Problema:** O componente atual usa Popover + Calendar que pode não funcionar bem em mobile.

**Solução Recomendada:**
- **iOS/Android Nativo**: Usar pickers nativos
- **React Native**: `@react-native-community/datetimepicker`
- **Expo**: `expo-date-time-picker`

**Exemplo:**
```jsx
<DateTimePicker
  value={date}
  mode="datetime"  // ou "date" + "time" separados
  onChange={(event, selectedDate) => {
    setDate(selectedDate);
  }}
/>
```

### 2. Confirmação de Exclusão

**Problema:** `confirm()` nativo tem UX ruim em mobile.

**Solução:** Usar componente de Alert customizado:
```jsx
<Alert
  title="Excluir Bloqueio"
  message="Tem certeza que deseja excluir este bloqueio?"
  buttons={[
    { text: "Cancelar", style: "cancel" },
    { text: "Excluir", style: "destructive", onPress: deleteBlock }
  ]}
/>
```

### 3. Inputs de Horário

Inputs type="time" funcionam bem no mobile:
- **iOS**: Wheel picker nativo
- **Android**: Clock picker nativo

**Manter mesma abordagem.**

### 4. Select de Dia da Semana

**Opções:**
- **React Native Picker**: `@react-native-picker/picker`
- **Bottom Sheet**: Melhor UX em mobile
- **Modal com lista**: Scroll infinito

### 5. Grid de Cards

**Ajustar para mobile:**
```jsx
// Sempre 1 coluna em mobile
<FlatList
  data={blocks}
  renderItem={({ item }) => <BlockCard block={item} />}
  keyExtractor={(item) => item.id}
/>
```

### 6. Tabs

**React Native:**
- **React Navigation**: Tab Navigator
- **react-native-tab-view**: Swipeable tabs
- **Segmented Control**: Estilo iOS

### 7. Modal

**React Native:**
- **Modal**: Componente nativo
- **Bottom Sheet**: `@gorhom/bottom-sheet`
- **React Navigation**: Modal Stack

## Checklist de Implementação Mobile

### Backend/API
- [ ] Endpoints funcionando para todos os métodos
- [ ] Suporte para formato Date ISO strings (pontuais)
- [ ] Suporte para formato "HH:mm" (recorrentes)
- [ ] Dados armazenados em UTC

### Data Layer
- [ ] Função para GET bloqueios pontuais
- [ ] Função para GET bloqueios recorrentes
- [ ] Função para POST bloqueio pontual
- [ ] Função para POST bloqueio recorrente
- [ ] Função para DELETE bloqueio pontual
- [ ] Função para DELETE bloqueio recorrente
- [ ] Cache/estado global (React Query, Redux, Zustand)

### Utilities
- [ ] `convertLocalDateToUTC(date: Date): Date`
- [ ] `convertUTCStringToLocal(utcString: string): string`
- [ ] `convertLocalTimeToUTC(time: string): string`
- [ ] `convertUTCToLocalTime(time: string): string`
- [ ] `formatDate(date: Date, format: string): string`
- [ ] Array de weekdays traduzidos

### UI Components - Listagem
- [ ] `EmployeeBlocks` (componente principal)
- [ ] Sistema de tabs (Pontuais vs Recorrentes)
- [ ] Lista de bloqueios pontuais (FlatList)
- [ ] Lista de bloqueios recorrentes (FlatList)
- [ ] Card de bloqueio pontual
- [ ] Card de bloqueio recorrente
- [ ] Botão de adicionar (condicional por tab)
- [ ] Botão de excluir com confirmação
- [ ] Loading states

### UI Components - Criação
- [ ] Modal/Bottom Sheet de criação
- [ ] Formulário de bloqueio pontual
  - [ ] DateTime Picker (data + hora de início)
  - [ ] DateTime Picker (data + hora de fim)
  - [ ] Input de motivo (TextArea)
  - [ ] Botão de salvar
- [ ] Formulário de bloqueio recorrente
  - [ ] Select de dia da semana (Picker/Bottom Sheet)
  - [ ] Time Picker (hora de início)
  - [ ] Time Picker (hora de fim)
  - [ ] Input de motivo (TextArea)
  - [ ] Botão de salvar

### Lógica
- [ ] Estado para controlar modais
- [ ] Estado para tab ativa
- [ ] Query para bloqueios pontuais
- [ ] Query para bloqueios recorrentes
- [ ] Mutation para criar bloqueio pontual
- [ ] Mutation para criar bloqueio recorrente
- [ ] Mutation para excluir bloqueio pontual
- [ ] Mutation para excluir bloqueio recorrente
- [ ] Conversão UTC ↔ Local em todos os pontos
- [ ] Invalidação de cache após mutations
- [ ] Feedback visual (toast/snackbar)

### UX/Styling
- [ ] Layout responsivo (mobile-first)
- [ ] Estados visuais (loading, empty, error)
- [ ] Confirmação de exclusão customizada
- [ ] Validação de formulário
- [ ] Feedback tátil
- [ ] Acessibilidade
- [ ] Pull-to-refresh nas listas
- [ ] Swipe actions para excluir (opcional)

## Possíveis Melhorias

### 1. Validação de Conflitos

Antes de criar bloqueio, verificar se não conflita com agendamentos existentes:

```typescript
const hasConflict = await checkBlockConflicts({
  employeeId,
  startsAt,
  endsAt,
});

if (hasConflict) {
  toast.error("Este período tem agendamentos existentes!");
  return;
}
```

### 2. Validação de Horários

Garantir que `endsAt` > `startsAt`:

```typescript
if (endsAt <= startsAt) {
  toast.error("Horário de fim deve ser após o início");
  return;
}
```

### 3. Visualização de Agenda

Mostrar bloqueios em uma visualização de calendário:

```tsx
<Calendar
  events={blocks.map(block => ({
    start: block.startsAt,
    end: block.endsAt,
    title: block.reason,
    color: 'red'  // Cor diferente para bloqueios
  }))}
/>
```

### 4. Edição de Bloqueios

Adicionar capacidade de editar bloqueios existentes:

```tsx
<Button onClick={() => openEditModal(block)}>
  <Edit className="h-4 w-4" />
</Button>
```

### 5. Filtros e Busca

Filtrar bloqueios por período ou motivo:

```tsx
<Input
  placeholder="Buscar por motivo..."
  onChange={(e) => setSearchTerm(e.target.value)}
/>
```

### 6. Exportação

Exportar bloqueios para CSV ou iCal:

```tsx
<Button onClick={exportToICalendar}>
  <Download /> Exportar para Calendário
</Button>
```

### 7. Notificações

Notificar profissional sobre bloqueios próximos:

```typescript
// 24h antes do bloqueio
sendNotification({
  title: "Bloqueio Amanhã",
  body: `Você tem bloqueio amanhã: ${block.reason}`,
});
```

### 8. Bloqueios em Lote

Criar múltiplos bloqueios de uma vez (ex: férias de 2 semanas):

```tsx
<DateRangePicker
  startDate={startDate}
  endDate={endDate}
  onChange={createMultipleBlocks}
/>
```

### 9. Templates de Bloqueios

Salvar e reutilizar configurações comuns:

```typescript
const templates = [
  { name: "Almoço", weekday: [1,2,3,4,5], startTime: "12:00", endTime: "13:00" },
  { name: "Aula Inglês", weekday: 3, startTime: "14:00", endTime: "16:00" },
];
```

### 10. Histórico de Bloqueios

Ver bloqueios passados:

```tsx
<Tabs>
  <TabsTrigger value="future">Futuros</TabsTrigger>
  <TabsTrigger value="past">Passados</TabsTrigger>
</Tabs>
```

## Resumo Técnico

### Stack
- **Framework**: React
- **Gerenciamento de Estado**: React useState + TanStack Query
- **Validação**: Zod + React Hook Form
- **UI**: shadcn/ui
- **Ícones**: lucide-react
- **Datas**: date-fns (formato e manipulação)
- **Routing**: TanStack Router (URL state)

### Pontos-Chave
1. **Dois tipos de bloqueios**: Pontuais (datas específicas) e Recorrentes (semanais)
2. **Sub-tabs**: Interface com tabs para alternar entre tipos
3. **DateTime Picker complexo**: Calendar + Time Input integrados
4. **Conversão UTC ↔ Local**: Em ambos os tipos (Date objects e time strings)
5. **CRUD completo**: Criar, Listar e Excluir (sem Editar)
6. **Modais**: Dialog do shadcn/ui para criação
7. **Grid responsivo**: Adapta de 1 a 3 colunas
8. **Cache invalidation**: Automática após mutations

### Complexidade
- **Média**: DateTime Picker com Calendar + Time Input
- **Média**: Dois fluxos paralelos (pontuais vs recorrentes)
- **Baixa**: CRUD básico sem edição
- **Média**: Conversão de timezone para dois formatos diferentes

### Diferenças vs Availability
| Aspecto | Availability | Blocks |
|---------|-------------|---------|
| **Escopo** | Estabelecimento | Profissional |
| **Tipos** | 1 tipo | 2 tipos (pontuais e recorrentes) |
| **UI** | 7 cards fixos | Lista dinâmica + modal |
| **CRUD** | Read + Update | Read + Create + Delete |
| **Data** | Apenas horários | Datas completas + horários |
| **Timezone** | Apenas time strings | Date objects + time strings |

---

**Versão:** 1.0
**Última atualização:** 2025-11-09
