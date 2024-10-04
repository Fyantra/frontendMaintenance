<script setup lang="ts">
import NavBar from "./NavBar.vue";
import { RouterLink } from "vue-router";

import { ChartBarIcon } from "@heroicons/vue/20/solid";
</script>

<template>
  <div class="wrapper">
    <NavBar />

    <aside
      class="sidebar-left border-right bg-white shadow"
      id="leftSidebar"
      data-simplebar
    >
      <a
        href="#"
        class="btn collapseSidebar toggle-btn d-lg-none text-muted ml-2 mt-3"
        data-toggle="toggle"
      >
        <i class="fe fe-x"><span class="sr-only"></span></i>
      </a>
      <nav class="vertnav navbar navbar-light">
        <!-- nav bar -->
        <div class="w-100 mb-4 d-flex logo-container">
          <RouterLink
            class="navbar-brand mx-auto mt-2 flex-fill text-center logo-link"
            to="/"
          >
            AKANJO MAINTENANCE
          </RouterLink>
        </div>
        <ul class="navbar-nav flex-fill w-100 mb-2">
          <li class="nav-item dropdown">
            <a
              href="#dashboard"
              data-toggle="collapse"
              aria-expanded="false"
              class="dropdown-toggle nav-link"
            >
              <ChartBarIcon class="heroicons" />
              <span class="ml-3 item-text">Tableau de bord</span>
            </a>
            <ul class="collapse list-unstyled pl-4 w-100" id="dashboard"></ul>
          </li>
        </ul>
        <p class="text-muted nav-heading mt-4 mb-1">
          <span>BACK-OFFICE</span>
        </p>
        <ul class="navbar-nav flex-fill w-100 mb-2">
          <li class="nav-item dropdown">
            <a
              href="#machines"
              data-toggle="collapse"
              aria-expanded="false"
              class="dropdown-toggle nav-link"
            >
              <i class="material-icons">precision_manufacturing</i>
              <span class="ml-3 item-text">Machine</span>
            </a>
            <ul class="collapse list-unstyled pl-4 w-100" id="machines">
              <li class="nav-item active">
                <RouterLink class="nav-link pl-3" to="/modele"
                  ><span class="ml-1 item-text">Modele</span></RouterLink
                >
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link pl-3" to="/type"
                  ><span class="ml-1 item-text">Type</span></RouterLink
                >
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link pl-3" to="/nom_machine"
                  ><span class="ml-1 item-text">Nom machine</span></RouterLink
                >
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link pl-3" to="/marque"
                  ><span class="ml-1 item-text">Marque</span></RouterLink
                >
              </li>
            </ul>
          </li>

          <li class="nav-item dropdown">
            <a
              href="#ateliers"
              data-toggle="collapse"
              aria-expanded="false"
              class="dropdown-toggle nav-link"
            >
              <i class="material-icons">engineering</i>
              <span class="ml-3 item-text">Atelier</span>
            </a>
            <ul class="collapse list-unstyled pl-4 w-100" id="ateliers">
              <li class="nav-item">
                <RouterLink class="nav-link pl-3" to="/chaine"
                  ><span class="ml-1 item-text">Chaine</span></RouterLink
                >
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link pl-3" to="/endroit"
                  ><span class="ml-1 item-text">Endroit</span></RouterLink
                >
              </li>
              <li class="nav-item">
                <RouterLink class="nav-link pl-3" to="/responsable"
                  ><span class="ml-1 item-text">Responsable</span></RouterLink
                >
              </li>
            </ul>
          </li>
        </ul>
        <p class="text-muted nav-heading mt-4 mb-1">
          <span>Apps</span>
        </p>
        <ul class="navbar-nav flex-fill w-100 mb-2">
          <li class="nav-item w-100">
            <a class="nav-link" href="calendar.html">
              <i class="fe fe-calendar fe-16"></i>
              <span class="ml-3 item-text">Calendar</span>
            </a>
          </li>
        </ul>
        <p class="text-muted nav-heading mt-4 mb-1">
          <span>Extra</span>
        </p>
        <ul class="navbar-nav flex-fill w-100 mb-2">
          <li class="nav-item dropdown">
            <a
              href="#pages"
              data-toggle="collapse"
              aria-expanded="false"
              class="dropdown-toggle nav-link"
            >
              <i class="fe fe-file fe-16"></i>
              <span class="ml-3 item-text">Pages</span>
            </a>
            <ul class="collapse list-unstyled pl-4 w-100 w-100" id="pages">
              <li class="nav-item">
                <a class="nav-link pl-3" href="./page-orders.html">
                  <span class="ml-1 item-text">Orders</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link pl-3" href="./page-timeline.html">
                  <span class="ml-1 item-text">Timeline</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link pl-3" href="./page-invoice.html">
                  <span class="ml-1 item-text">Invoice</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link pl-3" href="./page-404.html">
                  <span class="ml-1 item-text">Page 404</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link pl-3" href="./page-500.html">
                  <span class="ml-1 item-text">Page 500</span>
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link pl-3" href="./page-blank.html">
                  <span class="ml-1 item-text">Blank</span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </aside>
  </div>
</template>

<style>
/* Container du logo */
.logo-container {
  /* display: flex; */
  justify-content: center;
  align-items: center;
  height: 70px;
  /* background: linear-gradient(135deg, #1b68ff, #17a2b8); */
  border-radius: 30px;
  border-style: solid;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out;
}

.logo-container:hover {
  transform: scale(1.05); /* Agrandir légèrement au survol */
}

/* Lien du logo */
.logo-link {
  font-family: "Poppins", sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 4px;
  text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
  position: relative;
  transition: color 0.3s ease-in-out, text-shadow 0.3s ease-in-out;
}

.logo-link::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 3px;
  bottom: -5px;
  left: 0;
  background-color: #fff;
  visibility: hidden;
  transform: scaleX(0);
  transition: all 0.3s ease-in-out;
}

.logo-link:hover {
  color: #ffc107;
  text-shadow: 2px 2px 15px rgba(255, 193, 7, 0.7);
}

.logo-link:hover::before {
  visibility: visible;
  transform: scaleX(1);
}
</style>

<style scoped>
.heroicons {
  width: 21px;
  height: 21px;
}

.material-icons {
  line-height: 0;
  vertical-align: middle;
  font-size: 19px;
}
</style>
