# Como Falar com o Agente - Exemplos de Pedidos

Este guia contém exemplos práticos de como pedir implementações de componentes shadcn/ui para o agente.

---

## Estrutura Básica de um Pedido

```
"[Ação] [Componente] [Onde] [O que fazer]"
```

**Níveis de detalhe:**

1. **Simples**: "Adicione Calendar no filtro de data"
2. **Médio**: "Adicione Calendar no filtro de data da página de documentos"
3. **Detalhado**: "Adicione Calendar no filtro de data da página de documentos com mode='range' para seleção de período"

---

## Exemplos por Componente

### 📅 Calendar

**Simples:**

```
"Adicione Calendar no filtro de data"
```

**Médio:**

```
"Substitua o Select de data por um Calendar na página de documentos"
```

**Detalhado:**

```
"Adicione Calendar na página de documentos:
- mode='single' para selecionar uma data
- captionLayout='dropdown' para navegação rápida
- Dentro de um Popover que abre ao clicar no campo"
```

**Com período (range):**

```
"Use Calendar com mode='range' para selecionar data inicial e final
no filtro de documentos"
```

---

### 🔍 Combobox

**Simples:**

```
"Use Combobox no campo de busca"
```

**Médio:**

```
"Transforme o campo de busca em Combobox com sugestões de documentos"
```

**Detalhado:**

```
"Implemente Combobox no campo de busca da página de documentos:
- Mostrar sugestões enquanto digita
- Filtrar por título e autor
- Navegar com teclado (setas + Enter)
- Máximo 5 sugestões visíveis
- Debounce de 300ms"
```

---

### 💡 Tooltip

**Simples:**

```
"Adicione Tooltips nos botões de ação"
```

**Médio:**

```
"Adicione Tooltips em todos os botões explicando sua função"
```

**Detalhado:**

```
"Adicione Tooltips nos seguintes elementos:
- Botão 'New Document': 'Criar novo documento'
- Botão de deletar: 'Excluir documento'
- Botão de exportar: 'Exportar para PDF'
- Badges de status: descrição do que cada status significa
- Usar side='top' e delayDuration={200}"
```

---

### 📑 Tabs

**Simples:**

```
"Organize o editor em Tabs"
```

**Médio:**

```
"Use Tabs no editor para separar edição, versões e comentários"
```

**Detalhado:**

```
"Implemente Tabs no editor de documentos:
- Tab 'Editar': área do editor atual
- Tab 'Versões': histórico de versões
- Tab 'Comentários': seção de comentários
- Tab 'Configurações': título, categoria, status
- Manter estado ao alternar entre tabs
- Tab 'Editar' como padrão"
```

---

### 💬 Popover

**Simples:**

```
"Use Popover para sugestões de busca"
```

**Médio:**

```
"Adicione Popover no campo de busca mostrando resultados em tempo real"
```

**Detalhado:**

```
"Implemente Popover no campo de busca:
- Abrir quando o campo está focado
- Mostrar até 5 documentos que correspondem à busca
- Fechar ao clicar fora
- Clicar em item navega para o documento
- Mostrar título, categoria e autor de cada resultado"
```

---

### ⚠️ Alert Dialog

**Simples:**

```
"Use Alert Dialog para confirmar exclusões"
```

**Médio:**

```
"Adicione Alert Dialog ao deletar documentos pedindo confirmação"
```

**Detalhado:**

```
"Implemente Alert Dialog para confirmar ações destrutivas:
- Ao deletar documento: 'Tem certeza que deseja excluir este documento?'
- Ao descartar alterações: 'Deseja descartar as alterações não salvas?'
- Botão 'Cancelar' e 'Confirmar' com cores apropriadas
- Destructive variant no botão de confirmar exclusão"
```

---

### 📊 Chart

**Simples:**

```
"Adicione Charts no dashboard"
```

**Médio:**

```
"Use Chart para mostrar estatísticas de documentos no dashboard"
```

**Detalhado:**

```
"Adicione gráficos no dashboard:
- Gráfico de linha: documentos criados por mês
- Gráfico de pizza: distribuição por categoria
- Gráfico de barras: documentos por status
- Responsivo em todas as telas
- Cores consistentes com o tema"
```

---

### 📋 Data Table

**Simples:**

```
"Use Data Table na lista de usuários"
```

**Médio:**

```
"Substitua a lista de usuários por Data Table com ordenação"
```

**Detalhado:**

```
"Implemente Data Table na página de usuários:
- Colunas: nome, role, data de criação
- Ordenação por qualquer coluna
- Busca integrada
- Paginação (10 itens por página)
- Ações em cada linha (editar, deletar)
- Seleção múltipla para ações em lote"
```

---

### 🎴 Hover Card

**Simples:**

```
"Use Hover Card para preview de documentos"
```

**Médio:**

```
"Adicione Hover Card nos cards de documento mostrando preview"
```

**Detalhado:**

```
"Implemente Hover Card no título dos documentos:
- Mostrar ao passar o mouse por 500ms
- Exibir: título completo, categoria, status, autor
- Preview do conteúdo (primeiras 200 caracteres)
- Data da última atualização
- Posicionar à direita do elemento"
```

---

### 📱 Sheet

**Simples:**

```
"Use Sheet para menu mobile"
```

**Médio:**

```
"Substitua o sidebar por Sheet em dispositivos móveis"
```

**Detalhado:**

```
"Implemente Sheet para navegação mobile:
- Abrir do lado esquerdo
- Mostrar mesmo conteúdo do sidebar
- Fechar ao selecionar item
- Botão de menu no header em telas pequenas
- Overlay com blur no fundo"
```

---

### 📆 Date Picker

**Simples:**

```
"Use Date Picker no filtro de data"
```

**Médio:**

```
"Substitua o Select por Date Picker na página de documentos"
```

**Detalhado:**

```
"Implemente Date Picker no filtro de documentos:
- Calendar dentro de Popover
- Presets: 'Últimos 7 dias', 'Últimos 30 dias', 'Este mês'
- Opção de selecionar período customizado
- Mostrar data selecionada no botão
- Botão para limpar seleção"
```

---

### 🔔 Toast/Sonner

**Simples:**

```
"Adicione notificações Toast nas ações"
```

**Médio:**

```
"Use Toast para feedback ao criar, editar e deletar documentos"
```

**Detalhado:**

```
"Implemente notificações Toast:
- Sucesso ao criar: 'Documento criado com sucesso'
- Sucesso ao salvar: 'Alterações salvas'
- Sucesso ao deletar: 'Documento excluído'
- Erro: 'Erro ao salvar. Tente novamente.'
- Posição: canto inferior direito
- Duração: 3 segundos"
```

---

### 🎹 Command (Command Palette)

**Simples:**

```
"Melhore o Command Palette"
```

**Médio:**

```
"Adicione mais opções ao Command Palette existente"
```

**Detalhado:**

```
"Melhore o Command Palette:
- Adicionar seção 'Ações rápidas': criar documento, exportar
- Adicionar seção 'Configurações': tema, perfil
- Mostrar atalhos de teclado à direita
- Busca fuzzy nos títulos
- Ícones para cada tipo de item
- Histórico de buscas recentes"
```

---

### ✅ Checkbox

**Simples:**

```
"Adicione Checkbox para seleção múltipla"
```

**Médio:**

```
"Use Checkbox na lista de documentos para seleção em lote"
```

**Detalhado:**

```
"Implemente seleção múltipla com Checkbox:
- Checkbox em cada card de documento
- 'Selecionar todos' no topo da lista
- Barra de ações aparece quando há seleção
- Ações: deletar selecionados, exportar selecionados
- Contador mostrando quantos selecionados"
```

---

### 🎚️ Progress

**Simples:**

```
"Adicione Progress em uploads"
```

**Médio:**

```
"Use Progress para mostrar carregamento de documentos"
```

**Detalhado:**

```
"Implemente barra de Progress:
- Ao fazer upload de imagens no editor
- Ao exportar PDF (estimativa)
- Ao carregar lista grande de documentos
- Estilo: linear com porcentagem
- Animação suave de preenchimento"
```

---

### 🔽 Accordion

**Simples:**

```
"Use Accordion para FAQ"
```

**Médio:**

```
"Crie seção de ajuda com Accordion"
```

**Detalhado:**

```
"Implemente página de ajuda com Accordion:
- Seções: 'Primeiros passos', 'Editor', 'Versões', 'Exportação'
- Cada seção expande ao clicar
- Apenas uma aberta por vez (type='single')
- Ícone de seta indicando estado
- Animação suave ao expandir/recolher"
```

---

## Frases Úteis para Pedidos

### Para instalar componente

```
"Instale o componente [Nome] do shadcn/ui"
"Adicione o componente [Nome] ao projeto"
```

### Para usar componente

```
"Use [Componente] em [local]"
"Adicione [Componente] na [página/seção]"
"Implemente [Componente] para [funcionalidade]"
```

### Para substituir

```
"Substitua [elemento atual] por [Componente]"
"Troque o [elemento] por [Componente] do shadcn/ui"
```

### Para melhorar

```
"Melhore o [elemento] usando [Componente]"
"Atualize [elemento] com funcionalidade de [Componente]"
```

### Para configurar

```
"Configure [Componente] com [propriedade]=[valor]"
"Use [Componente] com as seguintes opções: ..."
```

---

## Dicas para Pedidos Eficientes

### ✅ Bons pedidos

```
✅ "Adicione Tooltip nos botões de ação da página de documentos"
✅ "Use Calendar com mode='range' no filtro de data"
✅ "Implemente Tabs no editor separando: edição, versões, comentários"
```

### ❌ Pedidos vagos

```
❌ "Melhore a interface"
❌ "Adicione componentes"
❌ "Faça ficar melhor"
```

### Estrutura ideal

1. **O que fazer**: Adicione, use, implemente, substitua
2. **Qual componente**: Calendar, Tooltip, Tabs, etc.
3. **Onde**: página, seção, elemento específico
4. **Como** (opcional): propriedades, comportamento, estilo

---

## Combinando Componentes

### Date Picker (Calendar + Popover)

```
"Crie um Date Picker usando Calendar dentro de Popover no filtro de data"
```

### Busca avançada (Combobox + Popover)

```
"Implemente busca com Combobox que mostra resultados em Popover"
```

### Confirmação (Alert Dialog + Toast)

```
"Use Alert Dialog para confirmar exclusão e Toast para feedback de sucesso"
```

### Filtros mobile (Sheet + Calendar + Select)

```
"Em mobile, abra filtros em Sheet contendo Calendar e Selects"
```

---

## Exemplos Completos

### Exemplo 1: Melhorar página de documentos

```
"Na página de documentos:
1. Substitua o campo de busca por Combobox com sugestões
2. Troque o Select de data por Date Picker
3. Adicione Tooltips em todos os botões
4. Use Alert Dialog ao deletar documentos
5. Adicione Toast de feedback nas ações"
```

### Exemplo 2: Melhorar editor

```
"No editor de documentos:
1. Organize em Tabs: Editar, Versões, Comentários
2. Adicione Tooltips na barra de ferramentas
3. Use Alert Dialog ao descartar alterações
4. Adicione Progress ao fazer upload de imagens
5. Toast ao salvar com sucesso"
```

### Exemplo 3: Melhorar dashboard

```
"No dashboard:
1. Adicione Charts para visualizar estatísticas
2. Use Hover Card nos cards de documentos recentes
3. Implemente Tabs para: Visão Geral, Estatísticas, Atividade
4. Adicione Tooltips nos números de estatísticas"
```

---

## Referência Rápida

| Componente   | Uso Principal       | Exemplo de Pedido                    |
| ------------ | ------------------- | ------------------------------------ |
| Calendar     | Seleção de data     | "Use Calendar no filtro de data"     |
| Combobox     | Busca com sugestões | "Implemente Combobox na busca"       |
| Tooltip      | Dicas em elementos  | "Adicione Tooltips nos botões"       |
| Tabs         | Organizar conteúdo  | "Organize em Tabs"                   |
| Popover      | Conteúdo flutuante  | "Use Popover para preview"           |
| Alert Dialog | Confirmações        | "Confirme exclusão com Alert Dialog" |
| Toast        | Notificações        | "Adicione Toast de feedback"         |
| Data Table   | Tabelas avançadas   | "Use Data Table na lista"            |
| Sheet        | Menu mobile         | "Use Sheet para navegação mobile"    |
| Hover Card   | Preview ao hover    | "Adicione Hover Card no título"      |
| Chart        | Gráficos            | "Adicione Charts de estatísticas"    |
| Progress     | Carregamento        | "Mostre Progress no upload"          |

---

## Com MCP do shadcn

Se você tem o MCP do shadcn configurado, os pedidos ficam ainda mais simples:

- O agente **instala automaticamente** componentes necessários
- O agente **consulta a documentação** oficial
- O agente **usa as props corretas** baseado nos exemplos

**Você só precisa dizer o que quer e onde quer.**

---

**Referências:**

- shadcn/ui: https://ui.shadcn.com/
- Componentes: https://ui.shadcn.com/docs/components
- Exemplos: https://ui.shadcn.com/examples

---

**Lembre-se**: Quanto mais específico o pedido, melhor o resultado!
