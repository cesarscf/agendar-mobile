# Formulário de Edição de Programa de Fidelidade

## Visão Geral

O formulário de edição permite atualizar programas de fidelidade existentes, gerenciar seu status (ativo/inativo) e excluir permanentemente programas. O formulário está localizado em `/app/loyalty-programs/$programId/` e oferece funcionalidades completas de CRUD com feedback visual via toast notifications.

## Arquitetura

### Arquivos Principais

- **Página Principal**: `src/pages/app/loyalty-programs/$programId/index.tsx`
- **Componente de Edição**: `src/pages/app/loyalty-programs/$programId/-components/update-loyalty-program.tsx`
- **Validação**: `src/lib/validations/loyalty-program.ts`
- **APIs**:
  - `src/http/loyalty/get-loyalty-program.ts` - Buscar programa
  - `src/http/loyalty/update-loyalty-program.ts` - Atualizar programa
  - `src/http/loyalty/activate-loyalty-program.ts` - Ativar programa
  - `src/http/loyalty/desactive-loyalty-program.ts` - Desativar programa
  - `src/http/loyalty/delete-loyalty-program.ts` - Excluir programa

## Estrutura do Formulário

### 1. Campos de Edição

#### Serviço de Recompensa (`serviceRewardId`)
- **Tipo**: Select (dropdown)
- **Obrigatório**: Sim
- **Validação**: UUID obrigatório
- **Descrição**: Define qual serviço será oferecido como recompensa
- **Fonte de dados**: Lista de serviços obtida via `getServices()`
- **Pré-preenchido**: Com o valor atual do programa

#### Nome (`name`)
- **Tipo**: Input de texto
- **Obrigatório**: Sim
- **Validação**: String com mínimo de 1 caractere
- **Descrição**: Nome identificador do programa
- **Placeholder**: "Digite aqui o nome do pacote"
- **Pré-preenchido**: Com o valor atual do programa

#### Status do Programa (`active`)
- **Tipo**: Switch (toggle)
- **Estados**: Ativo / Inativo
- **Descrição Visual**:
  - Ativo: "Programa ativo e disponível para clientes"
  - Inativo: "Programa desativado"
- **Ação**: Atualização independente via API separada
- **Feedback**: Toast notification de sucesso/erro

#### Pontos Necessários (`requiredPoints`)
- **Tipo**: Input numérico
- **Obrigatório**: Sim
- **Validação**: Número >= 1
- **Placeholder**: "Ex: 100"
- **Pré-preenchido**: Com o valor atual do programa

### 2. Regras Dinâmicas (`rules`)

Sistema idêntico ao formulário de criação, mas com valores pré-carregados do programa existente.

#### Estrutura de uma Regra

```typescript
{
  serviceId: string,    // UUID do serviço
  points: number,       // Pontos ganhos (min: 1)
  serviceName: string   // Nome do serviço (opcional, usado para pré-visualização)
}
```

#### Funcionalidades

- **Adicionar Regra**: Botão "Adicionar regra" com ícone Plus
  - Valores padrão ao adicionar: `{ points: 1, serviceId: "", serviceName: "Nome do serviço" }`
- **Remover Regra**: Botão deletar em cada regra
- **Validação**: Mínimo de 1 regra obrigatória
- **Pré-carregamento**: Todas as regras existentes são carregadas automaticamente

## Operações Disponíveis

### 1. Atualizar Programa

**Função**: `updateLoyaltyProgram()`

#### Endpoint
```typescript
PUT /loyalty-programs/:id
```

#### Payload
```typescript
{
  id: string,
  serviceRewardId: string,
  name: string,
  requiredPoints: number,
  rules: [
    {
      serviceId: string,
      points: number,
      serviceName?: string
    }
  ]
}
```

#### Fluxo de Submissão
```typescript
async function onSubmit(values: Inputs) {
  setIsLoading(true);

  await mutateAsync(values);

  // Invalida caches específicos e lista geral
  queryClient.invalidateQueries({ queryKey: ["loyalty-program", program.id] });
  queryClient.invalidateQueries({ queryKey: ["loyalty-programs"] });

  toast.success("Programa de fidelidade atualizado com sucesso!");

  setIsLoading(false);
}
```

#### Tratamento de Erros
- Exibe toast de erro com mensagem da API
- Mantém usuário na página para correção
- Estado de loading reseta automaticamente

### 2. Ativar/Desativar Programa

**Toggle independente** que não requer salvar o formulário.

#### Endpoints
```typescript
// Ativar
DELETE /loyalty-programs/:id

// Desativar
DELETE /loyalty-programs/:id
```

*Nota: Ambas as funções usam DELETE no código atual, o que pode ser um comportamento específico do backend.*

#### Implementação
```typescript
const toggleActivationMutation = useMutation({
  mutationFn: async (active: boolean) => {
    if (active) {
      await activateLoyaltyProgram(program.id);
    } else {
      await desactiveLoyaltyProgram(program.id);
    }
  },
  onSuccess: (_, active) => {
    setIsActive(active);
    queryClient.invalidateQueries({ queryKey: ["loyalty-program", program.id] });
    queryClient.invalidateQueries({ queryKey: ["loyalty-programs"] });
    toast.success(
      active
        ? "Programa de fidelidade ativado com sucesso!"
        : "Programa de fidelidade desativado com sucesso!"
    );
  },
  onError: (error) => {
    toast.error(error.message || "Erro ao alterar status do programa");
  },
});
```

#### Características
- **Ação imediata**: Não precisa clicar em "Salvar"
- **Estado local**: Atualizado via `setIsActive()`
- **Feedback visual**: Toast de sucesso/erro
- **Disabled durante loading**: Switch desabilitado enquanto processa
- **Sincronização**: Invalida queries para atualizar dados

### 3. Excluir Programa

**Exclusão permanente** com confirmação obrigatória.

#### Endpoint
```typescript
DELETE /loyalty-programs/:id/permanent
```

#### Implementação
```typescript
onClick={async () => {
  if (
    confirm(
      "Tem certeza que deseja excluir este programa de fidelidade? Todos os dados relacionados serão excluídos."
    )
  ) {
    await deleteLoyaltyProgramMutate(program.id);

    queryClient.invalidateQueries({ queryKey: ["loyalty-programs"] });

    navigate({ to: "/app/loyalty-programs" });
  }
}}
```

#### Características
- **Confirmação obrigatória**: Dialog nativo do navegador
- **Alerta claro**: Informa sobre exclusão de dados relacionados
- **Redirecionamento**: Após exclusão, redireciona para lista
- **Estado de loading**: Botão mostra loader durante processo
- **Invalidação de cache**: Atualiza lista após exclusão

## Schema de Validação (Zod)

```typescript
updateLoyaltyProgramSchema = {
  id: string,
  name: string (min 1),
  serviceRewardId: string (min 1),
  requiredPoints: number (min 1),
  rules: array (min 1) [
    {
      serviceId: string (min 1),
      points: number (min 1),
      serviceName: string (opcional)
    }
  ]
}
```

### Mensagens de Erro

Idênticas ao formulário de criação:
- `serviceRewardId`: "Selecione um serviço de recompensa"
- `name`: "O nome é obrigatório"
- `requiredPoints`: "Os pontos necessários devem ser pelo menos 1"
- `rules`: "Adicione pelo menos uma regra"
- `rules.serviceId`: "Selecione um serviço"
- `rules.points`: "Os pontos devem ser pelo menos 1"

## Carregamento de Dados

### Busca do Programa

```typescript
const { data, isLoading } = useQuery({
  queryKey: ["loyalty-program", programId],
  queryFn: () => getLoyaltyProgram(programId),
});
```

**Endpoint**: `GET /loyalty-programs/:id`

### Busca de Serviços

```typescript
const { data: services } = useQuery({
  queryKey: ["services"],
  queryFn: getServices,
});
```

### Estados de Loading

1. **Carregamento inicial**: Exibe `null` enquanto busca o programa
2. **Programa não encontrado**: Exibe mensagem "Programa não encontrado."
3. **Dados carregados**: Renderiza componente `UpdateLoyaltyProgram`

### Pré-preenchimento do Formulário

```typescript
defaultValues: {
  id: program.id,
  name: program.name,
  requiredPoints: program.requiredPoints,
  serviceRewardId: program.serviceRewardId,
  rules: program.rules.map((it) => ({
    points: it.points,
    serviceId: it.serviceId,
    serviceName: it.serviceName,
  })),
}
```

## Gerenciamento de Estado

### Estados Locais

```typescript
const [isLoading, setIsLoading] = React.useState(false);
const [isActive, setIsActive] = React.useState(program.active);
```

### Múltiplas Mutations

1. **Update Mutation**: Atualizar dados do programa
2. **Toggle Mutation**: Ativar/desativar programa
3. **Delete Mutation**: Excluir programa permanentemente

### Invalidação de Cache

Após cada operação, o sistema invalida queries específicas:

```typescript
// Atualização
queryClient.invalidateQueries({ queryKey: ["loyalty-program", program.id] });
queryClient.invalidateQueries({ queryKey: ["loyalty-programs"] });

// Ativação/Desativação
queryClient.invalidateQueries({ queryKey: ["loyalty-program", program.id] });
queryClient.invalidateQueries({ queryKey: ["loyalty-programs"] });

// Exclusão (apenas lista)
queryClient.invalidateQueries({ queryKey: ["loyalty-programs"] });
```

## UI/UX

### Layout
- Container com padding: `p-6`
- Formulário com largura máxima: `max-w-lg`
- Espaçamento entre campos: `space-y-8`
- Espaçamento entre regras: `space-y-4`

### Navegação
- Botão de voltar (ícone ChevronLeft) para `/app/loyalty-programs`
- Redirecionamento automático após exclusão

### Seção de Status
Layout especial para toggle de ativação:
```tsx
<div className="flex items-center justify-between">
  <div className="space-y-1">
    <FormLabel>Status do Programa</FormLabel>
    <p className="text-sm text-muted-foreground">
      {isActive ? "Programa ativo e disponível para clientes" : "Programa desativado"}
    </p>
  </div>
  <div className="flex items-center gap-3">
    <span className="text-sm text-muted-foreground">
      {isActive ? "Ativo" : "Inativo"}
    </span>
    <Switch />
  </div>
</div>
```

### Botões de Ação

Dois botões lado a lado no final do formulário:

1. **Salvar**
   - Tipo: Submit
   - Variante: Default
   - Loading: Loader2 animado
   - Desabilitado: Durante `isPending` ou `isLoading`

2. **Excluir**
   - Tipo: Button
   - Variante: Destructive (vermelho)
   - Loading: Loader2 animado
   - Desabilitado: Durante `deleteIsPending` ou `isLoading`
   - Confirmação: Dialog nativo

### Toast Notifications

Feedback visual para todas as operações:

- **Atualização**: "Programa de fidelidade atualizado com sucesso!"
- **Ativação**: "Programa de fidelidade ativado com sucesso!"
- **Desativação**: "Programa de fidelidade desativado com sucesso!"
- **Erros**: Mensagem específica da API ou genérica

## Diferenças em Relação ao Formulário de Criação

| Aspecto | Criação | Edição |
|---------|---------|--------|
| **Dados iniciais** | Campos vazios | Pré-preenchidos com dados do programa |
| **Validação** | `createLoyaltyProgramSchema` | `updateLoyaltyProgramSchema` |
| **Campo ID** | Não existe | Obrigatório no schema |
| **Status toggle** | Não existe | Switch ativo/inativo independente |
| **Botão excluir** | Não existe | Botão destrutivo com confirmação |
| **Redirecionamento** | Após criar | Após excluir (não após atualizar) |
| **Feedback** | Silencioso | Toast notifications |
| **Mutations** | 1 (criar) | 3 (atualizar, toggle, excluir) |
| **Título** | "Adicionar programa" | "Atualizar programa" |
| **Descrição** | "Cadastre um novo..." | "Atualize o programa..." |

## Fluxo Completo de Uso

### Edição Normal

1. Usuário acessa `/app/loyalty-programs/:id`
2. Sistema busca dados do programa e serviços
3. Formulário é pré-preenchido automaticamente
4. Usuário modifica campos desejados
5. Clica em "Salvar"
6. Sistema valida, atualiza via API
7. Toast de sucesso aparece
8. Dados são atualizados no cache
9. Usuário permanece na página (não redireciona)

### Alteração de Status

1. Usuário clica no Switch de status
2. Sistema chama API específica (activate/desactivate)
3. Estado local é atualizado imediatamente
4. Toast de sucesso/erro aparece
5. Cache é invalidado
6. Formulário principal não é afetado

### Exclusão

1. Usuário clica em "Excluir"
2. Dialog de confirmação aparece
3. Se confirmar:
   - Sistema chama API de exclusão permanente
   - Botão mostra loading
   - Cache da lista é invalidado
   - Redireciona para `/app/loyalty-programs`
4. Se cancelar: Nada acontece

## Tratamento de Erros

### Erro na Atualização
```typescript
onError: (error) => {
  setIsLoading(false);
  toast.error(error.message || "Erro ao atualizar programa de fidelidade");
}
```

### Erro no Toggle
```typescript
onError: (error) => {
  toast.error(error.message || "Erro ao alterar status do programa");
}
```

### Programa Não Encontrado
```tsx
if (!data) {
  return (
    <div className="p-6 text-center text-muted-foreground">
      Programa não encontrado.
    </div>
  );
}
```

## Tecnologias Utilizadas

- **React Hook Form**: Gerenciamento de formulário
- **Zod**: Validação de schema
- **TanStack Query**: Gerenciamento de estado assíncrono e cache
- **TanStack Router**: Navegação e parâmetros de rota
- **Sonner**: Toast notifications
- **shadcn/ui**: Componentes de UI (Form, Input, Select, Switch, Button)
- **Lucide React**: Ícones

## Arquitetura de Componentes

```
/app/loyalty-programs/$programId/
├── index.tsx (Página principal)
│   ├── Busca dados do programa
│   ├── Busca lista de serviços
│   ├── Trata loading states
│   └── Renderiza UpdateLoyaltyProgram
│
└── -components/
    └── update-loyalty-program.tsx (Componente do formulário)
        ├── Gerencia formulário (React Hook Form)
        ├── Gerencia mutations (update, toggle, delete)
        ├── Controla estados locais
        └── Renderiza UI completa
```

## Props do Componente

```typescript
{
  program: LoyaltyProgram,  // Dados do programa a ser editado
  services: Service[]        // Lista de serviços disponíveis
}
```
