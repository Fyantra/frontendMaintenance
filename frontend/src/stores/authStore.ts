import { defineStore } from 'pinia';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: (() => {
      try {
        return JSON.parse(localStorage.getItem('user') || 'null');
      } catch (error) {
        console.error("Aucun user detectee, invalide JSON", error);
        return null;
      }
    })(),        
    accessToken: localStorage.getItem('accessToken') || null,  
    // refreshToken: localStorage.getItem('refreshToken') || null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken,  // Authentification basée sur la présence du token
  },
  actions: {
    login(userData: any, accessToken: string) {
      this.user = userData;
      this.accessToken = accessToken;
      // this.refreshToken = refreshToken;

      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('accessToken', accessToken);
      // localStorage.setItem('refreshToken', refreshToken);
    },
    logout() {
      this.user = null;
      this.accessToken = null;
      // this.refreshToken = null;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
      // localStorage.removeItem('refreshToken');
    },

    async refreshToken() {
      try {
        const endpoint : string = "token/refresh/"
        const apiUrl = `${import.meta.env.VITE_APP_API_BASE_URL}${endpoint}`;
        const response = await axios.post(apiUrl, {
          withCredentials: true, // Permet l'utilisation de cookies
        });
        const access  = response.data;
        this.accessToken = access;
        localStorage.setItem('accessToken', access);
      } catch (error) {
        this.logout();
      }
    },

    isTokenExpired(token: string) {
      const decoded: any = jwtDecode(token);
      const exp = decoded.exp * 1000;   //conversion en milliseconde
      return Date.now() >= exp;
    },

    async checkAuth() {
      // Vérifier si l'utilisateur est toujours authentifié
      if (this.accessToken && !this.isTokenExpired(this.accessToken)) {
        return true;
      }
      await this.refreshToken();
    },
  },
  
});
