<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Dropdown from 'primevue/dropdown'
import ConfirmDialog from 'primevue/confirmdialog'
import Toast from 'primevue/toast'
import Tag from 'primevue/tag'

import useUsuarioService from '@/services/usuarios'

const notificacao = useToast()
const confirmacao = useConfirm()
const { listar, criar, atualizar, excluir } = useUsuarioService()

const indicadorCarregando = ref(false)
const listaUsuarios = ref([])
const textoBusca = ref('')

const dialogoVisivel = ref(false)
const modoEdicao = ref(false)

const roles = [
  { rotulo: 'ADMIN', valor: 'ADMIN' },
  { rotulo: 'USER', valor: 'USER' }
]

const formulario = ref({
  id: null,
  username: '',
  password: '',
  role: 'USER'
})

const usuariosFiltrados = computed(() => {
  const q = textoBusca.value.trim().toLowerCase()
  if (!q) return listaUsuarios.value
  return listaUsuarios.value.filter(u =>
    [u.username, u.role].some(x => String(x ?? '').toLowerCase().includes(q))
  )
})

async function carregar() {
  try {
    indicadorCarregando.value = true
    listaUsuarios.value = await listar()
  } catch (e) {
    erro('Falha ao carregar usuários', e)
  } finally {
    indicadorCarregando.value = false
  }
}

function novo() {
  modoEdicao.value = false
  formulario.value = { id: null, username: '', password: '', role: 'USER' }
  dialogoVisivel.value = true
}

function editar(row) {
  modoEdicao.value = true
  formulario.value = { id: row.id, username: row.username || '', password: '', role: row.role || 'USER' }
  dialogoVisivel.value = true
}

async function salvar() {
  try {
    const payload = {
      username: String(formulario.value.username || '').trim(),
      role: formulario.value.role
    }
    if (!payload.username) {
      notificacao.add({ severity: 'warn', summary: 'Validação', detail: 'Informe o nome de usuário.', life: 3000 })
      return
    }
    if (modoEdicao.value) {
      const senhaEdit = String(formulario.value.password || '').trim()
      if (senhaEdit) payload.password = senhaEdit
      await atualizar(formulario.value.id, payload)
      notificacao.add({ severity: 'success', summary: 'Atualizado', detail: 'Usuário atualizado.', life: 2500 })
    } else {
      const senha = String(formulario.value.password || '').trim()
      if (!senha) {
        notificacao.add({ severity: 'warn', summary: 'Validação', detail: 'Informe a senha.', life: 3000 })
        return
      }
      payload.password = senha
      await criar(payload)
      notificacao.add({ severity: 'success', summary: 'Criado', detail: 'Usuário criado.', life: 2500 })
    }
    dialogoVisivel.value = false
    await carregar()
  } catch (erro) {
    erro('Falha ao salvar usuário', erro)
  }
}

function confirmarExclusao(row) {
  confirmacao.require({
    message: `Excluir o usuário "${row.username}"?`,
    header: 'Confirmar exclusão',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Excluir',
    rejectLabel: 'Cancelar',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await excluir(row.id)
        notificacao.add({ severity: 'success', summary: 'Excluído', detail: 'Usuário excluído.', life: 2500 })
        await carregar()
      } catch (erro) {
        erro('Falha ao excluir usuário', erro)
      }
    }
  })
}

function erro(mensagem, error) {
  const detalhe =
    error?.message ||
    error?.details ||
    error?.hint ||
    (typeof e === 'string' ? error : 'Tente novamente.')
  notificacao.add({ severity: 'error', summary: 'Erro', detail: `${mensagem}: ${detalhe}`, life: 5000 })
  console.error(error)
}

onMounted(carregar)
</script>

<template>
  <div class="max-w-none mx-auto px-8">
    <div class="flex items-center justify-between mb-5">
      <h1 class="text-2xl font-bold">Usuários</h1>
      <div class="flex items-center gap-2">
        <InputText v-model="textoBusca" placeholder="Buscar por usuário ou papel" class="w-72 md:w-96" />
        <Button label="Novo usuário" icon="pi pi-plus" @click="novo" />
      </div>
    </div>

    <DataTable
      :value="usuariosFiltrados"
      :loading="indicadorCarregando"
      dataKey="id"
      paginator
      :rows="10"
      :rowsPerPageOptions="[10,20,50,100]"
      size="small"
      class="shadow-sm rounded-lg w-full"
      :style="{ width: '100%' }"
    >
      <Column field="id" header="ID" style="width: 90px" />
      <Column field="username" header="Usuário" />
      <Column header="Papel" style="width: 180px">
        <template #body="{ data }">
          <Tag :value="data.role || '—'" />
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

    <Dialog v-model:visible="dialogoVisivel" :header="modoEdicao ? 'Editar usuário' : 'Novo usuário'" modal class="w-full md:w-2/3 lg:w-1/2">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="md:col-span-2">
          <label class="block text-sm mb-1">Usuário</label>
          <InputText v-model.trim="formulario.username" placeholder="Nome de usuário" class="w-full" />
        </div>
        <div>
          <label class="block text-sm mb-1">Senha</label>
          <Password v-model="formulario.password" :feedback="false" toggle-mask fluid :input-props="{ placeholder:'Senha' }" />
          <small v-if="modoEdicao" class="text-slate-500">Deixe em branco para manter a senha atual.</small>
        </div>
        <div>
          <label class="block text-sm mb-1">Papel</label>
          <Dropdown v-model="formulario.role" :options="roles" optionLabel="rotulo" optionValue="valor" class="w-full" />
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button label="Cancelar" severity="secondary" outlined @click="dialogoVisivel = false" />
          <Button :label="modoEdicao ? 'Salvar' : 'Criar'" icon="pi pi-check" @click="salvar" />
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
