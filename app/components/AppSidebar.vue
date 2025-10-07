<script setup>
import { computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from '#app'

const route = useRoute()
const router = useRouter()

const collapsed = useState('sidebarCollapsed', () => false)
const hide = computed(() => route.path === '/login')

const isActive = (to) =>
  !!to && (route.path === to || route.path.startsWith(to.endsWith('/') ? to : to + '/'))

const itensPrincipais = [
  { rotulo: 'Home',                icone: 'pi pi-home',    to: '/home' },
  { rotulo: 'Produtos',            icone: 'pi pi-box',     to: '/produtos' },
  { rotulo: 'Movimento de Estoque',icone: 'pi pi-refresh', to: '/movimentos' },
]

const itensAdministracao = [
  { rotulo: 'Usuários', icone: 'pi pi-users', to: '/admin/usuarios' },
]

const sidebarStyle = computed(() => ({
  '--sidebar-w': collapsed.value ? '68px' : '16rem',
  '--sb-dur': '420ms',
  '--sb-ease': 'cubic-bezier(.22,.72,.08,1)'
}))

const previousBackground = { body: '', html: '' }
const sidebarBackground = '#0b1324'
const loginBackground = '#ffffff'

function applyGlobalBackground() {
  const color = hide.value ? loginBackground : sidebarBackground
  document.body.style.background = color
  document.documentElement.style.background = color
}

onMounted(() => {
  previousBackground.body = document.body.style.background
  previousBackground.html = document.documentElement.style.background
  applyGlobalBackground()
})

watch(hide, applyGlobalBackground)

onBeforeUnmount(() => {
  document.body.style.background = previousBackground.body
  document.documentElement.style.background = previousBackground.html
})

function logout() {
  try {
    localStorage.removeItem('token')
    localStorage.removeItem('auth')
    sessionStorage.clear()
  } catch {}
  router.push('/login')
}
</script>

<template>
  <aside v-if="!hide" class="sidebar" :data-collapsed="collapsed" :style="sidebarStyle">
    <div class="top" @click="$router.push('/home')" title="Ir para Home">
      <transition name="fade">
        <img v-if="!collapsed" src="@/assets/img/logosuper.png" alt="Logo" class="logo" />
      </transition>
      <button class="toggle" @click.stop="collapsed = !collapsed" :title="collapsed ? 'Expandir' : 'Recolher'">
        <i :class="collapsed ? 'pi pi-angle-right' : 'pi pi-angle-left'"></i>
      </button>
    </div>

    <div class="body">
      <nav class="stack">
        <NuxtLink
          v-for="item in itensPrincipais"
          :key="item.to"
          :to="item.to"
          class="row"
          :class="isActive(item.to) ? 'active' : ''"
          :title="collapsed ? item.rotulo : undefined"
        >
          <div class="ico"><i :class="item.icone" /></div>
          <div class="label"><span class="txt">{{ item.rotulo }}</span></div>
        </NuxtLink>
      </nav>

      <div class="section">
        <span class="rule"></span>
        <span class="title">Administração</span>
      </div>

      <nav class="stack">
        <NuxtLink
          v-for="item in itensAdministracao"
          :key="item.to"
          :to="item.to"
          class="row"
          :class="isActive(item.to) ? 'active' : ''"
          :title="collapsed ? item.rotulo : undefined"
        >
          <div class="ico"><i :class="item.icone" /></div>
          <div class="label"><span class="txt">{{ item.rotulo }}</span></div>
        </NuxtLink>
      </nav>
    </div>

    <div class="footer">
      <button class="logout" @click="logout" :title="collapsed ? 'Sair' : undefined">
        <i class="pi pi-sign-out"></i>
        <span class="logout-text">Sair</span>
      </button>
    </div>
  </aside>
</template>

<style scoped>
.sidebar{position:sticky;left:0;top:0;z-index:40;display:flex;flex-direction:column;height:100svh;width:var(--sidebar-w,16rem);background:#0b1324;color:#fff;border-right:1px solid rgba(15,23,42,.35);transition:width var(--sb-dur,420ms) var(--sb-ease,cubic-bezier(.22,.72,.08,1))}
.top{position:relative;display:flex;align-items:center;justify-content:center;height:128px;border-bottom:1px solid rgba(255,255,255,.05);cursor:pointer}
.logo{height:144px;object-fit:contain;filter:drop-shadow(0 0 4px rgba(0,0,0,.4));transition:transform .3s ease}
.logo:hover{transform:scale(1.05)}
.toggle{position:absolute;right:10px;top:22%;transform:translateY(-50%);height:40px;width:40px;border-radius:9999px;border:1px solid #fff;background:#0b1324;color:#fff;display:grid;place-items:center;box-shadow:0 2px 8px rgba(0,0,0,.35)}
.body{flex:1;overflow-y:auto;padding:8px 8px 16px}
.stack{display:flex;flex-direction:column;gap:8px}
.row{display:flex;align-items:center;height:40px;padding:0 8px;border-radius:.5rem;color:rgba(255,255,255,.85);text-decoration:none;gap:10px;transition:background-color 180ms ease,color 180ms ease}
.row:hover{background:rgba(255,255,255,.08);color:#fff}
.row.active{background:rgba(255,255,255,.12);color:#fff}
.row .ico{width:28px;display:flex;justify-content:center;align-items:center}
.row .ico i{font-size:18px;line-height:1}
.row .label{flex:1;min-width:0;max-width:100%;overflow:hidden;transition:max-width var(--sb-dur,420ms) var(--sb-ease,cubic-bezier(.22,.72,.08,1)),opacity var(--sb-dur,420ms) var(--sb-ease,cubic-bezier(.22,.72,.08,1))}
.row .txt{display:block;white-space:nowrap;text-align:left}
.section{position:relative;display:flex;align-items:center;height:18px;padding:0 10px;margin:16px 0 8px}
.section .title{font-size:.75rem;text-transform:uppercase;letter-spacing:.06em;color:rgba(148,163,184,1);transition:opacity var(--sb-dur,420ms) var(--sb-ease,cubic-bezier(.22,.72,.08,1))}
.section .rule{position:absolute;left:10px;right:10px;top:50%;height:1px;background:rgba(255,255,255,.1);transform:translateY(-50%);opacity:0;transition:opacity var(--sb-dur,420ms) var(--sb-ease,cubic-bezier(.22,.72,.08,1))}
.sidebar[data-collapsed="true"] .row{gap:6px}
.sidebar[data-collapsed="true"] .row .label{max-width:0;opacity:0}
.sidebar[data-collapsed="true"] .section .title{opacity:0}
.sidebar[data-collapsed="true"] .section .rule{opacity:.6}
.footer{padding:10px;border-top:1px solid rgba(255,255,255,.05)}
.logout{width:100%;display:flex;align-items:center;justify-content:center;gap:10px;height:40px;border-radius:.5rem;border:1px solid rgba(255,255,255,.25);background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02));color:#fff;cursor:pointer;transition:background-color .18s ease,transform .18s ease}
.logout:hover{background:rgba(255,255,255,.12)}
.logout:active{transform:translateY(1px)}
.logout-text{white-space:nowrap}
.fade-enter-active,.fade-leave-active{transition:opacity .45s ease}
.fade-enter-from,.fade-leave-to{opacity:0}
</style>
