<script setup lang="ts">
const links = [
  { to: '/', rotulo: 'Painel', exato: true },
  { to: '/chamados', rotulo: 'Chamados' },
  { to: '/clientes', rotulo: 'Clientes' },
  { to: '/categorias', rotulo: 'Categorias' },
  { to: '/tecnicos', rotulo: 'Técnicos' },
]
</script>

<template>
  <!-- Z, traço 1: marca à esquerda, navegação e ação principal à direita -->
  <header class="topbar">
    <div class="container topbar__inner">
      <RouterLink to="/" class="brand">
        <svg viewBox="0 0 28 28" width="30" height="30" aria-hidden="true">
          <path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h17A2.5 2.5 0 0 1 25 8.5v2.6a3 3 0 0 0 0 5.8v2.6a2.5 2.5 0 0 1-2.5 2.5h-17A2.5 2.5 0 0 1 3 19.5v-2.6a3 3 0 0 0 0-5.8Z" fill="none" stroke="#ffc82e" stroke-width="2" stroke-linejoin="round" />
          <path d="M18.5 9v2M18.5 13v2M18.5 17v2" stroke="#ffc82e" stroke-width="2" stroke-linecap="round" />
        </svg>
        Chamados
      </RouterLink>
      <nav class="nav" aria-label="Principal">
        <RouterLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="nav__link"
          :active-class="l.exato ? '' : 'is-active'"
          exact-active-class="is-active"
        >
          {{ l.rotulo }}
        </RouterLink>
      </nav>
      <RouterLink to="/chamados/novo" class="btn btn--primary">Abrir chamado</RouterLink>
    </div>
  </header>
</template>
