<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'profile'}, icon: 'fa-user', text: 'Profile', isActive: true}]" />
    </div>
    <div class="hero-body px-3">
      <div class="container">

        <div class="card mb-4">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-user-edit" /></span><span>Mes informations</span>
            </p>
          </header>
          <section class="card-content">
            <label class="is-inline-block field is-relative is-clickable" title="Cliquer pour modifier l'avatar">
              <input ref="avatar" class="file-input" type="file" accept="image/*" @change="selectAvatar">
              <span class="image is-128x128">
                <img class="is-rounded" :src="user.avatarSrc">
              </span>
            </label>
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
                <button class="button is-primary" @click="updateProfile">
                  <span class="icon"><i class="fa fa-save" /></span><span>Sauvegarder</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        <div class="card mb-4">
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
            <div class="table-container">
              <table class="table is-fullwidth">
                <thead>
                  <tr>
                    <th>Date d'autorisation</th>
                    <th>User agent</th>
                    <th>Adresse IP</th>
                    <th>Date de dernière utilisation</th>
                    <th class="has-text-centered">Révoquer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="token in tokens" :key="token.id">
                    <td><time :datetime="token.issuedDate">{{ formatDate(token.issuedDate, 'PPPPp') }}</time></td>
                    <td :title="token.userAgent.ua">
                      <user-agent :user-agent-string="token.userAgent" />
                    </td>
                    <td>{{ token.ip }}</td>
                    <td><time v-if="token.lastUse" :datetime="token.lastUse" @click="refreshTokenUsesForModal = token.uses">{{ formatDate(token.lastUse, 'PPPPp') }}</time></td>
                    <td class="has-text-centered"><button class="button is-danger is-light is-small" @click="deleteToken(token.id)"><i class="fa fa-trash" /></button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

        </div>

        <div v-if="refreshTokenUsesForModal" class="modal is-active">
          <div class="modal-background" />
          <div class="modal-card">
            <header class="modal-card-head">
              <p class="modal-card-title">Utilisation du refresh token</p>
              <button class="delete" aria-label="close" @click="refreshTokenUsesForModal = null" />
            </header>
            <section class="modal-card-body">
              <div class="table-container">
                <table class="table is-fullwidth">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>User agent</th>
                      <th>Adresse IP</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="refreshTokenUse in refreshTokenUsesForModal" :key="refreshTokenUse.date">
                      <td><time :datetime="refreshTokenUse.date">{{ formatDate(refreshTokenUse.date, 'PPPPp') }}</time></td>
                      <td :title="refreshTokenUse.userAgent.ua">
                        <user-agent :user-agent-string="refreshTokenUse.userAgent" />
                      </td>
                      <td>{{ refreshTokenUse.ip }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>

      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb.vue'
import UserAgent from '@/components/UserAgent.vue'
import { useUnsavedChangesGuard } from '@/composables/useUnsavedChangesGuard'
import { useAppStore } from '@/store/app'
import { useAuthStore } from '@/store/auth'
import { useDialog } from '@/composables/useDialog'
import { dtFormat } from '@/services/Datetime'
import { provider } from '@/services/Provider'

export default {
  name: 'Profile',
  components: {
    Breadcrumb,
    UserAgent,
  },
  setup() {
    const appStore = useAppStore()
    const authStore = useAuthStore()
    const { confirmDelete } = useDialog()
    const { addUnsavedChangesGuard } = useUnsavedChangesGuard()
    return { appStore, authStore, confirmDelete, addUnsavedChangesGuard }
  },
  data () {
    return {
      user: {
        login: null,
        email: null,
        password: null,
        avatarSrc: null,
      },
      currentAvatar: null,
      tokens: [],
      refreshTokenUsesForModal: null,
    }
  },
  mounted () {
    this.getProfile()
    this.getTokens()
  },
  methods: {
    async getProfile () {
      try {
        this.user = await provider.getMyProfile()
        this.user.avatarSrc = provider.getAvatarUri(this.authStore.id)
        this.addUnsavedChangesGuard(this.user)
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: `Erreur lors de la récupération du profil<br/>${error.message}` })
      }
    },
    async getTokens () {
      try {
        this.tokens = (await provider.getMyTokens())
          .sort((a, b) => new Date(b.issuedDate) - new Date(a.issuedDate))
          .map((token) => {
            // get last use date
            token.lastUse = null
            if (Object.prototype.hasOwnProperty.call(token, 'uses') && token.uses.length > 0) {
              token.lastUse = token.uses.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date
            }
            return token
          })
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: `Erreur lors de la récupération des tokens<br/>${error.message}` })
      }
    },
    async updateProfile () {
      const user = {
        login: this.user.login,
        email: this.user.email,
      }
      try {
        this.user = {
          ...this.user,
          ...await provider.updateMyProfile(user),
        }
        if (this.currentAvatar) {
          await this.uploadAvatar()
        }
        this.addUnsavedChangesGuard(this.user)
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
    },
    async updatePassword () {
      try {
        await provider.updateMyPassword(this.user.password)
        this.user.password = undefined
        this.addUnsavedChangesGuard(this.user)
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
    },
    async deleteToken (tokenId) {
      if (await this.confirmDelete('Le jeton sera supprimé.')) {
        this.isLoading = true
        try {
          await provider.deleteMyToken(tokenId)
          this.tokens.splice(this.tokens.findIndex((token) => token.id === tokenId), 1)
        } catch (error) {
          this.appStore.setInformation({ type: 'is-danger', message: error.message })
        }
        this.isLoading = false
      }
    },
    selectAvatar () {
      this.currentAvatar = this.$refs.avatar.files[0]
      this.user.avatarSrc = URL.createObjectURL(this.currentAvatar)
    },
    async uploadAvatar () {
      try {
        await provider.uploadMyAvatar(this.currentAvatar)
        this.currentAvatar = null
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: `Erreur lors de l'envoi de l'avatar : ${error.message}` })
      }
    },
    formatDate (date, format) {
      return dtFormat(date, format)
    },
  },
}
</script>
