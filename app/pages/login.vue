<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from '#app'
import { useToast } from 'primevue/usetoast'
import { useAuth } from '@/composables/useAuth'

definePageMeta({
  layout: 'login',
  middleware: ['guest-only']
})

const usuario = ref('')
const senha = ref('')
const formularioEnviado = ref(false)
const carregandoRequisicao = ref(false)
const redirecionando = ref(false)
const mensagemErro = ref('')

const toast = useToast()
const rota = useRoute()

const proximaRota = computed(() => {
  const rotaDestino = String(rota.query.next || '/home')
  return rotaDestino === '/login' ? '/home' : rotaDestino
})

const ocupado = computed(() => carregandoRequisicao.value || redirecionando.value)
const textoOcupado = computed(() => (redirecionando.value ? 'Entrando…' : 'Acessando…'))

const { login } = useAuth()

onMounted(() => {
  const elemento = document.querySelector('input[autocomplete="username"]')
  if (elemento) elemento.focus()
})

async function aoEnviarFormulario () {
  if (ocupado.value) return

  formularioEnviado.value = true
  mensagemErro.value = ''

  if (!usuario.value || !senha.value) {
    mensagemErro.value = 'Preencha e-mail e senha.'
    toast.add({ severity: 'warn', summary: 'Campos obrigatórios', detail: 'Informe e-mail e senha.', life: 2000 })
    return
  }

  carregandoRequisicao.value = true
  redirecionando.value = false

  try {
    await login(usuario.value, senha.value)

    toast.add({
      severity: 'success',
      summary: 'Bem-vindo!',
      detail: 'Login realizado com sucesso.',
      life: 1500
    })

    carregandoRequisicao.value = false
    redirecionando.value = true

    await new Promise(resolve => setTimeout(resolve, 2500))

    await navigateTo(proximaRota.value, { replace: true })
  } catch (erro) {
    carregandoRequisicao.value = false
    redirecionando.value = false

    const mensagem =
      erro?.response?.data?.message ||
      erro?.response?.data?.error ||
      erro?.message ||
      'Falha no login.'
    mensagemErro.value = mensagem

    toast.add({
      severity: 'error',
      summary: 'Falha no login',
      detail: mensagem,
      life: 2000
    })
  }
}

</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-white px-6 relative">
    <Toast />

    <div
      v-if="ocupado"
      class="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50"
    >
      <ProgressSpinner style="width:60px;height:60px" />
      <p class="mt-4 text-slate-700 font-medium">{{ textoOcupado }}</p>
    </div>

    <div class="w-full max-w-2xl rounded-3xl p-12 bg-white border border-slate-350 shadow-xl/30">
      <div class="flex justify-center mb-6">
        <img src="@/assets/img/logomarca_unifsa_branca.png" alt="Logo" class="h-32 object-contain" />
      </div>

      <p class="text-[#0b1324] font-bold text-center mb-2 text-3xl">Juizado Especial</p>
      <h1 class="text-[#0b1324] text-2xl font-semibold text-center mb-6">Entrar</h1>
      <p class="text-[#0b1324] font-medium text-center mb-6">Acesse sua conta</p>

      <Message
        v-if="mensagemErro"
        severity="error"
        :closable="true"
        class="mb-4"
        @close="mensagemErro = ''"
      >
        {{ mensagemErro }}
      </Message>

      <form class="flex flex-col gap-4" @submit.prevent="aoEnviarFormulario">
        <IconField icon-position="left">
          <InputIcon class="pi pi-user text-slate-600" />
          <InputText
            v-model.trim="usuario"
            placeholder="E-mail"
            autocomplete="username"
            fluid
            :disabled="ocupado"
            :invalid="formularioEnviado && !usuario"
            @input="mensagemErro = ''"
            :pt="{ root:{ class:'!h-12 !rounded-xl !bg-white !text-slate-900 !placeholder-slate-500 !border !border-slate-300 focus:!ring-2 focus:!ring-[#3B5BFF]/35 focus:!border-[#3B5BFF]' } }"
          />
        </IconField>

        <IconField icon-position="left">
          <InputIcon class="pi pi-key text-slate-600" />
          <Password
            v-model="senha"
            :feedback="false"
            toggle-mask
            fluid
            :disabled="ocupado"
            :input-props="{ placeholder:'Senha', autocomplete:'current-password' }"
            :invalid="formularioEnviado && !senha"
            @input="mensagemErro = ''"
            :pt="{
              pcInputText:{ root:'!h-12 !rounded-xl !bg-white !text-slate-900 !placeholder-slate-500 !border !border-slate-300 pl-10 pr-12 focus:!ring-2 focus:!ring-[#3B5BFF]/35 focus:!border-[#3B5BFF]' },
              panel:{ class:'hidden' },
              toggleMaskIcon:{ class:'text-slate-600' }
            }"
          />
        </IconField>

        <Button
          type="submit"
          :label="carregandoRequisicao ? 'ACESSANDO…' : (redirecionando ? 'ENTRANDO…' : 'ACESSAR')"
          :loading="ocupado"
          :disabled="ocupado"
          class="font-bold !h-12 !rounded-xl"
          :pt="{ root:{ class:'!bg-[#3B5BFF] hover:!bg-[#2f4be0]' } }"
        />
      </form>
    </div>
  </div>
</template>

<style scoped>
:deep(.p-password .p-password-toggle-mask-icon){ color: rgb(71 85 105); }
</style>
