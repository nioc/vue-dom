<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {}, icon: 'fa-tools', text: 'Admin', isActive: true}]" />
    </div>
    <div class="hero-body">
      <div class="container box">
        <h2 class="title">Administration</h2>
        <ul class="is-size-5">
          <li><router-link :to="{name: 'admin-users'}"><i class="fa fa-users fa-fw fa-mr" />Utilisateurs</router-link></li>
        </ul>
      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'

export default {
  name: 'Admin',
  components: {
    Breadcrumb,
  },
}
</script>
