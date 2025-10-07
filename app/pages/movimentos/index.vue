<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
import Tag from 'primevue/tag'

import useMovimentoService from '@/services/movimentos'
import useProdutoService from '@/services/produtos'

const notificacao = useToast()
const confirmacao = useConfirm()

const { listar, criar, atualizar, excluir } = useMovimentoService()
const { listar: listarProdutos } = useProdutoService()

const indicadorCarregando = ref(false)
const listaMovimentos = ref([])
const listaProdutos = ref([])

const textoBusca = ref('')
const dialogoVisivel = ref(false)
const modoEdicao = ref(false)

const formulario = ref({
  id: null,
  produtoId: null,
  quantidade: 1,
  tipo: '',
  motivo: '',
})

const tiposPermitidos = [
  { rotulo: 'Compra fornecedor', valor: 'COMPRA_FORNECEDOR' },
  { rotulo: 'Venda', valor: 'VENDA' },
  { rotulo: 'Devolução cliente', valor: 'DEVOLUCAO_CLIENTE' },
  { rotulo: 'Ajuste de estoque', valor: 'AJUSTE_ESTOQUE' },
  { rotulo: 'Perda', valor: 'PERDA' },
  { rotulo: 'Vencimento', valor: 'VENCIMENTO' },
]

const motivosPermitidos = [
  { rotulo: 'Entrada', valor: 'ENTRADA' },
  { rotulo: 'Saída', valor: 'SAIDA' },
]

function rotuloTipo(valor) {
  const item = tiposPermitidos.find(t => t.valor === valor)
  return item ? item.rotulo : valor || '—'
}

function rotuloMotivo(valor) {
  if (valor === 'ENTRADA') return 'Entrada'
  if (valor === 'SAIDA') return 'Saída'
  return valor || '—'
}

function corMotivo(valor) {
  if (valor === 'ENTRADA') return 'success'
  if (valor === 'SAIDA') return 'danger'
  return 'secondary'
}

function extrairEnum(valorPossivel) {
  if (!valorPossivel) return ''
  if (typeof valorPossivel === 'string') return valorPossivel
  if (typeof valorPossivel === 'object') {
    return valorPossivel.name || valorPossivel.valor || valorPossivel.tipo || ''
  }
  return ''
}

function valorTipoLinha(linha) {
  return extrairEnum(linha.tipo) || extrairEnum(linha.tipoMovimento) || extrairEnum(linha.tipo_movimento)
}

function valorMotivoLinha(linha) {
  return extrairEnum(linha.motivo) || extrairEnum(linha.motivoMovimento) || extrairEnum(linha.motivo_movimento)
}

function formatarData(valor) {
  const v = valor || ''
  const data = v || null
  const candidato = data || null
  const d = candidato ? new Date(candidato) : null
  if (!d || isNaN(d)) return v || '—'
  try {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(d)
  } catch {
    return v || '—'
  }
}

const movimentosFiltrados = computed(() => {
  const consulta = textoBusca.value.trim().toLowerCase()
  if (!consulta) return listaMovimentos.value
  return listaMovimentos.value.filter(m =>
    [
      m.produto?.nome,
      m.produto?.sku,
      valorTipoLinha(m),
      valorMotivoLinha(m)
    ].some(x => String(x ?? '').toLowerCase().includes(consulta))
  )
})

function indexProdutosById() {
  const map = new Map()
  for (const p of listaProdutos.value) map.set(p.id, p)
  return map
}

async function carregarDados() {
  try {
    indicadorCarregando.value = true
    const [produtos, movimentos] = await Promise.all([listarProdutos(), listar()])
    listaProdutos.value = produtos || []
    const byId = indexProdutosById()
    listaMovimentos.value = (movimentos || []).map(m => ({
      ...m,
      produto: m.produto ?? byId.get(m.produto_id ?? m.produtoId) ?? null,
      criadoEm: m.criadoEm ?? m.criado_em ?? m.created_at ?? null,
    }))
  } catch (erro) {
    mostrarErro('Falha ao carregar dados', erro)
  } finally {
    indicadorCarregando.value = false
  }
}

function novoRegistro() {
  modoEdicao.value = false
  formulario.value = {
    id: null,
    produtoId: null,
    quantidade: 1,
    tipo: '',
    motivo: '',
  }
  dialogoVisivel.value = true
}

function editarRegistro(item) {
  modoEdicao.value = true
  formulario.value = {
    id: item.id,
    produtoId: item.produto?.id ?? item.produto_id ?? null,
    quantidade: Number(item.quantidade ?? 1),
    tipo: valorTipoLinha(item),
    motivo: valorMotivoLinha(item),
  }
  dialogoVisivel.value = true
}

async function salvarRegistro() {
  try {
    const corpo = {
      produto_id: formulario.value.produtoId,
      quantidade: Number(formulario.value.quantidade),
      tipo: formulario.value.tipo,
      motivo: formulario.value.motivo,
    }

    if (!corpo.produto_id) {
      notificacao.add({ severity: 'warn', summary: 'Validação', detail: 'Selecione um produto.', life: 3000 })
      return
    }
    if (!corpo.tipo) {
      notificacao.add({ severity: 'warn', summary: 'Validação', detail: 'Selecione um tipo.', life: 3000 })
      return
    }
    if (!corpo.motivo) {
      notificacao.add({ severity: 'warn', summary: 'Validação', detail: 'Selecione o motivo.', life: 3000 })
      return
    }

    if (modoEdicao.value && formulario.value.id) {
      await atualizar(formulario.value.id, corpo)
      notificacao.add({ severity: 'success', summary: 'Atualizado', detail: 'Movimento atualizado com sucesso.', life: 2500 })
    } else {
      await criar(corpo)
      notificacao.add({ severity: 'success', summary: 'Criado', detail: 'Movimento criado com sucesso.', life: 2500 })
    }

    dialogoVisivel.value = false
    await carregarDados()
  } catch (erro) {
    mostrarErro('Falha ao salvar movimento', erro)
  }
}

function confirmarExclusao(item) {
  confirmacao.require({
    message: `Excluir o movimento do produto "${item.produto?.nome ?? 'produto'}"?`,
    header: 'Confirmar exclusão',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Excluir',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await excluir(item.id)
        notificacao.add({ severity: 'success', summary: 'Excluído', detail: 'Movimento excluído.', life: 2500 })
        await carregarDados()
      } catch (erro) {
        mostrarErro('Falha ao excluir movimento', erro)
      }
    },
  })
}

function mostrarErro(mensagem, erro) {
  const detalhe =
    erro?.message ||
    erro?.details ||
    erro?.hint ||
    (typeof erro === 'string' ? erro : 'Tente novamente.')
  notificacao.add({ severity: 'error', summary: 'Erro', detail: `${mensagem}: ${detalhe}`, life: 5000 })
  console.error(erro)
}

onMounted(carregarDados)
</script>

<template>
  <div class="max-w-none mx-auto px-8">
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-2xl font-bold">Movimentos de Estoque</h1>
      <div class="flex items-center gap-2">
        <InputText v-model="textoBusca" placeholder="Buscar por produto, tipo ou motivo" class="w-80" />
        <Button label="Novo movimento" icon="pi pi-plus" @click="novoRegistro" />
      </div>
    </div>

    <DataTable
      :value="movimentosFiltrados"
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
      <Column header="Produto">
        <template #body="{ data }">
          <div class="flex flex-col">
            <span class="font-medium">{{ data.produto?.nome || '—' }}</span>
            <span class="text-xs text-slate-500">{{ data.produto?.sku || '' }}</span>
          </div>
        </template>
      </Column>
      <Column field="quantidade" header="Quantidade" style="width: 140px" />
      <Column header="Tipo" style="width: 220px">
        <template #body="{ data }">
          <Tag :value="rotuloTipo(valorTipoLinha(data))" />
        </template>
      </Column>
      <Column header="Motivo" style="width: 180px">
        <template #body="{ data }">
          <Tag :value="rotuloMotivo(valorMotivoLinha(data))" :severity="corMotivo(valorMotivoLinha(data))" />
        </template>
      </Column>
      <Column header="Criado em" style="width: 190px">
        <template #body="{ data }">
          {{ formatarData(data.criadoEm || data.created_at) }}
        </template>
      </Column>
      <Column header="Ações" style="width: 160px">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button icon="pi pi-pencil" severity="secondary" outlined @click="editarRegistro(data)" />
            <Button icon="pi pi-trash" severity="danger" outlined @click="confirmarExclusao(data)" />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog
      v-model:visible="dialogoVisivel"
      :header="modoEdicao ? 'Editar movimento' : 'Novo movimento'"
      modal
      class="w-full md:w-2/3 lg:w-1/2"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm mb-1">Produto</label>
          <Dropdown
            v-model="formulario.produtoId"
            :options="listaProdutos"
            optionLabel="nome"
            optionValue="id"
            placeholder="Selecione um produto"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm mb-1">Quantidade</label>
          <InputNumber v-model="formulario.quantidade" :min="1" showButtons class="w-full" />
        </div>
        <div>
          <label class="block text-sm mb-1">Tipo</label>
          <Dropdown
            v-model="formulario.tipo"
            :options="tiposPermitidos"
            optionLabel="rotulo"
            optionValue="valor"
            placeholder="Selecione o tipo"
            class="w-full"
          />
        </div>
        <div>
          <label class="block text-sm mb-1">Motivo</label>
          <Dropdown
            v-model="formulario.motivo"
            :options="motivosPermitidos"
            optionLabel="rotulo"
            optionValue="valor"
            placeholder="Selecione o motivo"
            class="w-full"
          />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancelar" severity="secondary" outlined @click="dialogoVisivel = false" />
          <Button :label="modoEdicao ? 'Salvar' : 'Criar'" icon="pi pi-check" @click="salvarRegistro" />
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
