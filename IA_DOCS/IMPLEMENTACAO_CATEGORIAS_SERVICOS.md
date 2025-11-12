# Documentação: Vinculação de Categorias aos Serviços

## Visão Geral

Este documento descreve a implementação completa do sistema de vinculação de categorias aos serviços na aplicação web, fornecendo todas as informações necessárias para replicar a funcionalidade no aplicativo mobile React Native.

## Índice

1. [Estrutura de Dados](#estrutura-de-dados)
2. [Endpoints da API](#endpoints-da-api)
3. [Fluxo de Implementação](#fluxo-de-implementação)
4. [Componentes e UI](#componentes-e-ui)
5. [Guia de Implementação Mobile](#guia-de-implementação-mobile)

---

## Estrutura de Dados

### Schema de Serviço

**Arquivo**: `src/lib/validations/service.ts`

```typescript
{
  id: string,
  name: string,
  price: string,
  active: boolean,
  durationInMinutes: string,
  description?: string,
  image?: string,
  categories?: Array<{
    id: string,
    name: string
  }>,
  categoryIds?: string[]
}
```

### Propriedades Importantes

- **`categories`**: Array de objetos de categoria completos (usado para leitura/exibição)
- **`categoryIds`**: Array de IDs de categorias (usado para criar/atualizar vinculações)

### Schema de Categoria

**Arquivo**: `src/lib/validations/category.ts`

```typescript
{
  id: string,
  name: string
}
```

### Schemas de Requisição

**Criar Serviço**:
```typescript
{
  name: string,
  price: string,
  durationInMinutes: string,
  description?: string,
  image?: string,
  active?: boolean,
  categoryIds?: string[]  // Array de IDs para vincular
}
```

**Atualizar Serviço**:
```typescript
{
  id: string,
  name?: string,
  price?: string,
  durationInMinutes?: string,
  description?: string,
  image?: string,
  active?: boolean,
  categoryIds?: string[]  // Array de IDs para vincular
}
```

---

## Endpoints da API

### Serviços

#### Criar Serviço
```http
POST /services
Content-Type: application/json

{
  "name": "Corte de Cabelo",
  "price": 5000,  // Em centavos (R$ 50,00)
  "durationInMinutes": 40,
  "description": "Corte masculino",
  "active": true,
  "categoryIds": ["cat-id-1", "cat-id-2"]  // IDs das categorias
}
```

#### Atualizar Serviço
```http
PUT /services/{id}
Content-Type: application/json

{
  "name": "Corte de Cabelo Premium",
  "categoryIds": ["cat-id-1", "cat-id-3"]  // Substitui as categorias existentes
}
```

#### Obter Serviço
```http
GET /services/{id}

Resposta:
{
  "id": "service-id",
  "name": "Corte de Cabelo",
  "price": "5000",
  "durationInMinutes": "40",
  "categories": [
    {
      "id": "cat-id-1",
      "name": "Cabelo"
    },
    {
      "id": "cat-id-2",
      "name": "Premium"
    }
  ]
}
```

#### Listar Serviços
```http
GET /services

Resposta:
[
  {
    "id": "service-id",
    "name": "Corte de Cabelo",
    "categories": [...]
  }
]
```

### Categorias

#### Listar Categorias
```http
GET /categories

Resposta:
[
  {
    "id": "cat-id-1",
    "name": "Cabelo"
  },
  {
    "id": "cat-id-2",
    "name": "Barba"
  }
]
```

#### Criar Categoria
```http
POST /categories
Content-Type: application/json

{
  "name": "Nova Categoria"
}
```

#### Atualizar Categoria
```http
PUT /categories/{id}
Content-Type: application/json

{
  "name": "Categoria Atualizada"
}
```

#### Deletar Categoria
```http
DELETE /categories/{id}
```

---

## Fluxo de Implementação

### 1. Criar Serviço com Categorias

**Arquivo**: `src/pages/app/services/new/index.tsx`

#### Passo a Passo:

1. **Carregar categorias disponíveis**
   - Fazer requisição GET `/categories`
   - Armazenar em estado local

2. **Gerenciar seleção de categorias**
   ```typescript
   const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
   ```

3. **Interface de seleção**
   - Dropdown/Select com categorias disponíveis
   - Filtrar categorias já selecionadas do dropdown
   - Exibir categorias selecionadas como badges/chips
   - Permitir remoção de categorias selecionadas

4. **Submissão do formulário**
   ```typescript
   const payload = {
     name: "Corte de Cabelo",
     price: "5000",
     durationInMinutes: "40",
     categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined
   };

   // POST /services
   await createService(payload);
   ```

### 2. Atualizar Serviço com Categorias

**Arquivo**: `src/pages/app/services/$serviceId/-components/update-service-form.tsx`

#### Passo a Passo:

1. **Carregar serviço existente**
   - Fazer requisição GET `/services/{id}`
   - O serviço virá com o campo `categories` populado

2. **Inicializar categorias selecionadas**
   ```typescript
   const [selectedCategories, setSelectedCategories] = useState<string[]>(
     service.categories?.map(cat => cat.id) || []
   );
   ```

3. **Interface de edição**
   - Mesma UI do formulário de criação
   - Pré-popular com categorias atuais do serviço

4. **Submissão do formulário**
   ```typescript
   const payload = {
     id: serviceId,
     categoryIds: selectedCategories.length > 0 ? selectedCategories : undefined
   };

   // PUT /services/{id}
   await updateService(payload);
   ```

### 3. Exibir Serviços com Categorias

Ao listar ou exibir detalhes de um serviço, o campo `categories` virá populado automaticamente:

```typescript
// Resposta da API
{
  id: "service-id",
  name: "Corte de Cabelo",
  categories: [
    { id: "cat-1", name: "Cabelo" },
    { id: "cat-2", name: "Premium" }
  ]
}

// Renderização
service.categories?.map(category => (
  <Badge key={category.id}>{category.name}</Badge>
))
```

---

## Componentes e UI

### Seletor de Categorias

**Localização**: `src/pages/app/services/new/index.tsx` (linhas 134-190)

#### Estrutura do Componente:

```jsx
// Estado
const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

// Query para buscar categorias
const { data: categories = [] } = useQuery({
  queryKey: ["categories"],
  queryFn: getCategories,
});

// UI
<FormItem>
  <FormLabel>Categorias</FormLabel>
  <FormControl>
    {/* Dropdown de Seleção */}
    <Select
      value={selectedCategories[0] || ""}
      onValueChange={(value) => {
        if (value && !selectedCategories.includes(value)) {
          setSelectedCategories([...selectedCategories, value]);
        }
      }}
    >
      <SelectTrigger>
        <SelectValue placeholder="Selecione uma categoria" />
      </SelectTrigger>
      <SelectContent>
        {categories
          .filter(category => !selectedCategories.includes(category.id))
          .map(category => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))
        }
      </SelectContent>
    </Select>
  </FormControl>

  {/* Badges das Categorias Selecionadas */}
  {selectedCategories.length > 0 && (
    <div className="flex flex-wrap gap-2 mt-2">
      {selectedCategories.map(categoryId => {
        const category = categories.find(c => c.id === categoryId);
        return (
          <div
            key={categoryId}
            className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center gap-1"
          >
            {category?.name}
            <button
              type="button"
              onClick={() => {
                setSelectedCategories(
                  selectedCategories.filter(id => id !== categoryId)
                );
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  )}
</FormItem>
```

### Características da UI:

1. **Dropdown reutilizável**: Sempre mostra apenas categorias não selecionadas
2. **Multi-seleção**: Permite adicionar múltiplas categorias
3. **Visual feedback**: Badges mostram categorias selecionadas
4. **Remoção fácil**: Botão "×" em cada badge para remover
5. **Estado local**: `selectedCategories` mantém apenas IDs

---

## Guia de Implementação Mobile

### Stack Sugerida (React Native)

- **State Management**: `useState` ou Zustand
- **API Client**: Axios ou Fetch
- **Forms**: React Hook Form (opcional)
- **UI Components**: React Native Paper, NativeBase, ou custom

### 1. Criar Tipos TypeScript

```typescript
// types/service.ts
export interface Category {
  id: string;
  name: string;
}

export interface Service {
  id: string;
  name: string;
  price: string;
  durationInMinutes: string;
  description?: string;
  image?: string;
  active?: boolean;
  categories?: Category[];
  categoryIds?: string[];
}

export interface CreateServiceRequest {
  name: string;
  price: string;
  durationInMinutes: string;
  description?: string;
  image?: string;
  active?: boolean;
  categoryIds?: string[];
}

export interface UpdateServiceRequest {
  id: string;
  name?: string;
  price?: string;
  durationInMinutes?: string;
  description?: string;
  image?: string;
  active?: boolean;
  categoryIds?: string[];
}
```

### 2. Criar Serviços de API

```typescript
// services/api/categories.ts
import axios from 'axios';
import { Category } from '@/types/service';

const API_BASE_URL = 'https://your-api.com';

export const categoryService = {
  getAll: async (): Promise<Category[]> => {
    const response = await axios.get(`${API_BASE_URL}/categories`);
    return response.data;
  },

  create: async (name: string): Promise<Category> => {
    const response = await axios.post(`${API_BASE_URL}/categories`, { name });
    return response.data;
  },

  update: async (id: string, name: string): Promise<Category> => {
    const response = await axios.put(`${API_BASE_URL}/categories/${id}`, { name });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/categories/${id}`);
  },
};
```

```typescript
// services/api/services.ts
import axios from 'axios';
import { Service, CreateServiceRequest, UpdateServiceRequest } from '@/types/service';

const API_BASE_URL = 'https://your-api.com';

export const serviceService = {
  getAll: async (): Promise<Service[]> => {
    const response = await axios.get(`${API_BASE_URL}/services`);
    return response.data;
  },

  getById: async (id: string): Promise<Service> => {
    const response = await axios.get(`${API_BASE_URL}/services/${id}`);
    return response.data;
  },

  create: async (data: CreateServiceRequest): Promise<Service> => {
    // Converter valores antes de enviar
    const payload = {
      ...data,
      price: parseInt(data.price), // Converter para centavos se necessário
      durationInMinutes: parseInt(data.durationInMinutes),
    };

    const response = await axios.post(`${API_BASE_URL}/services`, payload);
    return response.data;
  },

  update: async (data: UpdateServiceRequest): Promise<Service> => {
    const { id, ...updateData } = data;

    const payload = {
      ...updateData,
      price: updateData.price ? parseInt(updateData.price) : undefined,
      durationInMinutes: updateData.durationInMinutes
        ? parseInt(updateData.durationInMinutes)
        : undefined,
    };

    const response = await axios.put(`${API_BASE_URL}/services/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/services/${id}`);
  },
};
```

### 3. Componente de Seleção de Categorias

```typescript
// components/CategorySelector.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // ou outra lib de select
import { Category } from '@/types/service';
import { categoryService } from '@/services/api/categories';

interface CategorySelectorProps {
  selectedCategoryIds: string[];
  onSelectionChange: (categoryIds: string[]) => void;
}

export function CategorySelector({
  selectedCategoryIds,
  onSelectionChange
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedValue, setSelectedValue] = useState<string>('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleSelectCategory = (categoryId: string) => {
    if (categoryId && !selectedCategoryIds.includes(categoryId)) {
      onSelectionChange([...selectedCategoryIds, categoryId]);
      setSelectedValue(''); // Resetar o picker
    }
  };

  const handleRemoveCategory = (categoryId: string) => {
    onSelectionChange(selectedCategoryIds.filter(id => id !== categoryId));
  };

  const availableCategories = categories.filter(
    cat => !selectedCategoryIds.includes(cat.id)
  );

  const selectedCategories = selectedCategoryIds
    .map(id => categories.find(cat => cat.id === id))
    .filter(Boolean) as Category[];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Categorias</Text>

      {/* Picker/Dropdown */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={handleSelectCategory}
          style={styles.picker}
        >
          <Picker.Item label="Selecione uma categoria" value="" />
          {availableCategories.map(category => (
            <Picker.Item
              key={category.id}
              label={category.name}
              value={category.id}
            />
          ))}
        </Picker>
      </View>

      {/* Badges das Categorias Selecionadas */}
      {selectedCategories.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.badgesContainer}
        >
          {selectedCategories.map(category => (
            <View key={category.id} style={styles.badge}>
              <Text style={styles.badgeText}>{category.name}</Text>
              <TouchableOpacity
                onPress={() => handleRemoveCategory(category.id)}
                style={styles.removeButton}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  badgesContainer: {
    marginTop: 12,
    flexDirection: 'row',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 14,
    color: '#374151',
    marginRight: 4,
  },
  removeButton: {
    marginLeft: 4,
  },
  removeButtonText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: 'bold',
  },
});
```

### 4. Tela de Criar Serviço

```typescript
// screens/CreateService.tsx
import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, ScrollView, Alert } from 'react-native';
import { CategorySelector } from '@/components/CategorySelector';
import { serviceService } from '@/services/api/services';
import { CreateServiceRequest } from '@/types/service';

export function CreateServiceScreen({ navigation }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Validação básica
    if (!name || !price || !duration) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);

    try {
      const payload: CreateServiceRequest = {
        name,
        price,
        durationInMinutes: duration,
        description: description || undefined,
        active: true,
        categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
      };

      await serviceService.create(payload);

      Alert.alert('Sucesso', 'Serviço criado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      Alert.alert('Erro', 'Não foi possível criar o serviço');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nome do serviço"
          value={name}
          onChangeText={setName}
        />

        <CategorySelector
          selectedCategoryIds={selectedCategoryIds}
          onSelectionChange={setSelectedCategoryIds}
        />

        <TextInput
          style={styles.input}
          placeholder="Preço (em centavos)"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Duração (em minutos)"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descrição"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Button
          title={loading ? "Salvando..." : "Salvar Serviço"}
          onPress={handleSubmit}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});
```

### 5. Tela de Editar Serviço

```typescript
// screens/EditService.tsx
import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { CategorySelector } from '@/components/CategorySelector';
import { serviceService } from '@/services/api/services';
import { Service, UpdateServiceRequest } from '@/types/service';

export function EditServiceScreen({ route, navigation }) {
  const { serviceId } = route.params;

  const [service, setService] = useState<Service | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    loadService();
  }, [serviceId]);

  const loadService = async () => {
    try {
      const data = await serviceService.getById(serviceId);
      setService(data);

      // Pré-popular campos
      setName(data.name);
      setPrice(data.price);
      setDuration(data.durationInMinutes);
      setDescription(data.description || '');

      // Pré-popular categorias selecionadas
      if (data.categories) {
        setSelectedCategoryIds(data.categories.map(cat => cat.id));
      }
    } catch (error) {
      console.error('Erro ao carregar serviço:', error);
      Alert.alert('Erro', 'Não foi possível carregar o serviço');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name || !price || !duration) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);

    try {
      const payload: UpdateServiceRequest = {
        id: serviceId,
        name,
        price,
        durationInMinutes: duration,
        description: description || undefined,
        categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined,
      };

      await serviceService.update(payload);

      Alert.alert('Sucesso', 'Serviço atualizado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      Alert.alert('Erro', 'Não foi possível atualizar o serviço');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Nome do serviço"
          value={name}
          onChangeText={setName}
        />

        <CategorySelector
          selectedCategoryIds={selectedCategoryIds}
          onSelectionChange={setSelectedCategoryIds}
        />

        <TextInput
          style={styles.input}
          placeholder="Preço (em centavos)"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Duração (em minutos)"
          value={duration}
          onChangeText={setDuration}
          keyboardType="numeric"
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descrição"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Button
          title={loading ? "Salvando..." : "Atualizar Serviço"}
          onPress={handleSubmit}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    padding: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
});
```

### 6. Componente de Exibição de Categorias

```typescript
// components/ServiceCategoryBadges.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Category } from '@/types/service';

interface ServiceCategoryBadgesProps {
  categories?: Category[];
}

export function ServiceCategoryBadges({ categories }: ServiceCategoryBadgesProps) {
  if (!categories || categories.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {categories.map(category => (
        <View key={category.id} style={styles.badge}>
          <Text style={styles.badgeText}>{category.name}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    color: '#374151',
    fontWeight: '500',
  },
});
```

---

## Checklist de Implementação Mobile

### Preparação

- [ ] Criar tipos TypeScript para Service e Category
- [ ] Configurar cliente API (Axios/Fetch)
- [ ] Definir base URL da API

### API Services

- [ ] Implementar `categoryService.getAll()`
- [ ] Implementar `serviceService.create()` com categoryIds
- [ ] Implementar `serviceService.update()` com categoryIds
- [ ] Implementar `serviceService.getById()` retornando categories

### Componentes

- [ ] Criar componente `CategorySelector`
  - [ ] Dropdown/Picker de categorias
  - [ ] Filtrar categorias já selecionadas
  - [ ] Renderizar badges de categorias selecionadas
  - [ ] Implementar remoção de categorias
- [ ] Criar componente `ServiceCategoryBadges` para exibição

### Telas

- [ ] Implementar tela de criar serviço
  - [ ] Integrar CategorySelector
  - [ ] Passar categoryIds no payload
- [ ] Implementar tela de editar serviço
  - [ ] Carregar serviço existente
  - [ ] Pré-popular categorias selecionadas
  - [ ] Atualizar com novo categoryIds
- [ ] Implementar exibição de categorias na lista de serviços
- [ ] Implementar exibição de categorias nos detalhes do serviço

### Testes

- [ ] Testar criação de serviço sem categorias
- [ ] Testar criação de serviço com uma categoria
- [ ] Testar criação de serviço com múltiplas categorias
- [ ] Testar edição adicionando categorias
- [ ] Testar edição removendo categorias
- [ ] Testar edição substituindo categorias
- [ ] Testar exibição de categorias na lista
- [ ] Testar exibição de categorias nos detalhes

---

## Notas Importantes

### 1. Conversão de Valores

A aplicação web converte valores antes de enviar para a API:

```typescript
// Preço: converter para centavos
price: convertUnmaskedToCents(inputs.price)

// Duração: converter para número inteiro
durationInMinutes: parseDuration(inputs.durationInMinutes)
```

No mobile, certifique-se de fazer as mesmas conversões antes de enviar para a API.

### 2. Gerenciamento de Estado

- Use `useState` para armazenar `selectedCategoryIds: string[]`
- Mantenha apenas IDs no estado, não objetos completos
- Derive objetos de categoria para exibição filtrando a lista completa de categorias

### 3. Performance

- Carregue a lista de categorias uma vez no início
- Use `useMemo` ou cache para evitar recalcular categorias filtradas
- Considere usar React Query ou SWR para cache de API

### 4. UX

- Mostre loading states ao carregar categorias
- Desabilite o dropdown se não houver mais categorias disponíveis
- Mostre mensagem se não houver categorias cadastradas
- Permita criar categoria diretamente do formulário (opcional)

### 5. Validação

- `categoryIds` é opcional - pode criar serviço sem categorias
- Ao enviar array vazio, omita o campo ou envie `undefined`
- Backend deve validar existência das categorias pelos IDs

### 6. Bibliotecas Recomendadas

**UI Components:**
- `@react-native-picker/picker` - Dropdown/Select
- `react-native-element-dropdown` - Alternativa com melhor UI
- `react-native-paper` - Chips/Badges prontos

**State Management:**
- React Query / TanStack Query - Cache e sincronização de API
- Zustand - State management leve (se necessário)

**Forms:**
- `react-hook-form` - Validação e gerenciamento de formulários
- `zod` - Validação de schemas (igual ao web)

---

## Exemplo de Integração com React Query (Opcional)

Se quiser usar React Query no mobile para manter consistência com o web:

```typescript
// hooks/useCategories.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/api/categories';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  });
}

// hooks/useServices.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { serviceService } from '@/services/api/services';

export function useCreateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: serviceService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
}

// Uso no componente
function CreateServiceScreen() {
  const { data: categories = [] } = useCategories();
  const { mutate, isPending } = useCreateService();

  // ...resto do código
}
```

---

## Suporte e Referências

### Arquivos de Referência no Projeto Web

- **Schema de validação**: `src/lib/validations/service.ts`
- **Formulário de criação**: `src/pages/app/services/new/index.tsx`
- **Formulário de edição**: `src/pages/app/services/$serviceId/-components/update-service-form.tsx`
- **API de serviços**: `src/http/services/`
- **API de categorias**: `src/http/categories/`
- **Hooks customizados**: `src/hooks/use-services.ts`, `src/hooks/use-categories.ts`

### Contato

Para dúvidas sobre a implementação, consulte os arquivos de referência ou entre em contato com a equipe de desenvolvimento.

---

**Última atualização**: 2025-11-10
**Versão**: 1.0
