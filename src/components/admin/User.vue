<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-users'}, icon: 'fa-users', text: 'Utilisateurs'}, {link: {name: 'admin-user', params: {id}}, text: user.login, isActive: true}]" />
    </div>
    <div class="hero-body has-padding-horizontal-7">
      <div class="container box">
        <b-loading v-model="isLoading" :is-full-page="false" />
        <div class="field is-required">
          <label class="label">Login</label>
          <div class="control has-icons-left">
            <input v-model="user.login" class="input" type="text" placeholder="Nom d'utilisateur">
            <span class="icon is-small is-left">
              <i class="fas fa-user" />
            </span>
          </div>
        </div>
        <div class="field is-required">
          <label class="label">Adresse mail</label>
          <div class="control has-icons-left">
            <input v-model="user.email" class="input" type="email" placeholder="Adresse mail">
            <span class="icon is-small is-left">
              <i class="fas fa-envelope" />
            </span>
          </div>
        </div>
        <div class="field">
          <div class="control">
            <label class="label">Statut</label>
            <b-switch v-model="user.isActive">{{ user.isActive ? 'Actif' : 'Inactif' }}</b-switch>
          </div>
        </div>
        <div class="field">
          <div class="control">
            <label class="label">Rôles</label>
            <div v-for="role in roles" :key="role" class="control">
              <label class="checkbox">
                <input v-model="user.roles" type="checkbox" :value="role">
                {{ role }}
              </label>
            </div>
          </div>
        </div>
        <div class="buttons">
          <button class="button is-primary" title="Sauvegarder" @click="updateUser()">
            <span class="icon"><i class="fa fa-save" /></span><span>Sauvegarder</span>
          </button>
          <button class="button is-light" title="Générer un token" @click="requestToken()">
            <span class="icon"><i class="fa fa-key" /></span><span>Générer un token</span>
          </button>
          <button class="button is-danger" title="Supprimer l'utilisateur" @click="removeUser()">
            <span class="icon"><i class="fa fa-trash" /></span><span>Supprimer</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import { UnsavedChangesGuardMixin } from '@/mixins/UnsavedChangesGuard'

export default {
  name: 'Users',
  components: {
    Breadcrumb,
  },
  mixins: [
    UnsavedChangesGuardMixin,
  ],
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      user: {},
      roles: this.$Provider.getAllRoles(),
      isLoading: false,
    }
  },
  mounted () {
    this.getUser()
  },
  methods: {
    async getUser () {
      this.isLoading = true
      this.user = await this.$Provider.getUser(this.id)
      if (!this.user.roles) {
        this.user.roles = []
      }
      this.addUnsavedChangesGuard('user')
      this.isLoading = false
    },
    async updateUser () {
      this.isLoading = true
      try {
        await this.$Provider.updateUser(this.user)
        this.addUnsavedChangesGuard('user')
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    async removeUser () {
      this.isLoading = true
      try {
        await this.$Provider.deleteUser(this.user.id)
        this.isLoading = false
        this.removeUnsavedChangesGuard('user')
        this.$router.back()
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
    },
    async requestToken () {
      this.isLoading = true
      try {
        const refreshToken = await this.$Provider.requestUserRefreshToken(this.user.id)
        this.$buefy.dialog.alert({
          title: 'Refresh token',
          message: `<p class="is-selectable-all is-family-code">${refreshToken.token}</p><br/><p>Note : ce token ne sera plus consultable ultérieurement</p>`,
          hasIcon: true,
          icon: 'key',
          iconPack: 'fa',
        })
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
  },
}
</script>
