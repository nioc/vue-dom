<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-users'}, icon: 'fa-users', text: 'Utilisateurs'}, {link: {name: 'admin-user', params: {id}}, text: user.login, isActive: true}]" />
    </div>
    <div class="hero-body px-3">
      <div class="container box">
        <o-loading v-model:active="isLoading" :full-page="false" />
        <label class="is-inline-block field is-relative is-clickable" title="Cliquer pour modifier l'avatar">
          <input ref="avatar" class="file-input" type="file" accept="image/*" @change="selectAvatar">
          <span class="image is-128x128">
            <img class="is-rounded" :src="user.avatarSrc">
          </span>
        </label>
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
            <o-switch v-model="user.isActive">{{ user.isActive ? 'Actif' : 'Inactif' }}</o-switch>
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
import Breadcrumb from '@/components/Breadcrumb.vue'
import { useUnsavedChangesGuard } from '@/composables/useUnsavedChangesGuard'
import { useAppStore } from '@/store/app'
import { useDialog } from '@/composables/useDialog'
import { provider } from '@/services/Provider'

export default {
  name: 'User',
  components: {
    Breadcrumb,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup() {
    const appStore = useAppStore()
    const { addUnsavedChangesGuard, removeUnsavedChangesGuard } = useUnsavedChangesGuard()
    const { confirm, confirmDelete } = useDialog()
    return { appStore, addUnsavedChangesGuard, removeUnsavedChangesGuard, confirm, confirmDelete }
  },
  data () {
    return {
      user: {},
      roles: provider.getAllRoles(),
      currentAvatar: null,
      isLoading: false,
    }
  },
  mounted () {
    this.getUser()
  },
  methods: {
    async getUser () {
      this.isLoading = true
      this.user = await provider.getUser(this.id)
      this.user.avatarSrc = provider.getAvatarUri(this.id)
      if (!this.user.roles) {
        this.user.roles = []
      }
      this.addUnsavedChangesGuard(this.user)
      this.isLoading = false
    },
    async updateUser () {
      this.isLoading = true
      try {
        await provider.updateUser(this.user)
        if (this.currentAvatar) {
          await this.uploadAvatar()
        }
        this.addUnsavedChangesGuard(this.user)
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    async removeUser () {
      if (await this.confirmDelete('L\'utilisateur sera supprimé.')) {
        this.isLoading = true
        try {
          await provider.deleteUser(this.user.id)
          this.removeUnsavedChangesGuard()
          this.$router.back()
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
        await provider.uploadUserAvatar(this.id, this.currentAvatar)
        this.currentAvatar = null
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: `Erreur lors de l'envoi de l'avatar : ${error.message}` })
      }
    },
    async requestToken () {
      this.isLoading = true
      try {
        const refreshToken = await provider.requestUserRefreshToken(this.user.id)
        this.confirm({
          title: 'Refresh token',
          message: `<p class="is-selectable-all is-family-code">${refreshToken.token}</p><br/><p>Note : ce token ne sera plus consultable ultérieurement</p>`,
          hasIcon: true,
          iconClass: 'fas fa-key',
        })
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
  },
}
</script>
