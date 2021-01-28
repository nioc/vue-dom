<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-states'}, icon: 'fa-eye', text: 'États'}, {link: {name: 'admin-state', params: {id}}, text: state.name, isActive: true}]" />
    </div>
    <div class="hero-body has-padding-horizontal-7">
      <div class="container">
        <b-loading v-model="isLoading" :is-full-page="false" />
        <div class="card has-margin-bottom-6">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-eye" /></span><span>Informations de l'état</span>
            </p>
          </header>
          <section class="card-content">

            <div class="field">
              <label class="label">Nom</label>
              <div class="control has-icons-left">
                <input v-model="state.name" class="input" type="text" placeholder="Nom de l'état">
                <span class="icon is-small is-left">
                  <i class="fas fa-tag" />
                </span>
              </div>
            </div>

            <div class="field">
              <label class="label">Module</label>
              <div class="control has-icons-left">
                <input v-model="state.module" class="input" type="text" placeholder="Module gérant l'état">
                <span class="icon is-small is-left">
                  <i class="fas fa-cogs" />
                </span>
              </div>
            </div>

            <div class="field">
              <label class="label">Equipement</label>
              <div class="control">
                <div class="field has-addons">
                  <options-autocomplete type="equipment" placeholder="Équipement" :value="state.eqId" @select="setEquipmentId" />
                  <div v-if="state.eqId" class="control">
                    <router-link class="button is-primary" :to="{name: 'admin-equipment', params: {id: state.eqId}}" title="Consulter l'équipement"><span class="icon" style="height: 40px;width: 40px;"><i class="fa fa-external-link-square-alt" /></span></router-link>
                  </div>
                </div>
              </div>
            </div>

            <div class="field">
              <label class="label">Identifiant logique</label>
              <div class="control has-icons-left">
                <input v-model="state.logicalId" class="input" type="text" placeholder="Identifiant logique (adresse MAC, ...)">
                <span class="icon is-small is-left">
                  <i class="fas fa-at" />
                </span>
              </div>
            </div>

            <div class="field">
              <div class="control">
                <label class="label">Visibilité</label>
                <b-switch v-model="state.isVisible">{{ state.isVisible ? 'Visible' : 'Masqué' }}</b-switch>
              </div>
            </div>

            <div class="field">
              <div class="control">
                <label class="label">Historisation</label>
                <b-switch v-model="state.isHistorized">{{ state.isHistorized ? 'Historisé' : 'Non historisé' }}</b-switch>
              </div>
            </div>

            <div class="field">
              <label class="label">Type</label>
              <div class="control has-icons-left">
                <div class="select">
                  <select v-model="state.type">
                    <option :value="null">Aucun</option>
                    <option value="string">String</option>
                    <option value="numeric">Numérique</option>
                    <option value="boolean">Booléen</option>
                  </select>
                </div>
                <div class="icon is-small is-left">
                  <i class="fas fa-database" />
                </div>
              </div>
            </div>

            <div class="field">
              <label class="label">Type de donnée</label>
              <div class="control has-icons-left">
                <input v-model="state.genericType" class="input" type="text" placeholder="Type de la donnée (TEMPERATURE, PRESSION, ...)">
                <span class="icon is-small is-left">
                  <i class="fas fa-pencil-ruler" />
                </span>
              </div>
            </div>

            <div v-if="state.type==='numeric'" class="field">
              <label class="label">Valeur minimale</label>
              <div class="control has-icons-left">
                <input v-model="state.minValue" class="input" type="number" placeholder="Valeur minimale">
                <span class="icon is-small is-left">
                  <i class="fas fa-level-down-alt" />
                </span>
              </div>
            </div>

            <div v-if="state.type==='numeric'" class="field">
              <label class="label">Valeur maximale</label>
              <div class="control has-icons-left">
                <input v-model="state.maxValue" class="input" type="number" placeholder="Valeur maximale">
                <span class="icon is-small is-left">
                  <i class="fas fa-level-up-alt" />
                </span>
              </div>
            </div>

            <div class="field">
              <label class="label">Unité</label>
              <div class="control has-icons-left">
                <input v-model="state.unit" class="input" type="text" placeholder="Unité de la donnée (°C, hPa, kW, ...)">
                <span class="icon is-small is-left">
                  <i class="fas fa-ruler" />
                </span>
              </div>
            </div>

            <div class="field">
              <label class="label">Icône</label>
              <div class="field has-addons">
                <div class="control has-icons-left is-expanded">
                  <input v-model="state.icon" class="input" type="text" placeholder="Icône Font-Awesome de visualisation (fa fa-home, fas fa-smile-o)" @focus="isIconPickerVisible=true" @blur="isIconPickerVisible=false">
                  <span class="icon is-small is-left">
                    <i class="fas fa-pencil-alt" />
                  </span>
                </div>
                <div v-if="state.icon" class="control">
                  <span class="button is-static icon" style="height: 40px;width: 40px;"><i :class="state.icon" /></span>
                </div>
              </div>
            </div>
            <icon-picker v-if="isIconPickerVisible && state.icon" class="mb-3" :name="state.icon" @select="(icon) => state.icon = icon" />

            <div class="field">
              <label class="label">Dernière valeur</label>
              <div class="control has-icons-left">
                <input v-model="state.currentValue" class="input" type="text" placeholder="Dernière valeur" readonly>
                <span class="icon is-small is-left">
                  <i class="fas fa-code" />
                </span>
              </div>
            </div>

            <div class="field">
              <label class="label">Dernière collecte</label>
              <div class="control has-icons-left">
                <input v-model="statecollectDate" class="input" type="datetime" placeholder="Date de dernière collecte" readonly disabled>
                <span class="icon is-small is-left">
                  <i class="far fa-clock" />
                </span>
              </div>
            </div>

            <div class="buttons">
              <button class="button is-primary" title="Sauvegarder l'état" @click="saveState">
                <span class="icon"><i class="fa fa-save" /></span><span>Sauvegarder</span>
              </button>
              <button v-if="!isNew" class="button is-light" title="Rafraichir l'état" @click="getState">
                <span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span>
              </button>
              <button v-if="!isNew" class="button is-light" title="Dupliquer l'état" @click="copyState">
                <span class="icon"><i class="fa fa-copy" /></span><span>Dupliquer</span>
              </button>
              <button v-if="!isNew" class="button is-danger" title="Supprimer l'état" @click="removeState">
                <span class="icon"><i class="fa fa-trash" /></span><span>Supprimer</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import IconPicker from '@/components/admin/IconPicker'
import OptionsAutocomplete from '@/components/admin/OptionsAutocomplete'
import { AdminMixin } from '@/mixins/Admin'
import { UnsavedChangesGuardMixin } from '@/mixins/UnsavedChangesGuard'

export default {
  name: 'State',
  components: {
    Breadcrumb,
    IconPicker,
    OptionsAutocomplete,
  },
  mixins: [
    AdminMixin,
    UnsavedChangesGuardMixin,
  ],
  props: {
    id: {
      type: String,
      required: true,
    },
    proposal: {
      type: Object,
      required: false,
      default: () => {},
    },
  },
  data () {
    return {
      state: {
        isVisible: false,
        eqId: null,
      },
      isLoading: false,
      isIconPickerVisible: false,
    }
  },
  computed: {
    isNew () { return this.id === 'new' },
    statecollectDate () { return this.state.date ? this.$moment(this.state.date).format('LLL') : null },
  },
  mounted () {
    if (!this.isNew) {
      this.getState()
    } else {
      this.addUnsavedChangesGuard('state')
      if (this.proposal) {
        this.state = Object.assign({}, this.state, this.proposal)
      }
    }
  },
  methods: {
    async getState () {
      this.isLoading = true
      this.state = await this.$Provider.getState(this.id)
      this.addUnsavedChangesGuard('state')
      this.isLoading = false
    },
    async saveState () {
      this.isLoading = true
      const state = Object.assign({}, this.state)
      delete state.currentValue
      delete state.date
      const result = await this.vxSaveState({ state, isNew: this.isNew })
      if (result) {
        this.addUnsavedChangesGuard('state')
        if (this.isNew) {
          this.$router.replace({ name: this.$route.name, params: { id: result.id } })
        }
        this.state = Object.assign(this.state, result)
      }
      this.isLoading = false
    },
    copyState () {
      const proposal = Object.assign({}, this.state)
      delete proposal.id
      delete proposal.logicalId
      delete proposal.currentValue
      delete proposal.date
      proposal.name = `${proposal.name} (copie)`
      this.$router.push({
        name: 'admin-state',
        params: {
          id: 'new',
          proposal,
        },
      }).catch(() => {})
    },
    async removeState () {
      this.isLoading = true
      if (await this.vxDeleteState(this.state.id)) {
        this.removeUnsavedChangesGuard('state')
        this.$router.back()
      }
      this.isLoading = false
    },
    setEquipmentId (equipment) {
      if (!equipment) {
        this.state.eqId = null
        return
      }
      this.state.eqId = equipment.id
    },
  },
}
</script>
