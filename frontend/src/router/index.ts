import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginUser from '@/views/utilisateur/LoginUser.vue'
import { useAuthStore } from '@/stores/authStore';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },  // Protection de la route
    },
    {
      path: '/login',
      name: 'login',
      component: LoginUser,
    },
    { path: '/inscription', component: () => import('@/views/utilisateur/SignUp.vue') },
    /////////ROUTER BACK-OFFICE MACHINE////////////////////////
    { path: '/modele', component: () => import('@/views/machine/ModeleView.vue'), meta: { requiresAuth: true }, },
    { path: '/type', component: () => import('@/views/machine/TypeView.vue'), meta: { requiresAuth: true }, },
    { path: '/nom_machine', component: () => import('@/views/machine/NomMachineView.vue'), meta: { requiresAuth: true }, },
    { path: '/marque', component: () => import('@/views/machine/MarqueView.vue'), meta: { requiresAuth: true }, },

    /////////ROUTER BACK-OFFICE ATELIER////////////////////////
    { path: '/endroit', component: () => import('@/views/atelier/EndroitView.vue'), meta: { requiresAuth: true }, },
  ]
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Si la route nécessite l'authentification et que l'utilisateur n'est pas connecté
    next({ name: 'login' });
  } else {
    next();  
  }
});

export default router
