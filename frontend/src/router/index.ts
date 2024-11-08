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
    { path: '/status', component: () => import('@/views/machine/StatusView.vue'), meta: { requiresAuth: true }, },

    { path: '/listeMachine', component: () => import('@/views/machine/ListeMachine.vue'), meta: { requiresAuth: true }, },
    { path: '/ajoutMachine', component: () => import('@/views/machine/FormMachine.vue'), meta: { requiresAuth: true }, },
    {
      path: '/detailMachine/:id',
      name: 'detailMachine',
      component: () => import('@/views/machine/DetailMachine.vue'),
      meta: { requiresAuth: true },
    },

    {
      path: '/modifierMachine/:id',
      name: 'modifierMachine',
      component: () => import('@/views/machine/FormMachine.vue'),
      meta: { requiresAuth: true },
    },

    /////////ROUTER INVENTAIRE MACHINE////////////////////////
    { path: '/inventaireMachine', component: () => import('@/views/machine/InventaireMachine.vue'), meta: { requiresAuth: true }, },
    // { path: '/inventaireMachine', component: () => import('@/views/piece_detache/FormExemple.vue'), meta: { requiresAuth: true }, },

    /////////ROUTER BACK-OFFICE ATELIER////////////////////////
    { path: '/endroit', component: () => import('@/views/atelier/EndroitView.vue'), meta: { requiresAuth: true }, },
    { path: '/atelier', component: () => import('@/views/atelier/AtelierView.vue'), meta: { requiresAuth: true }, },
    { path: '/chaine', component: () => import('@/views/atelier/ChaineView.vue'), meta: { requiresAuth: true }, },

    /////////ROUTER BACK-OFFICE FOURNISSEUR////////////////////////
    { path: '/fournisseur', component: () => import('@/views/fournisseur/FournisseurView.vue'), meta: { requiresAuth: true }, },

    /////////ROUTER PIECE DETACHE////////////////////////
    { path: '/listePiecedetache', component: () => import('@/views/piece_detache/ListePieceDetache.vue'), meta: { requiresAuth: true }, },
    { path: '/ajoutPiecedetache', component: () => import('@/views/piece_detache/FormPieceDetache.vue'), meta: { requiresAuth: true }, },
    {
      path: '/detailPieceDetache/:id',
      name: 'detailPieceDetache',
      component: () => import('@/views/piece_detache/DetailPieceDetache.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/modifierPieceDetache/:id',
      name: 'modifierPieceDetache',
      component: () => import('@/views/piece_detache/FormPieceDetache.vue'),
      meta: { requiresAuth: true },
    },

    { path: '/test', component: () => import('@/views/piece_detache/ExempleListe.vue'), meta: { requiresAuth: true }, },
  ],

  scrollBehavior(to, from, savedPosition) {
    // Si une position sauvegardée existe on la réutilise
    if (savedPosition) {
      return savedPosition;
    } else {
      // Sinon, on defile toujours vers le haut de la page
      return { top: 0, behavior: 'smooth' };
    }
  }
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
