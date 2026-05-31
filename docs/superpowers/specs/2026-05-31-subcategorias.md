# Subcategorias

## Resumo

Adicionar suporte a subcategorias (2 níveis) nas categorias financeiras, com organização hierárquica no formulário de transações e na página de gerenciamento.

## Escopo

- Modelo: auto-relacionamento na Category com campo `parentId`
- Categorias pai não são selecionáveis em transações — apenas subcategorias (folhas)
- Campo `icon` (emoji) já existe no schema, será exposto na UI
- Máximo 2 níveis (categoria pai → subcategoria)

## Modelo de Dados

```prisma
model Category {
  id          String       @id @default(cuid())
  name        String
  type        CategoryType
  color       String?
  icon        String?       // emoji da subcategoria
  userId      String
  parentId    String?       // NOVO — null para categoria pai
  parent      Category?     @relation("CategoryHierarchy", fields: [parentId], references: [id], onDelete: Cascade)
  children    Category[]    @relation("CategoryHierarchy")
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  transactions Transaction[]
  budgets     Budget[]
  
  @@unique([userId, id])
  @@unique([userId, name, type])
  @@unique([userId, parentId, name, type])
}
```

- `onDelete: Cascade` no auto-relacionamento: deletar pai deleta subcategorias
- `@@unique([userId, parentId, name, type])` garante unicidade de subcategorias por pai
- `@@unique([userId, name, type])` mantido para categorias pai

## Mudanças por Camada

### Schema (categorySchema)

Adicionar `parentId` opcional string.

### API — `app/lib/tenant-db.ts`

- `listCategories`: retornar flat list incluindo `parentId` — o frontend agrupa
- `createCategory`: aceitar `parentId` opcional; validar máximo 2 níveis (categoria com `parentId` não pode ter `children`)
- `updateCategory`: aceitar `parentId` opcional
- `deleteCategory`: validar que pai com subcategorias pode ser deletado (cascade via Prisma)

### API — Rotas

- `GET /api/categories`: retorna flat list com `parentId` e `icon`
- `POST /api/categories`: aceita `parentId` e `icon`
- `PUT /api/categories/$id`: aceita `parentId` e `icon`
- `DELETE /api/categories/$id`: cascade deleta subcategorias

### Hooks — `useCategories`

- `useCategories()` sem mudanças (dado é flat list)
- `useCreateCategory` / `useUpdateCategory`: tipos aceitam `parentId` e `icon`

### Página de Categorias

- Categorias pais aparecem com subcategorias indentadas abaixo
- Cada pai tem botão "Nova Subcategoria"
- Subcategoria herda `type` e `color` do pai
- Subcategoria pode definir emoji (ícone) via seletor

  **Layout:**
  ```
  [Card Receitas]
  ● Salário                          [✏️][🗑️]
  ● Freelas                          [✏️][🗑️]
  ● Investimentos                    [✏️][🗑️]
    ├ 📈 Dividendos                  [✏️][🗑️]
    └ 📊 Day Trade                   [✏️][🗑️]

  [Card Despesas]
  ● Alimentação                      [✏️][🗑️]  [+ Sub]
    ├ 🍕 Restaurante                 [✏️][🗑️]
    ├ 🛒 Supermercado                [✏️][🗑️]
    └ 🥡 Ifood                       [✏️][🗑️]
  ● Moradia                          [✏️][🗑️]  [+ Sub]
    └ 🏠 Aluguel                     [✏️][🗑️]
  ```

- Ao criar subcategoria: seletor de emoji (paleta de ~20 emojis comuns ou input livre), herdar type/color do pai
- Ao editar pai: campos normais
- Ao editar subcategoria: pode mudar nome, cor e emoji (type locked)
- Confirmação de exclusão: "Excluir também remove N subcategorias"

### Formulário de Transação

- Select de categoria agrupa por `SelectGroup` com `SelectLabel`
- Apenas subcategorias (parentId !== null) são renderizadas como `SelectItem`
- Subcategorias mostram emoji + nome
- Dados agrupados no frontend:

```tsx
const grouped = categories?.reduce((acc, cat) => {
  if (!cat.parentId) {
    acc.push({ parent: cat, children: [] })
  } else {
    const group = acc.find(g => g.parent.id === cat.parentId)
    if (group) group.children.push(cat)
  }
  return acc
}, [])
```

```tsx
{grouped?.map(group => (
  <SelectGroup key={group.parent.id}>
    <SelectLabel>{group.parent.name}</SelectLabel>
    {group.children.map(child => (
      <SelectItem key={child.id} value={child.id}>
        {child.icon ? `${child.icon} ` : ''}{child.name}
      </SelectItem>
    ))}
  </SelectGroup>
))}
```

### Relatórios e Filtros

- Filtro de categoria mostra estrutura hierárquica
- Selecionar categoria pai filtra por todas subcategorias

### Budget (Orçamentos)

- Pode criar orçamento para categoria pai (engloba todas subcategorias)
- Pode criar orçamento para subcategoria específica

### Seed

- Atualizar seed para incluir subcategorias com emojis

## Separação de Tarefas

1. Schema e migração (prisma)
2. API (tenant-db + routes)
3. Página de categorias (layout hierárquico + criação de subcategorias + emoji)
4. Formulário de transação (SelectGroup + filtro de apenas folhas)
5. Relatórios (filtro hierárquico)
6. Seed
