<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-views'}, icon: 'fa-binoculars', text: 'Vues utilisateurs'}, {link: {name: 'admin-view', params: {id}}, text: userView.code, isActive: true}]" />
    </div>
    <div class="hero-body px-3">
      <div class="container">
        <o-loading v-model:active="isLoading" :full-page="false" />
        <div class="card mb-4">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-binoculars" /></span><span>Informations de la vue utilisateur</span>
            </p>
          </header>
          <section class="card-content">

            <div class="field is-required">
              <label class="label">Code</label>
              <div class="control has-icons-left">
                <input v-model="userView.code" class="input" type="text" placeholder="Code de la vue utilisateur (path)">
                <span class="icon is-small is-left">
                  <i class="fas fa-at" />
                </span>
              </div>
            </div>

            <div class="field is-required">
              <label class="label">Titre</label>
              <div class="control has-icons-left">
                <input v-model="userView.title" class="input" type="text" placeholder="Titre de la vue utilisateur">
                <span class="icon is-small is-left">
                  <i class="fas fa-tag" />
                </span>
              </div>
            </div>

            <div class="field is-required">
              <label class="label">Icône</label>
              <div class="field has-addons">
                <div class="control has-icons-left is-expanded">
                  <input v-model="userView.icon" class="input" type="text" placeholder="Icône Font-Awesome de visualisation (fa fa-home, fas fa-smile-o)" @focus="isIconPickerVisible=true" @blur="isIconPickerVisible=false">
                  <span class="icon is-small is-left">
                    <i class="fas fa-pencil-alt" />
                  </span>
                </div>
                <div v-if="userView.icon" class="control">
                  <span class="button is-static icon" style="height: 40px;width: 40px;"><i :class="userView.icon" /></span>
                </div>
              </div>
            </div>
            <icon-picker v-if="isIconPickerVisible && userView.icon" class="mb-3" :name="userView.icon" @select="(icon) => userView.icon = icon" />

            <div class="field">
              <div class="control">
                <label class="label">Statut</label>
                <o-switch v-model="userView.isActive">{{ userView.isActive ? 'Actif' : 'Inactif' }}</o-switch>
              </div>
            </div>

            <div class="field">
              <div class="control">
                <label class="label">Visibilité</label>
                <o-switch v-model="userView.isShared">{{ userView.isShared ? 'Partagé' : 'Privé' }}</o-switch>
              </div>
            </div>

            <div class="buttons">
              <button class="button is-primary" title="Sauvegarder la vue utilisateur" @click="saveUserView">
                <span class="icon"><i class="fa fa-save" /></span><span>Sauvegarder</span>
              </button>
              <button v-if="!isNew" class="button is-light" title="Rafraichir la vue utilisateur" @click="getUserView">
                <span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span>
              </button>
              <button v-if="!isNew" class="button is-light" title="Dupliquer la vue utilisateur" @click="copyUserView">
                <span class="icon"><i class="fa fa-copy" /></span><span>Dupliquer</span>
              </button>
              <button v-if="!isNew" class="button is-danger" title="Supprimer la vue utilisateur" @click="removeUserView">
                <span class="icon"><i class="fa fa-trash" /></span><span>Supprimer</span>
              </button>
            </div>
          </section>
        </div>

        <div class="card mb-4">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-tasks" /></span><span>Cartes</span>
            </p>
          </header>
          <section class="card-content">

            <draggable v-model="userView.cards" tag="div" handle=".handle" draggable=".dr" item-key="title">
              <template #item="{element: card, index: cardIndex}">
                <div class="dr">
                  <div class="field is-horizontal">
                    <div class="field-body">
                      <div class="field is-narrow">
                        <span class="input is-static is-clickable" title="Glisser-déposer pour ordonner"><span class="icon has-text-grey-light"><i class="fa fa-grip-vertical handle" /></span></span>
                      </div>
                      <user-view-card :card="card" />

                      <div class="field is-narrow">
                        <button class="button is-danger is-light" title="Supprimer la carte" @click="removeCard(cardIndex)">
                          <span class="icon"><i class="fa fa-trash" /></span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <draggable v-model="card.elements" tag="div" handle=".handle" draggable=".dr" class="px-6" item-key="id">
                    <template #item="{element, index: elementIndex}">
                      <div class="dr field mb-3">
                        <div class="field is-horizontal">
                          <div class="field-body">
                            <div class="field is-narrow">
                              <span class="input is-static is-clickable" title="Glisser-déposer pour ordonner"><span class="icon has-text-grey-light"><i class="fa fa-grip-vertical handle" /></span></span>
                            </div>
                            <user-view-card-element :element="element" />

                            <div class="field is-narrow">
                              <button class="button is-danger is-light" title="Supprimer l'élément" @click="removeCardElement(cardIndex, elementIndex)">
                                <span class="icon"><i class="fa fa-trash" /></span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>
                  </draggable>
                  <hr>
                </div>
              </template>
            </draggable>

            <div class="field is-grouped">
              <div class="control">
                <div class="select">
                  <select v-model="cardType">
                    <option value="equipment">Équipement</option>
                    <option value="custom">Carte sur mesure</option>
                    <option value="history">Historique</option>
                  </select>
                </div>
              </div>
              <div class="control">
                <button class="button is-primary is-light" title="Ajouter une carte" @click="addCard">
                  <span class="icon"><i class="fa fa-plus-circle" /></span>
                  <span>Carte</span>
                </button>
              </div>
            </div>

            <div class="buttons">
              <button class="button is-primary" title="Sauvegarder la vue utilisateur" @click="saveUserView">
                <span class="icon"><i class="fa fa-save" /></span><span>Sauvegarder</span>
              </button>
            </div>
          </section>
        </div>

      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb.vue'
import IconPicker from '@/components/admin/IconPicker.vue'
import UserViewCard from '@/components/admin/UserViewCard.vue'
import UserViewCardElement from '@/components/admin/UserViewCardElement.vue'
import draggable from 'vuedraggable'
import { useDataStore } from '@/store/data'
import { useDialog } from '@/composables/useDialog'
import { useUnsavedChangesGuard } from '@/composables/useUnsavedChangesGuard'
import { provider } from '@/services/Provider'

export default {
  name: 'UserView',
  components: {
    Breadcrumb,
    IconPicker,
    UserViewCard,
    UserViewCardElement,
    draggable,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup() {
    const dataStore = useDataStore()
    const { addUnsavedChangesGuard, removeUnsavedChangesGuard } = useUnsavedChangesGuard()
    const { confirmDelete } = useDialog()
    return { dataStore, addUnsavedChangesGuard, removeUnsavedChangesGuard, confirmDelete }
  },
  data () {
    return {
      userView: {
        isActive: false,
        cards: [],
      },
      isLoading: false,
      isIconPickerVisible: false,
      cardType: 'equipment',
    }
  },
  computed: {
    isNew () {
      return this.id === 'new'
    },
  },
  mounted () {
    if (!this.isNew) {
      this.getUserView()
    } else {
      this.addUnsavedChangesGuard(this.userView)
      if (history.state.proposal) {
        this.userView = Object.assign({}, this.userView, history.state.proposal)
      }
    }
  },
  methods: {
    async getUserView () {
      this.isLoading = true
      this.userView = Object.assign({}, this.userView, await provider.getUserView(this.id))
      this.addUnsavedChangesGuard(this.userView)
      this.isLoading = false
    },
    async saveUserView () {
      this.isLoading = true
      const userView = Object.assign({}, this.userView)
      const result = await this.dataStore.vxSaveUserView({ userView, isNew: this.isNew })
      if (result) {
        if (this.isNew) {
          this.removeUnsavedChangesGuard()
          this.$router.replace({ name: this.$route.name, params: { id: result.id } })
        }
        this.userView = Object.assign(this.userView, result)
        this.addUnsavedChangesGuard(this.userView)
      }
      this.isLoading = false
    },
    copyUserView () {
      const proposal = JSON.parse(JSON.stringify(this.userView))
      delete proposal.id
      delete proposal.code
      proposal.name = `${proposal.name} (copie)`
      this.$router.push({
        name: 'admin-view',
        params: {
          id: 'new',
        },
        state: {
          proposal,
        },
      }).catch(() => {})
    },
    async removeUserView () {
      if (await this.confirmDelete('La vue sera supprimée ainsi que les cartes la constituant.')) {
        this.isLoading = true
        if (await this.dataStore.vxDeleteUserView({ viewId: this.userView.id, viewCode: this.userView.code })) {
          this.removeUnsavedChangesGuard()
          this.$router.back()
        }
        this.isLoading = false
      }
    },
    addCard () {
      const card = {
        type: this.cardType,
      }
      if (['custom', 'history'].includes(this.cardType)) {
        card.elements = []
      }
      this.userView.cards.push(card)
    },
    removeCard (cardIndex) {
      this.userView.cards.splice(cardIndex, 1)
    },
    removeCardElement (cardIndex, elementIndex) {
      this.userView.cards[cardIndex].elements.splice(elementIndex, 1)
    },
  },
}
</script>
