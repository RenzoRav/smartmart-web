<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import Dropdown from 'primevue/dropdown'
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'

import { useSupabaseClient } from '@/composable/useSupabaseClient'
import useProdutoService from '@/services/produtos'

const notificacao = useToast()
const confirmacao = useConfirm()
const supabase = useSupabaseClient()
const { listar, criar, atualizar, excluir } = useProdutoService()

const indicadorCarregando = ref(false)
const listaProdutos = ref([])
const textoBusca = ref('')

const dialogoAberto = ref(false)
const modoEdicao = ref(false)

const listaCategorias = ref([])
const mapaCategorias = computed(() => {
  const m = new Map()
  for (const c of listaCategorias.value) m.set(c.id, c.nome)
  return m
})

const novoModelo = () => ({
  id: null,
  sku: '',
  nome: '',
  preco: 0,
  custo: 0,
  ativo: true,
  categoria_id: null
})

const formulario = ref(novoModelo())

function formatarData(valor) {
  if (!valor) return '—'
  try {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(valor))
  } catch {
    return valor
  }
}

const produtosFiltrados = computed(() => {
  const termo = textoBusca.value.trim().toLowerCase()
  if (!termo) return listaProdutos.value
  return listaProdutos.value.filter((produto) =>
    [produto.nome, produto.sku].some((campo) => String(campo || '').toLowerCase().includes(termo))
  )
})

async function carregarCategorias() {
  const { data, error } = await supabase.from('categorias').select('id, nome').order('nome', { ascending: true })
  if (error) throw error
  listaCategorias.value = data || []
}

async function carregarProdutos() {
  try {
    indicadorCarregando.value = true
    await carregarCategorias()
    listaProdutos.value = await listar()
  } catch (erro) {
    mostrarErro('Falha ao carregar produtos', erro)
  } finally {
    indicadorCarregando.value = false
  }
}

function novoProduto() {
  modoEdicao.value = false
  formulario.value = novoModelo()
  dialogoAberto.value = true
}

function editarProduto(linha) {
  modoEdicao.value = true
  formulario.value = {
    id: linha.id,
    sku: linha.sku || '',
    nome: linha.nome || '',
    preco: Number(linha.preco || 0),
    custo: Number(linha.custo || 0),
    ativo: Boolean(linha.ativo),
    categoria_id: linha.categoria_id ?? linha.categoriaId ?? null
  }
  dialogoAberto.value = true
}

async function salvarProduto() {
  try {
    const dados = {
      sku: String(formulario.value.sku || '').trim(),
      nome: String(formulario.value.nome || '').trim(),
      preco: Number(formulario.value.preco || 0),
      custo: Number(formulario.value.custo || 0),
      ativo: Boolean(formulario.value.ativo),
      categoria_id: formulario.value.categoria_id ?? null
    }

    if (!dados.nome) {
      notificacao.add({ severity: 'warn', summary: 'Atenção', detail: 'Informe o nome do produto.', life: 3000 })
      return
    }

    if (modoEdicao.value && formulario.value.id) {
      await atualizar(formulario.value.id, dados)
      notificacao.add({ severity: 'success', summary: 'Atualizado', detail: 'Produto atualizado com sucesso.', life: 2500 })
    } else {
      await criar(dados)
      notificacao.add({ severity: 'success', summary: 'Criado', detail: 'Produto criado com sucesso.', life: 2500 })
    }

    dialogoAberto.value = false
    await carregarProdutos()
  } catch (erro) {
    mostrarErro('Erro ao salvar produto', erro)
  }
}

function confirmarExclusao(linha) {
  confirmacao.require({
    message: `Excluir o produto "${linha.nome}"?`,
    header: 'Confirmar exclusão',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Excluir',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await excluir(linha.id)
        notificacao.add({ severity: 'success', summary: 'Excluído', detail: 'Produto removido.', life: 2500 })
        await carregarProdutos()
      } catch (erro) {
        mostrarErro('Erro ao excluir produto', erro)
      }
    }
  })
}

function mostrarErro(mensagem, erro) {
  const detalhe = erro?.response?.data?.message || erro?.message || 'Tente novamente.'
  notificacao.add({ severity: 'error', summary: 'Erro', detail: `${mensagem}: ${detalhe}`, life: 4000 })
  console.error(erro)
}

function nomeDaCategoria(id) {
  return mapaCategorias.value.get(id) || 'Sem categoria'
}

onMounted(carregarProdutos)
</script>

<template>
  <div class="max-w-none mx-auto px-8">
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-2xl font-bold">Produtos</h1>
      <div class="flex items-center gap-2">
        <InputText v-model="textoBusca" placeholder="Buscar por nome ou SKU" class="w-72 md:w-96" />
        <Button label="Novo produto" icon="pi pi-plus" @click="novoProduto" />
      </div>
    </div>

    <DataTable
      :value="produtosFiltrados"
      :loading="indicadorCarregando"
      dataKey="id"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50, 100]"
      size="small"
      class="shadow-sm rounded-lg w-full"
      :style="{ width: '100%' }"
    >
      <Column field="id" header="ID" style="width: 90px" />
      <Column field="sku" header="SKU" style="width: 160px" />
      <Column field="nome" header="Nome" />
      <Column header="Categoria" style="width: 200px">
        <template #body="{ data }">
          {{ nomeDaCategoria(data.categoria_id ?? data.categoriaId) }}
        </template>
      </Column>
      <Column header="Preço" style="width: 140px">
        <template #body="{ data }">
          {{ Number(data.preco ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
        </template>
      </Column>
      <Column header="Custo" style="width: 140px">
        <template #body="{ data }">
          {{ Number(data.custo ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }}
        </template>
      </Column>
      <Column header="Status" style="width: 120px">
        <template #body="{ data }">
          <Tag :value="data.ativo ? 'Ativo' : 'Inativo'" :severity="data.ativo ? 'success' : 'danger'" />
        </template>
      </Column>
      <Column header="Criado em" style="width: 190px">
        <template #body="{ data }">
          {{ formatarData(data.criadoEm ?? data.criado_em) }}
        </template>
      </Column>
      <Column header="Ações" style="width: 180px">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button icon="pi pi-pencil" severity="secondary" outlined @click="editarProduto(data)" />
            <Button icon="pi pi-trash" severity="danger" outlined @click="confirmarExclusao(data)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog v-model:visible="dialogoAberto" :header="modoEdicao ? 'Editar produto' : 'Novo produto'" modal class="w-full md:w-2/3 lg:w-1/2">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm mb-1">SKU</label>
          <InputText v-model.trim="formulario.sku" placeholder="SKU" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm mb-1">Nome</label>
          <InputText v-model.trim="formulario.nome" placeholder="Nome do produto" />
        </div>
        <div>
          <label class="block text-sm mb-1">Preço</label>
          <InputNumber v-model="formulario.preco" mode="currency" currency="BRL" locale="pt-BR" :min="0" />
        </div>
        <div>
          <label class="block text-sm mb-1">Custo</label>
          <InputNumber v-model="formulario.custo" mode="currency" currency="BRL" locale="pt-BR" :min="0" />
        </div>
        <div>
          <label class="block text-sm mb-1">Categoria</label>
          <Dropdown
            v-model="formulario.categoria_id"
            :options="listaCategorias"
            optionLabel="nome"
            optionValue="id"
            placeholder="Selecione uma categoria"
            class="w-full"
          />
        </div>
        <div class="flex items-center gap-2 mt-2">
          <Checkbox v-model="formulario.ativo" :binary="true" input-id="ativo" />
          <label for="ativo">Ativo</label>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancelar" severity="secondary" outlined @click="dialogoAberto = false" />
          <Button :label="modoEdicao ? 'Salvar' : 'Criar'" icon="pi pi-check" @click="salvarProduto" />
        </div>
      </template>
    </Dialog>

    <ConfirmDialog />
    <Toast />
  </div>
</template>

<style scoped>
:deep(.p-datatable) {
  border-radius: 0.75rem;
  overflow: hidden;
}
</style>
