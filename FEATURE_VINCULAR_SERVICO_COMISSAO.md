# Feature: Vincular Serviço e Comissão a Profissional

## Visão Geral

Esta documentação descreve a implementação da funcionalidade de vincular serviços e suas respectivas comissões a profissionais (employees) no sistema. A feature permite que administradores configurem quais serviços cada profissional pode realizar e qual será a comissão recebida por cada serviço.

## Estrutura de Dados

### Service (Serviço)
```typescript
{
  id: string;
  name: string;
  price: string;
  durationInMinutes: string;
  description?: string;
  image?: string;
  active?: boolean;
  categories?: Array<{ id: string; name: string }>;
  categoryIds?: string[];
}
```

### Employee (Profissional)
```typescript
{
  id: string;
  name: string;
  email?: string;
  phone?: string;
  active: boolean;
  address?: string;
  avatarUrl?: string;
  biography?: string;
  services: Array<{
    serviceId: string;
    serviceName: string;
    commission: string; // Porcentagem em formato string
    active: boolean;
  }>;
}
```

### Employee Service (Vinculação)
```typescript
{
  serviceId: string;
  serviceName: string;
  commission: string; // Exemplo: "15" para 15%
  active: boolean;
}
```

## Arquitetura da Implementação

### 1. Camada HTTP (`src/http/employees/`)

**Arquivo:** `update-employee-services.ts`

```typescript
export async function updateEmployeeServices(
  inputs: UpdateEmployeeServicesForm
) {
  await api.post(`/employees/${inputs.employeeId}/services`, {
    ...inputs,
  });
}
```

**Endpoint:** `POST /employees/:employeeId/services`

**Payload:**
```typescript
{
  employeeId: string;
  services: Array<{
    serviceId: string;
    serviceName: string;
    commission: string;
    active: boolean;
  }>;
}
```

### 2. Validações (`src/lib/validations/employees.ts`)

**Schema de Validação:**
```typescript
export const updateEmployeeServicesFormSchema = z.object({
  employeeId: z.string(),
  services: z.array(
    z.object({
      serviceId: z.string(),
      serviceName: z.string(),
      commission: z.string(),
      active: z.boolean(),
    }),
  ),
});
```

### 3. Componente UI (`src/pages/app/employees/$employeeId/-components/update-employee-service.tsx`)

## UI/UX - Detalhamento

### Localização
A funcionalidade está localizada na página de detalhes do profissional, dentro de um sistema de tabs:

**Rota:** `/app/employees/:employeeId`

**Tab:** "Serviços" (segunda tab)

### Layout da Página

```
┌─────────────────────────────────────────────────────────┐
│  ← Voltar                                               │
│  [Geral] [Serviços] [Bloqueios]                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Atualizar serviços do profissional                     │
│  Atualize os serviços que o profissional [Nome] realiza │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ ADICIONAR NOVO SERVIÇO                            │  │
│  │                                                    │  │
│  │ Novo Serviço       Comissão         [Adicionar]  │  │
│  │ [Select ▼      ]  [_____%]                        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ SERVIÇO VINCULADO #1                              │  │
│  │                                                    │  │
│  │ Serviço          Comissão    [✓] Ativo  [Trash]  │  │
│  │ [Corte Cabelo]  [15_____%]                        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ SERVIÇO VINCULADO #2                              │  │
│  │                                                    │  │
│  │ Serviço          Comissão    [✓] Ativo  [Trash]  │  │
│  │ [Barba      ]   [10_____%]                        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  [        Salvar Serviços        ]                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Componentes e Interações

#### 1. Seção "Adicionar Novo Serviço"

**Layout:** Grid responsivo (`grid-cols-1 md:grid-cols-[2fr_1fr_auto]`)

**Elementos:**
- **Select de Serviço:**
  - Componente: `Select` (shadcn/ui)
  - Placeholder: "Selecione um serviço"
  - Lista todos os serviços disponíveis no sistema
  - Desabilitado se não houver serviços

- **Input de Comissão:**
  - Componente: `MaskInput` customizado
  - Máscara: `percentage`
  - Placeholder: "0.00%"
  - Aceita valores numéricos
  - Formatação automática com símbolo %

- **Botão Adicionar:**
  - Variant: `outline`
  - Ação: Adiciona o serviço à lista de vinculações
  - Validações:
    - Verifica se um serviço foi selecionado
    - Limpa os campos após adicionar

**Comportamento:**
```typescript
function handleAddService() {
  const selected = services.find((s) => s.id === newServiceId);
  if (!selected) {
    toast.error("Selecione um serviço válido para adicionar.");
    return;
  }

  append({
    serviceId: selected.id,
    serviceName: selected.name,
    commission: newCommission,
    active: true,
  });

  setNewServiceId("");
  setNewCommission("");
}
```

#### 2. Seção "Serviços Vinculados"

**Layout:** Grid responsivo (`grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto]`)

**Cada item contém:**

1. **Campo de Serviço (Desabilitado):**
   - Componente: `Input`
   - Mostra o nome do serviço
   - Somente leitura (disabled)

2. **Campo de Comissão (Editável):**
   - Componente: `MaskInput`
   - Máscara: `percentage`
   - Permite edição da porcentagem
   - Validação em tempo real
   - Mostra mensagem de erro se inválido

3. **Checkbox "Ativo":**
   - Componente: `Checkbox` (shadcn/ui)
   - Controla se o serviço está ativo para o profissional
   - Label: "Ativo"
   - Alinhamento: horizontal com checkbox à esquerda

4. **Botão Remover:**
   - Variant: `destructive` (vermelho)
   - Ícone: `Trash2` (lucide-react)
   - Ação: Remove o serviço da lista

**Renderização:**
```typescript
{fields.map((field, index) => (
  <div key={field.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-4 items-center border p-4 rounded-md">
    {/* Nome do Serviço */}
    <FormField
      name={`services.${index}.serviceName`}
      render={() => (
        <Input disabled value={field.serviceName} />
      )}
    />

    {/* Comissão */}
    <FormField
      name={`services.${index}.commission`}
      render={({ field: f }) => (
        <MaskInput
          mask="percentage"
          value={f.value}
          onValueChange={(_maskedValue, unmaskedValue) => {
            f.onChange(unmaskedValue);
          }}
        />
      )}
    />

    {/* Checkbox Ativo */}
    <FormField
      name={`services.${index}.active`}
      render={({ field: f }) => (
        <Checkbox
          checked={f.value}
          onCheckedChange={(checked) => f.onChange(checked === true)}
        />
      )}
    />

    {/* Botão Remover */}
    <Button
      type="button"
      variant="destructive"
      onClick={() => remove(index)}
    >
      <Trash2 />
    </Button>
  </div>
))}
```

#### 3. Botão "Salvar Serviços"

**Propriedades:**
- Largura: 100%
- Estado de loading quando salvando
- Desabilitado durante o salvamento
- Ícone de loading: `Loader2` com animação de spin

**Comportamento de Submit:**
```typescript
async function onSubmit(data: Inputs) {
  // Validação de duplicatas
  const serviceIds = data.services.map((s) => s.serviceId);
  const hasDuplicates = serviceIds.length !== new Set(serviceIds).size;

  if (hasDuplicates) {
    toast.warning("Existem serviços duplicados na lista. Remova os duplicados antes de salvar.");
    return;
  }

  await mutateAsync(data);
  toast.success("Serviços atualizados com sucesso!");
}
```

### Padrões de Design Utilizados

#### 1. Sistema de Grid Responsivo
- Desktop: Múltiplas colunas com proporções específicas
- Mobile: Empilhamento vertical (single column)

#### 2. Feedback Visual
- **Toast Notifications:**
  - Erro: Serviço inválido, duplicatas
  - Sucesso: Salvamento concluído
  - Warning: Duplicatas detectadas

- **Estados de Loading:**
  - Spinner no botão de salvar
  - Desabilitação de inputs durante salvamento

- **Validação em Tempo Real:**
  - Campos de comissão validados instantaneamente
  - Mensagens de erro exibidas abaixo dos campos

#### 3. Bordering e Spacing
- Cards com borda (`border p-4 rounded-md`)
- Espaçamento consistente entre elementos (`gap-4`)
- Padding interno nos containers

#### 4. Cores e Variantes
- Botão adicionar: `outline` (neutro)
- Botão remover: `destructive` (vermelho)
- Botão salvar: `default` (azul/primário)

### Estados da UI

#### Estado Inicial
- Select vazio
- Campo de comissão vazio
- Lista de serviços vinculados carregada do backend

#### Durante Adição
- Usuário seleciona serviço
- Usuário digita comissão
- Clica em "Adicionar"
- Item aparece na lista abaixo
- Campos são limpos

#### Durante Edição
- Usuário edita comissão diretamente no item
- Validação em tempo real
- Mudanças são rastreadas pelo formulário

#### Durante Remoção
- Usuário clica no ícone de lixeira
- Item é removido imediatamente da lista
- Sem confirmação (pode ser revertido não salvando)

#### Durante Salvamento
- Botão mostra loading spinner
- Todos os campos desabilitados
- Validação de duplicatas
- Requisição para backend
- Toast de sucesso ou erro

## Fluxo de Dados

### 1. Carregamento Inicial

```typescript
// Carrega dados do profissional
const { data } = useQuery({
  queryKey: ["employee", employeeId],
  queryFn: () => getEmployee(employeeId),
});

// Carrega lista de todos os serviços
const { data: services } = useQuery({
  queryKey: ["services"],
  queryFn: getServices,
});

// Inicializa o formulário com os serviços do profissional
form.defaultValues = {
  employeeId,
  services: employeeServices.map((item) => ({
    serviceId: item.serviceId,
    serviceName: item.serviceName,
    commission: String(item.commission),
    active: item.active,
  })),
};
```

### 2. Adição de Serviço

```
Usuário seleciona serviço
    ↓
Usuário digita comissão
    ↓
Clica em "Adicionar"
    ↓
Validação: serviço selecionado?
    ↓
useFieldArray.append()
    ↓
Item adicionado à lista
    ↓
Campos limpos
```

### 3. Edição de Comissão

```
Usuário edita campo
    ↓
MaskInput formata valor
    ↓
onChange atualiza formulário
    ↓
Validação em tempo real
    ↓
Estado do formulário atualizado
```

### 4. Salvamento

```
Usuário clica em "Salvar"
    ↓
onSubmit disparado
    ↓
Validação de duplicatas
    ↓
mutateAsync(data)
    ↓
POST /employees/:id/services
    ↓
Backend processa
    ↓
Toast de sucesso
    ↓
Query invalidada (opcional)
```

## Validações Implementadas

### Client-Side

1. **Serviço Válido:**
   - Verifica se um serviço foi selecionado antes de adicionar

2. **Duplicatas:**
   - Verifica se há serviços duplicados antes de salvar
   - Usa Set para detecção eficiente

3. **Formato de Comissão:**
   - Validação de string não vazia
   - Máscara garante formato correto

4. **Estado Ativo:**
   - Booleano validado pelo schema Zod

### Schema Zod

```typescript
updateEmployeeServicesFormSchema = z.object({
  employeeId: z.string(),
  services: z.array(
    z.object({
      serviceId: z.string(),
      serviceName: z.string(),
      commission: z.string(),
      active: z.boolean(),
    }),
  ),
});
```

## Integração com Relatórios

A feature se integra com o sistema de relatórios através de:

### 1. Comissão por Funcionário

**Endpoint:** `GET /establishments/employee-commission`

**Componente:** `EmployeeCommissionChart`

**Arquivo:** `src/components/employee-commission-chart.tsx`

**Dados retornados:**
```typescript
{
  items: Array<{
    employee: string;
    revenueInCents: number;
  }>;
}
```

**Visualização:**
- Gráfico de barras horizontal
- Mostra receita gerada por cada funcionário
- Baseado nas comissões configuradas

### 2. Serviços mais Rentáveis

**Arquivo:** `src/components/top-services-chart.tsx`

**Relação:**
- Mostra quais serviços geram mais receita
- Indireamente relacionado às comissões dos profissionais
- Usado para análise de performance

## Tecnologias e Bibliotecas

### UI Components
- **shadcn/ui:** Biblioteca de componentes base
  - Button, Card, Input, Select, Checkbox
  - Form, FormField, FormControl, FormItem, FormLabel
  - Tabs, TabsList, TabsTrigger, TabsContent

### Formulários
- **react-hook-form:** Gerenciamento de estado do formulário
- **useFieldArray:** Gerenciamento de array dinâmico de serviços
- **@hookform/resolvers/zod:** Integração com validação Zod

### Validação
- **Zod:** Schema validation

### State Management
- **@tanstack/react-query:** Gerenciamento de estado assíncrono
  - Queries para carregamento de dados
  - Mutations para atualizações

### Routing
- **@tanstack/react-router:** Sistema de rotas
  - File-based routing
  - Query state management (nuqs)

### UI/UX
- **lucide-react:** Ícones (Trash2, Loader2, ChevronLeft)
- **sonner:** Sistema de toast notifications
- **MaskInput:** Input customizado com máscaras

## Responsividade

### Breakpoints

#### Mobile (< 768px)
- Grid de 1 coluna
- Elementos empilhados verticalmente
- Inputs com largura total
- Botões com largura total

#### Desktop (>= 768px)
- **Seção de Adicionar:** `grid-cols-[2fr_1fr_auto]`
  - 2 partes: Select de serviço
  - 1 parte: Comissão
  - Auto: Botão adicionar

- **Seção de Itens:** `grid-cols-[2fr_1fr_1fr_auto]`
  - 2 partes: Nome do serviço
  - 1 parte: Comissão
  - 1 parte: Checkbox ativo
  - Auto: Botão remover

## Acessibilidade

### Labels
- Todos os campos possuem labels apropriados
- FormLabel associado aos inputs via FormField

### Estados
- Campos desabilitados claramente indicados
- Estados de erro mostrados com mensagens descritivas

### Navegação
- Foco do teclado funciona em todos os elementos
- Tab order lógico

### Feedback
- Mensagens de erro específicas
- Toast notifications para ações importantes
- Loading states claros

## Melhorias Futuras Sugeridas

### UX
1. **Confirmação de Remoção:**
   - Adicionar dialog de confirmação ao remover serviço
   - Evitar remoções acidentais

2. **Preview de Mudanças:**
   - Mostrar diferenças antes de salvar
   - Indicar campos modificados

3. **Busca/Filtro:**
   - Adicionar busca no select de serviços
   - Filtrar serviços já vinculados

4. **Drag and Drop:**
   - Permitir reordenação dos serviços
   - Priorização visual

### Validações
1. **Comissão:**
   - Validar range (0-100%)
   - Alertar sobre comissões muito altas/baixas

2. **Conflitos:**
   - Detectar conflitos com outros profissionais
   - Sugerir comissões baseadas em médias

### Performance
1. **Otimistic Updates:**
   - Atualizar UI antes da resposta do servidor
   - Reverter em caso de erro

2. **Debounce:**
   - Aplicar debounce na edição de comissão
   - Reduzir re-renders

### Relatórios
1. **Dashboard do Profissional:**
   - Mostrar performance por serviço
   - Comparar comissões entre períodos

2. **Histórico:**
   - Rastrear mudanças de comissão
   - Audit log de alterações

## Referências de Código

### Principais Arquivos

```
src/
├── http/
│   └── employees/
│       └── update-employee-services.ts (L1-L10)
├── lib/
│   └── validations/
│       └── employees.ts (L42-L62)
├── pages/
│   └── app/
│       └── employees/
│           └── $employeeId/
│               ├── index.tsx (L14-L110)
│               └── -components/
│                   └── update-employee-service.tsx (L1-L237)
└── components/
    └── employee-commission-chart.tsx (L1-L140)
```

### Endpoints Relacionados

```
POST   /employees/:employeeId/services          # Atualizar serviços
GET    /employees/:employeeId                   # Obter dados do profissional
GET    /services                                # Listar todos os serviços
GET    /establishments/employee-commission      # Relatório de comissões
```

## Conclusão

A feature de vincular serviços e comissões a profissionais é implementada com:
- UI intuitiva e responsiva
- Validações robustas client-side
- Feedback claro para o usuário
- Integração com sistema de relatórios
- Padrões de código consistentes com o projeto

A implementação utiliza as melhores práticas do ecossistema React moderno e fornece uma experiência de usuário fluida e eficiente para gerenciar as configurações de serviços e comissões dos profissionais.
