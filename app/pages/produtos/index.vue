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
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'

import useProdutoService from '@/services/produtos'

const toast = useToast()
const confirm = useConfirm()
const { listar, criar, atualizar, excluir } = useProdutoService()

const carregando = ref(false)
const produtos = ref([])
const busca = ref('')

const dialogAberto = ref(false)
const editando = ref(false)

const modeloVazio = () => ({
  id: null,
  sku: '',
  nome: '',
  preco: 0,
  custo: 0,
  ativo: true,
})

const modelo = ref(modeloVazio())

function formatarData(valor) {
  if (!valor) return '—'
  try {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(valor))
  } catch {
    return valor
  }
}

const filtrados = computed(() => {
  const q = busca.value.trim().toLowerCase()
  if (!q) return produtos.value
  return produtos.value.filter((p) =>
    [p.nome, p.sku].some((x) => String(x || '').toLowerCase().includes(q))
  )
})

async function carregar() {
  try {
    carregando.value = true
    produtos.value = await listar()
  } catch (e) {
    mostrarErro('Falha ao carregar produtos', e)
  } finally {
    carregando.value = false
  }
}

function novo() {
  editando.value = false
  modelo.value = modeloVazio()
  dialogAberto.value = true
}

function editar(row) {
  editando.value = true
  modelo.value = { ...row }
  dialogAberto.value = true
}

async function salvar() {
  try {
    const payload = {
      sku: modelo.value.sku?.trim(),
      nome: modelo.value.nome?.trim(),
      preco: Number(modelo.value.preco || 0),
      custo: Number(modelo.value.custo || 0),
      ativo: Boolean(modelo.value.ativo),
    }

    if (!payload.nome) {
      toast.add({ severity: 'warn', summary: 'Atenção', detail: 'Informe o nome do produto.', life: 3000 })
      return
    }

    if (editando.value && modelo.value.id) {
      await atualizar(modelo.value.id, payload)
      toast.add({ severity: 'success', summary: 'Atualizado', detail: 'Produto atualizado com sucesso.', life: 2500 })
    } else {
      await criar(payload)
      toast.add({ severity: 'success', summary: 'Criado', detail: 'Produto criado com sucesso.', life: 2500 })
    }

    dialogAberto.value = false
    await carregar()
  } catch (e) {
    mostrarErro('Erro ao salvar produto', e)
  }
}

function confirmarExclusao(row) {
  confirm.require({
    message: `Excluir o produto "${row.nome}"?`,
    header: 'Confirmar exclusão',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Excluir',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await excluir(row.id)
        toast.add({ severity: 'success', summary: 'Excluído', detail: 'Produto removido.', life: 2500 })
        await carregar()
      } catch (e) {
        mostrarErro('Erro ao excluir produto', e)
      }
    },
  })
}

function mostrarErro(msg, e) {
  const detail = e?.response?.data?.message || e?.message || 'Tente novamente.'
  toast.add({ severity: 'error', summary: 'Erro', detail: `${msg}: ${detail}`, life: 4000 })
  console.error(e)
}

onMounted(carregar)
</script>

<template>
  <div class="max-w-none mx-auto px-8">
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-2xl font-bold">Produtos</h1>
      <div class="flex items-center gap-2">
        <InputText
          v-model="busca"
          placeholder="Buscar por nome ou SKU"
          class="w-72 md:w-96"
        />
        <Button label="Novo produto" icon="pi pi-plus" @click="novo" />
      </div>
    </div>

    <DataTable
      :value="filtrados"
      :loading="carregando"
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
          {{ formatarData(data.criadoEm) }}
        </template>
      </Column>
      <Column header="Ações" style="width: 160px">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button icon="pi pi-pencil" severity="secondary" outlined @click="editar(data)" />
            <Button icon="pi pi-trash" severity="danger" outlined @click="confirmarExclusao(data)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="dialogAberto"
      :header="editando ? 'Editar produto' : 'Novo produto'"
      modal
      class="w-full md:w-2/3 lg:w-1/2"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm mb-1">SKU</label>
          <InputText v-model.trim="modelo.sku" placeholder="SKU" />
        </div>
        <div class="md:col-span-2">
          <label class="block text-sm mb-1">Nome</label>
          <InputText v-model.trim="modelo.nome" placeholder="Nome do produto" />
        </div>
        <div>
          <label class="block text-sm mb-1">Preço</label>
          <InputNumber v-model="modelo.preco" mode="currency" currency="BRL" locale="pt-BR" :min="0" />
        </div>
        <div>
          <label class="block text-sm mb-1">Custo</label>
          <InputNumber v-model="modelo.custo" mode="currency" currency="BRL" locale="pt-BR" :min="0" />
        </div>
        <div class="flex items-center gap-2 mt-2">
          <Checkbox v-model="modelo.ativo" :binary="true" input-id="ativo" />
          <label for="ativo">Ativo</label>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancelar" severity="secondary" outlined @click="dialogAberto = false" />
          <Button :label="editando ? 'Salvar' : 'Criar'" icon="pi pi-check" @click="salvar" />
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
