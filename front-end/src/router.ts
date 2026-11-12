import { createRouter, createWebHistory } from 'vue-router'

declare module 'vue-router' {
  interface RouteMeta { titulo?: string }
}

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'painel', component: () => import('./views/DashboardView.vue'), meta: { titulo: 'Painel' } },
    { path: '/chamados', name: 'chamados', component: () => import('./views/ChamadosView.vue'), meta: { titulo: 'Chamados' } },
    { path: '/chamados/novo', name: 'chamado-novo', component: () => import('./views/ChamadoFormView.vue'), meta: { titulo: 'Abrir chamado' } },
    { path: '/chamados/:id(\\d+)', name: 'chamado', component: () => import('./views/ChamadoDetalheView.vue'), props: true, meta: { titulo: 'Chamado' } },
    { path: '/chamados/:id(\\d+)/editar', name: 'chamado-editar', component: () => import('./views/ChamadoFormView.vue'), props: true, meta: { titulo: 'Editar chamado' } },
    { path: '/clientes', name: 'clientes', component: () => import('./views/ClientesView.vue'), meta: { titulo: 'Clientes' } },
    { path: '/clientes/:id(\\d+)', name: 'cliente', component: () => import('./views/ClienteDetalheView.vue'), props: true, meta: { titulo: 'Cliente' } },
    { path: '/categorias', name: 'categorias', component: () => import('./views/CategoriasView.vue'), meta: { titulo: 'Categorias' } },
    { path: '/tecnicos', name: 'tecnicos', component: () => import('./views/TecnicosView.vue'), meta: { titulo: 'Técnicos' } },
    { path: '/:pathMatch(.*)*', name: 'nao-encontrada', component: () => import('./views/NotFoundView.vue'), meta: { titulo: 'Página não encontrada' } },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  document.title = `${to.meta.titulo ?? 'Chamados'} · Chamados`
})
