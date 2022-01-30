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
                    <th class="has-text-centered">Révoquer</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="token in tokens" :key="token.id">
                    <td>{{ token.issuedDate | moment('LLLL') }}</td>
                    <td :title="token.userAgent.ua">
                      <span class="mr-3 is-block-mobile is-inline-block-tablet" style="white-space: nowrap;">
                        <i :class="token.userAgent.browser.iconClass" />
                        {{ token.userAgent.browser.name }}{{ token.userAgent.browser.version ? ' '+token.userAgent.browser.version : '' }}
                      </span>
                      <span class="mr-3 is-block-mobile is-inline-block-tablet" style="white-space: nowrap;">
                        <i :class="token.userAgent.os.iconClass" />
                        {{ token.userAgent.os.name }}{{ token.userAgent.os.version ? ' '+token.userAgent.os.version : '' }}
                      </span>
                      <span v-if="token.userAgent.device && token.userAgent.device.type && token.userAgent.device.type === 'mobile'" class="is-block-mobile is-inline-block-tablet" style="white-space: nowrap;">
                        <i class="fas fa-fw fa-mobile-alt" />
                        {{ token.userAgent.device.vendor }}{{ token.userAgent.device.model ? ' '+token.userAgent.device.model : '' }}
                      </span>
                    </td>
                    <td>{{ token.ip }}</td>
                    <td class="has-text-centered"><button class="button is-danger is-light is-small" @click="deleteToken(token.id)"><i class="fa fa-trash" /></button></td>
                  </tr>
                </tbody>
              </table>
            </div>
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
      try {
        this.user = await this.$Provider.getMyProfile()
        this.addUnsavedChangesGuard('user')
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: `Erreur lors de la récupération du profil<br/>${error.message}` })
      }
    },
    async getTokens () {
      try {
        this.tokens = (await this.$Provider.getMyTokens())
          .map((token) => {
            switch (token.userAgent.browser.name.toLowerCase()) {
              case 'firefox':
                token.userAgent.browser.iconClass = 'fa-fw fab fa-firefox-browser'
                break
              case window.custom.provider.system:
                token.userAgent.browser.iconClass = 'fa-fw fa fa-vue-dom'
                break
              case 'chrome':
              case 'chrome webview':
              case 'chromium':
                token.userAgent.browser.iconClass = 'fa-fw fab fa-chrome'
                break
              case 'mobile safari':
              case 'safari':
                token.userAgent.browser.iconClass = 'fa-fw fab fa-safari'
                break
              case 'edge':
                token.userAgent.browser.iconClass = 'fa-fw fab fa-edge'
                break
              case 'ie':
                token.userAgent.browser.iconClass = 'fa-fw fab fa-internet-explorer'
                break
              default:
                token.userAgent.browser.iconClass = 'fa-fw far fa-question-circle'
            }
            switch (token.userAgent.os.name) {
              case 'Ubuntu':
                token.userAgent.os.iconClass = 'fa-fw fab fa-ubuntu'
                break
              case 'Linux':
              case 'Debian':
              case 'Unix':
                token.userAgent.os.iconClass = 'fa-fw fab fa-linux'
                break
              case 'Android':
              case 'Android-x86':
                token.userAgent.os.iconClass = 'fa-fw fab fa-android'
                break
              case 'iOS':
              case 'Mac OS':
                token.userAgent.os.iconClass = 'fa-fw fab fa-apple'
                break
              case 'Windows':
              case 'Windows Phone':
              case 'Windows Mobile':
                token.userAgent.os.iconClass = 'fa-fw fab fa-windows'
                break
              case 'CentOS':
                token.userAgent.os.iconClass = 'fa-fw fab fa-centos'
                break
              case 'SUSE':
                token.userAgent.os.iconClass = 'fa-fw fab fa-suse'
                break
              case 'RedHat':
                token.userAgent.os.iconClass = 'fa-fw fab fa-redhat'
                break
              case 'Fedora':
                token.userAgent.os.iconClass = 'fa-fw fab fa-fedora'
                break
              default:
                token.userAgent.os.iconClass = 'fa-fw far fa-question-circle'
            }
            return token
          })
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: `Erreur lors de la récupération des tokens<br/>${error.message}` })
      }
    },
    async updateProfile () {
      const _user = Object.assign({}, this.user)
      delete _user.password
      delete _user.modificationDate
      try {
        this.user = await this.$Provider.updateMyProfile(_user)
        this.addUnsavedChangesGuard('user')
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
    },
    async updatePassword () {
      try {
        await this.$Provider.updateMyPassword(this.user.password)
        this.user.password = undefined
        this.addUnsavedChangesGuard('user')
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
    },
    async deleteToken (tokenId) {
      this.$buefy.dialog.confirm({
        type: 'is-danger',
        title: 'Confirmation de suppression',
        message: '<p>Le jeton sera supprimé.</p><p>Souhaitez-vous continuer ?</p>',
        hasIcon: true,
        icon: 'trash',
        iconPack: 'fa',
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        onConfirm: async () => {
          try {
            await this.$Provider.deleteMyToken(tokenId)
            this.tokens.splice(this.tokens.findIndex((token) => token.id === tokenId), 1)
          } catch (error) {
            this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
          }
        },
      })
    },
  },
}
</script>
