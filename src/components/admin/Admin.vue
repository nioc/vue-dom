<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {}, icon: 'fa-tools', text: 'Admin', isActive: true}]" />
    </div>
    <div class="hero-body">
      <div class="container box">
        <h2 class="title">Administration</h2>
        <ul class="is-size-5">
          <li><router-link :to="{name: 'admin-system'}"><i class="fa fa-server fa-fw fa-mr" />Système</router-link></li>
          <li><router-link :to="{name: 'admin-users'}"><i class="fa fa-users fa-fw fa-mr" />Utilisateurs</router-link></li>
          <li><router-link :to="{name: 'admin-rooms'}"><i class="fa fa-home fa-fw fa-mr" />Pièces</router-link></li>
          <li><router-link :to="{name: 'admin-equipments'}"><i class="fa fa-microchip fa-fw fa-mr" />Équipements</router-link></li>
          <li><router-link :to="{name: 'admin-states'}"><i class="fa fa-eye fa-fw fa-mr" />États</router-link></li>
          <li><router-link :to="{name: 'admin-actions'}"><i class="fa fa-cogs fa-fw fa-mr" />Actions</router-link></li>
          <li><router-link :to="{name: 'admin-views'}"><i class="fa fa-binoculars fa-fw fa-mr" />Vues utilisateur</router-link></li>
          <li><router-link :to="{name: 'admin-scenarios'}"><i class="fa fa-book fa-fw fa-mr" />Scénarios</router-link></li>
          <li><router-link :to="{name: 'admin-nlp'}"><i class="fa fa-brain fa-fw fa-mr" />Traitement automatique du langage naturel</router-link></li>
          <li><router-link :to="{name: 'admin-channels'}"><i class="fa fa-comments fa-fw fa-mr" />Canaux de communication</router-link></li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb.vue'

export default {
  name: 'Admin',
  components: {
    Breadcrumb,
  },
}
</script>
