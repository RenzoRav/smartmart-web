<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Card from 'primevue/card'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import { useSupabaseClient } from '@/composable/useSupabaseClient'

const notificacao = useToast()
const supabase = useSupabaseClient()

const carregando = ref(false)
const produtos = ref([])
const movimentos = ref([])

const hoje = new Date()
const diasDoPeriodo = 30
const inicioDoPeriodo = new Date(hoje.getTime() - diasDoPeriodo * 24 * 60 * 60 * 1000)

function formatarData(valor) {
  if (!valor) return '—'
  try {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(valor))
  } catch {
    return String(valor)
  }
}
function corMotivo(motivo) {
  return motivo === 'ENTRADA' ? 'success' : motivo === 'SAIDA' ? 'danger' : 'secondary'
}

async function carregar() {
  try {
    carregando.value = true

    const { data: dadosProdutos, error: erroProdutos } = await supabase
      .from('produtos')
      .select('id, nome, sku, ativo, categoria:categorias(nome)')

    const { data: dadosMovimentos, error: erroMovimentos } = await supabase
      .from('movimentos_estoque')
      .select('id, produto_id, quantidade, motivo, tipo, criado_em')
      .gte('criado_em', inicioDoPeriodo.toISOString())
      .order('criado_em', { ascending: false })
      .limit(1000)

    if (erroProdutos) throw erroProdutos
    if (erroMovimentos) throw erroMovimentos

    produtos.value = dadosProdutos || []
    movimentos.value = dadosMovimentos || []
  } catch (e) {
    notificacao.add({ severity: 'error', summary: 'Erro', detail: `Falha ao carregar o dashboard: ${e.message || e}`, life: 5000 })
  } finally {
    carregando.value = false
  }
}

onMounted(carregar)

const totalDeProdutos = computed(() => produtos.value.length)
const produtosAtivos = computed(() => produtos.value.filter(p => p.ativo).length)
const produtosInativos = computed(() => totalDeProdutos.value - produtosAtivos.value)

const distribuicaoPorCategoria = computed(() => {
  const mapa = new Map()
  for (const p of produtos.value) {
    const nomeCategoria = p?.categoria?.nome || 'Sem categoria'
    mapa.set(nomeCategoria, (mapa.get(nomeCategoria) || 0) + 1)
  }
  return Array.from(mapa.entries())
    .map(([nome, quantidade]) => ({ nome, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)
})

const indiceDeProdutos = computed(() => {
  const indice = new Map()
  for (const p of produtos.value) indice.set(p.id, p)
  return indice
})

const agregadosDeMovimento = computed(() => {
  const saldosPorProduto = new Map()
  const totalMovimentadoAbsoluto = new Map()
  let totalEntradas = 0
  let totalSaidas = 0

  for (const movimento of movimentos.value) {
    const quantidade = Number(movimento.quantidade || 0)
    const idProduto = movimento.produto_id
    if (!saldosPorProduto.has(idProduto)) {
      saldosPorProduto.set(idProduto, 0)
      totalMovimentadoAbsoluto.set(idProduto, 0)
    }
    if (movimento.motivo === 'ENTRADA') {
      saldosPorProduto.set(idProduto, saldosPorProduto.get(idProduto) + quantidade)
      totalEntradas += quantidade
    } else if (movimento.motivo === 'SAIDA') {
      saldosPorProduto.set(idProduto, saldosPorProduto.get(idProduto) - quantidade)
      totalSaidas += quantidade
    }
    totalMovimentadoAbsoluto.set(idProduto, totalMovimentadoAbsoluto.get(idProduto) + Math.abs(quantidade))
  }

  return { saldosPorProduto, totalMovimentadoAbsoluto, totalEntradas, totalSaidas }
})

const entradasNoPeriodo = computed(() => agregadosDeMovimento.value.totalEntradas)
const saidasNoPeriodo = computed(() => agregadosDeMovimento.value.totalSaidas)
const saldoGeralNoPeriodo = computed(() => entradasNoPeriodo.value - saidasNoPeriodo.value)

const topMaisMovimentados = computed(() => {
  const resultado = []
  const { totalMovimentadoAbsoluto } = agregadosDeMovimento.value
  for (const [idProduto, total] of totalMovimentadoAbsoluto.entries()) {
    const produto = indiceDeProdutos.value.get(idProduto)
    if (produto) resultado.push({ id: idProduto, nome: produto.nome, sku: produto.sku, total })
  }
  return resultado.sort((a, b) => b.total - a.total).slice(0, 5)
})

const movimentosRecentes = computed(() =>
  movimentos.value.slice(0, 10).map(m => ({
    ...m,
    nome_do_produto: indiceDeProdutos.value.get(m.produto_id)?.nome ?? `#${m.produto_id}`
  }))
)
</script>

<template>
  <div class="px-6 py-4 space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold">Dashboard</h1>
      <small class="text-slate-500">Últimos {{ diasDoPeriodo }} dias</small>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <template #title>Total de Produtos</template>
        <template #content>
          <div class="text-3xl font-semibold">{{ totalDeProdutos }}</div>
          <div class="text-slate-500 text-sm mt-1">itens cadastrados</div>
        </template>
      </Card>
      <Card>
        <template #title>Ativos</template>
        <template #content>
          <div class="text-3xl font-semibold">{{ produtosAtivos }}</div>
          <div class="text-slate-500 text-sm mt-1">disponíveis</div>
        </template>
      </Card>
      <Card>
        <template #title>Inativos</template>
        <template #content>
          <div class="text-3xl font-semibold">{{ produtosInativos }}</div>
          <div class="text-slate-500 text-sm mt-1">ocultos ou bloqueados</div>
        </template>
      </Card>
      <Card>
        <template #title>Saldo no período</template>
        <template #content>
          <div class="text-3xl font-semibold" :class="saldoGeralNoPeriodo >= 0 ? 'text-emerald-600' : 'text-rose-600'">
            {{ saldoGeralNoPeriodo }}
          </div>
          <div class="text-slate-500 text-sm mt-1">
            Entradas: {{ entradasNoPeriodo }} • Saídas: {{ saidasNoPeriodo }}
          </div>
        </template>
      </Card>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <template #title>Top produtos mais movimentados</template>
        <template #content>
          <DataTable :value="topMaisMovimentados" :loading="carregando" size="small" class="w-full">
            <Column field="nome" header="Produto" />
            <Column field="sku" header="SKU" style="width: 160px" />
            <Column field="total" header="Movimentado" style="width: 150px" />
          </DataTable>
        </template>
      </Card>

      <Card>
        <template #title>Produtos por categoria</template>
        <template #content>
          <DataTable :value="distribuicaoPorCategoria" :loading="carregando" size="small" class="w-full">
            <Column field="nome" header="Categoria" />
            <Column field="quantidade" header="Quantidade" style="width: 140px" />
          </DataTable>
          <div class="text-xs text-slate-500 mt-2">
            Quando um produto não possui categoria, ele aparece como “Sem categoria”.
          </div>
        </template>
      </Card>
    </div>

    <Card>
      <template #title>Movimentos recentes</template>
      <template #content>
        <DataTable :value="movimentosRecentes" :loading="carregando" size="small" class="w-full">
          <Column field="id" header="ID" style="width: 90px" />
          <Column header="Produto">
            <template #body="{ data }">
              {{ data.nome_do_produto }}
            </template>
          </Column>
          <Column field="quantidade" header="Quantidade" style="width: 140px" />
          <Column header="Motivo" style="width: 150px">
            <template #body="{ data }">
              <Tag :value="data.motivo" :severity="corMotivo(data.motivo)" />
            </template>
          </Column>
          <Column field="tipo" header="Tipo" style="width: 220px" />
          <Column header="Data" style="width: 190px">
            <template #body="{ data }">
              {{ formatarData(data.criado_em) }}
            </template>
          </Column>
        </DataTable>
      </template>
    </Card>

    <Toast />
  </div>
</template>

<style scoped>
:deep(.p-card) { border-radius: 0.75rem; }
</style>
