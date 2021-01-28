<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'profile'}, icon: 'fa-user', text: 'Profile', isActive: true}]" />
    </div>
    <div class="hero-body has-padding-horizontal-7">
      <div class="container">

        <div class="card has-margin-bottom-6">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-user-edit" /></span><span>Mes informations</span>
            </p>
          </header>
          <section class="card-content">
            <div class="field">
              <div class="control has-icons-left">
                <input v-model="user.login" class="input" type="text" placeholder="Nom d'utilisateur">
                <span class="icon is-small is-left">
                  <i class="fas fa-user" />
                </span>
              </div>
            </div>
            <div class="field">
              <div class="control has-icons-left">
                <input v-model="user.email" class="input" type="email" placeholder="Adresse mail">
                <span class="icon is-small is-left">
                  <i class="fas fa-envelope" />
                </span>
              </div>
            </div>
            <div class="field">
              <div class="control">
                <button class="button is-primary" @click="updateUser">
                  <span class="icon"><i class="fa fa-save" /></span><span>Sauvegarder</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        <div class="card has-margin-bottom-6">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-user-shield" /></span><span>Sécurité</span>
            </p>
          </header>
          <section class="card-content">
            <div class="field has-addons">
              <div class="control has-icons-left is-expanded">
                <input v-model="user.password" class="input" type="password" placeholder="Password">
                <span class="icon is-small is-left">
                  <i class="fas fa-key" />
                </span>
              </div>
              <div class="control">
                <button class="button is-primary" @click="updatePassword">
                  <span class="icon"><i class="fa fa-save" /></span><span>Sauvegarder</span>
                </button>
              </div>
            </div>
            <table class="table is-fullwidth">
              <thead>
                <tr>
                  <th>Date d'autorisation</th>
                  <th>User agent</th>
                  <th>Adresse IP</th>
                  <th class="has-text-centered">Révoquer</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="token in tokens" :key="token.id">
                  <td>{{ token.issuedDate | moment('LLLL') }}</td>
                  <td>{{ token.userAgent }}</td>
                  <td>{{ token.ip }}</td>
                  <td class="has-text-centered"><button class="button is-danger is-light is-small" @click="deleteToken(token.id)"><i class="fa fa-trash" /></button></td>
                </tr>
              </tbody>
            </table>
          </section>

        </div>
      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import { UnsavedChangesGuardMixin } from '@/mixins/UnsavedChangesGuard'
import { createNamespacedHelpers } from 'vuex'
const { mapState } = createNamespacedHelpers('app')

export default {
  name: 'Profile',
  components: {
    Breadcrumb,
  },
  mixins: [
    UnsavedChangesGuardMixin,
  ],
  data () {
    return {
      user: {},
      tokens: [],
    }
  },
  computed: {
    ...mapState(['id']),
  },
  mounted () {
    this.getProfile()
    this.getTokens()
  },
  methods: {
    async getProfile () {
      this.user = await this.$Provider.getUser(this.id)
      this.addUnsavedChangesGuard('user')
    },
    async getTokens () {
      this.tokens = await this.$Provider.getUserTokens(this.id)
    },
    async updateUser () {
      const _user = Object.assign({}, this.user)
      delete _user.password
      delete _user.modificationDate
      try {
        this.user = await this.$Provider.updateUser(_user)
        this.addUnsavedChangesGuard('user')
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
    },
    async updatePassword () {
      try {
        await this.$Provider.updateUserPassword(this.user.id, this.user.password)
        this.user.password = undefined
        this.addUnsavedChangesGuard('user')
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
    },
    async deleteToken (tokenId) {
      try {
        await this.$Provider.deleteUserToken(this.id, tokenId)
        this.tokens.splice(this.tokens.findIndex((token) => token.id === tokenId), 1)
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
    },
  },
}
</script>
