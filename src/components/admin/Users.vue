<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-users'}, icon: 'fa-users', text: 'Utilisateurs', isActive: true}]" />
    </div>
    <div class="hero-body has-padding-horizontal-7">
      <div class="container box">
        <b-loading v-model="isLoading" :is-full-page="false" />
        <div class="field">
          <p class="control has-icons-left">
            <input v-model="search" class="input" type="text" placeholder="Rechercher un utilisateur">
            <span class="icon is-small is-left"><i class="fas fa-search" /></span>
          </p>
        </div>
        <div class="table-wrapper">
          <table class="table is-striped is-fullwidth is-vertical-centered">
            <thead>
              <tr>
                <th>Login</th>
                <th>Adresse mail</th>
                <th>Rôles</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filtered" :key="user.id" @click="editUser(user.id)">
                <td>{{ user.login }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.roles }}</td>
                <td><i class="fas fa-fw" :class="user.isActive ? 'fa-toggle-on has-text-success' : 'fa-toggle-off has-text-grey'" :title="user.isActive ? 'Actif' : 'Inactif'" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <span class="buttons">
          <button class="button is-primary" @click="getUsers()">
            <span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span>
          </button>
          <button class="button is-primary" @click="createUser()">
            <span class="icon"><i class="fa fa-plus-circle" /></span><span>Créer</span>
          </button>
        </span>
      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'

export default {
  name: 'Users',
  components: {
    Breadcrumb,
  },
  data () {
    return {
      search: '',
      users: [],
      isLoading: false,
    }
  },
  computed: {
    filtered () { return this.users.filter((user) => user.login.toLowerCase().indexOf(this.search.toLowerCase()) > -1) },
  },
  mounted () {
    this.getUsers()
  },
  methods: {
    async getUsers () {
      this.isLoading = true
      const users = await this.$Provider.getUsers()
      this.users = users.map((user) => {
        if (user.roles) {
          user.roles = user.roles.join(', ')
        }
        return user
      })
      this.isLoading = false
    },
    async createUser () {
      try {
        const userCreated = await this.$Provider.createUser({
          login: 'Nouveau',
          password: 'pass',
        })
        this.users.push(userCreated)
        this.$router.push({ name: 'admin-user', params: { id: userCreated.id } })
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
    },
    editUser (id) {
      this.$router.push({ name: 'admin-user', params: { id } })
    },
  },
}
</script>
