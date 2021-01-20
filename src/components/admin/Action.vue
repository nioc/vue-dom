<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-actions'}, icon: 'fa-cogs', text: 'Actions'}, {link: {name: 'admin-action', params: {id}}, text: action.name, isActive: true}]" />
    </div>
    <div class="hero-body has-padding-horizontal-7">
      <div class="container">
        <b-loading v-model="isLoading" :is-full-page="false" />
        <div class="card has-margin-bottom-6">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-cogs" /></span><span>Informations de l'action</span>
            </p>
          </header>
          <section class="card-content">

            <div class="field is-required">
              <label class="label">Nom</label>
              <div class="control has-icons-left">
                <input v-model="action.name" class="input" type="text" placeholder="Nom de l'action">
                <span class="icon is-small is-left">
                  <i class="fas fa-tag" />
                </span>
              </div>
            </div>

            <div class="field is-required">
              <label class="label">Module</label>
              <div class="control has-icons-left">
                <input v-model="action.module" class="input" type="text" placeholder="Module gérant l'état">
                <span class="icon is-small is-left">
                  <i class="fas fa-cogs" />
                </span>
              </div>
            </div>

            <div class="field is-required">
              <label class="label">Equipement</label>
              <div class="control">
                <div class="field has-addons">
                  <options-autocomplete type="equipment" placeholder="Équipement" :value="action.eqId" @select="setEquipmentId" />
                  <div v-if="action.eqId" class="control">
                    <router-link class="button is-primary" :to="{name: 'admin-equipment', params: {id: action.eqId}}" title="Consulter l'équipement"><span class="icon" style="height: 40px;width: 40px;"><i class="fa fa-external-link-square-alt" /></span></router-link>
                  </div>
                </div>
              </div>
            </div>

            <div class="field">
              <label class="label">Identifiant logique</label>
              <div class="control has-icons-left">
                <input v-model="action.logicalId" class="input" type="text" placeholder="Identifiant logique (adresse MAC, ...)">
                <span class="icon is-small is-left">
                  <i class="fas fa-at" />
                </span>
              </div>
            </div>

            <div class="field is-required">
              <div class="control">
                <label class="label">Visibilité</label>
                <b-switch v-model="action.isVisible">{{ action.isVisible ? 'Visible' : 'Masqué' }}</b-switch>
              </div>
            </div>

            <div class="field">
              <div class="control">
                <label class="label">Utilisable pour une demande utilisateur</label>
                <b-switch v-model="action.isAsk">{{ action.isAsk ? 'Oui' : 'Non' }}</b-switch>
              </div>
            </div>

            <div class="field">
              <label class="label">Type</label>
              <div class="control has-icons-left">
                <div class="select">
                  <select v-model="action.type">
                    <option :value="null" disabled>Aucun</option>
                    <option value="button">Boutton</option>
                    <option value="switch">Switch</option>
                    <option value="switch_on">Switch état 1</option>
                    <option value="switch_off">Switch état 0</option>
                    <option value="slider">Curseur</option>
                    <option value="select">Liste</option>
                  </select>
                </div>
                <div class="icon is-small is-left">
                  <i class="fas fa-mouse" />
                </div>
              </div>
            </div>

            <div v-if="action.type==='slider'" class="field">
              <label class="label">Valeur minimale du curseur</label>
              <div class="control has-icons-left">
                <input v-model.number="action.minValue" class="input" type="number" placeholder="Valeur minimale du curseur">
                <span class="icon is-small is-left">
                  <i class="fas fa-level-down-alt" />
                </span>
              </div>
            </div>

            <div v-if="action.type==='slider'" class="field">
              <label class="label">Valeur maximale du curseur</label>
              <div class="control has-icons-left">
                <input v-model.number="action.maxValue" class="input" type="number" placeholder="Valeur maximale du curseur">
                <span class="icon is-small is-left">
                  <i class="fas fa-level-up-alt" />
                </span>
              </div>
            </div>

            <div v-if="action.type==='select'" class="field">
              <label class="label">Liste de valeurs</label>
              <div class="control">
                <table class="table is-striped">
                  <thead>
                    <tr>
                      <th />
                      <th>Valeur</th>
                      <th>Libellé</th>
                      <th />
                    </tr>
                  </thead>
                  <draggable v-model="action.options" tag="tbody" handle=".handle" draggable=".dr">
                    <tr v-for="(option, index) in action.options" :key="index" class="dr">
                      <td><span class="input is-static is-clickable" title="Glisser-déposer pour ordonner"><span class="icon has-text-grey-light"><i class="fa fa-grip-vertical handle" /></span></span></td>
                      <td><input v-model="option.value" class="input is-static" type="text" readonly></td>
                      <td><input v-model="option.label" class="input is-static" type="text" readonly></td>
                      <td>
                        <button class="button is-danger is-light" title="Supprimer l'option" @click="removeOption(index)">
                          <span class="icon"><i class="fa fa-trash" /></span>
                        </button>
                      </td>
                    </tr>
                    <tr>
                      <td />
                      <td><input v-model="newOption.value" class="input" type="text" placeholder="Valeur"></td>
                      <td><input v-model="newOption.label" class="input" type="text" placeholder="Libellé"></td>
                      <td>
                        <button :disabled="newOption.value === ''" class="button is-primary is-light" title="Ajouter l'option" @click="addOption">
                          <span class="icon"><i class="fa fa-plus-circle" /></span>
                        </button>
                      </td>
                    </tr>
                  </draggable>
                </table>
              </div>
            </div>

            <div class="field">
              <label class="label">Paramètre</label>
              <div class="field has-addons mb-0">
                <div class="control has-icons-left is-expanded">
                  <input v-if="action.paramsType==='number'" v-model.lazy.number="params" class="input is-family-code" :class="{'is-danger': hasParamsError}" type="number" placeholder="Valeur du paramètre à fournir lors de l'action">
                  <input v-else v-model.lazy="params" class="input is-family-code" :class="{'is-danger': hasParamsError}" type="text" placeholder="Valeur du paramètre à fournir lors de l'action">
                  <span class="icon is-small is-left">
                    <i class="fas fa-code" />
                  </span>
                </div>
                <div class="control">
                  <div class="select" :class="{'is-danger': hasParamsError}">
                    <select v-model="action.paramsType" @change="formatParams(action.params)">
                      <option value="json">JSON</option>
                      <option value="string">String</option>
                      <option value="number">Numérique</option>
                      <option value="boolean">Booléen</option>
                    </select>
                  </div>
                </div>
              </div>
              <div v-if="action.paramsType==='json'">
                <p v-if="jsonError" class="help is-danger">La valeur est invalide ({{ jsonError }})</p>
                <p v-else class="help is-success">La valeur est valide</p>
                <pre>{{ params }}</pre>
              </div>
            </div>

            <div class="field">
              <label class="label">Retour d'état</label>
              <div class="control">
                <div class="field has-addons">
                  <options-autocomplete type="state" title="État mis à jour par cette action" placeholder="État mis à jour" :value="action.stateFeedbackId" @select="setStateFeedbackId" />
                  <div v-if="action.stateFeedbackId" class="control">
                    <router-link class="button is-primary" :to="{name: 'admin-state', params: {id: action.stateFeedbackId}}" title="Consulter l'état"><span class="icon" style="height: 40px;width: 40px;"><i class="fa fa-external-link-square-alt" /></span></router-link>
                  </div>
                </div>
              </div>

            </div>

            <div class="field">
              <label class="label">Icône</label>
              <div class="field has-addons">
                <div class="control has-icons-left is-expanded">
                  <input v-model="action.icon" class="input" type="text" placeholder="Icône Font-Awesome de visualisation (fa fa-home, fas fa-smile-o)" @focus="isIconPickerVisible=true" @blur="isIconPickerVisible=false">
                  <span class="icon is-small is-left">
                    <i class="fas fa-pencil-alt" />
                  </span>
                </div>
                <div v-if="action.icon" class="control">
                  <span class="button is-static icon" style="height: 40px;width: 40px;"><i :class="action.icon" /></span>
                </div>
              </div>
            </div>
            <icon-picker v-if="isIconPickerVisible && action.icon" :name="action.icon" class="mb-3" @select="(icon) => action.icon = icon" />

            <div class="buttons">
              <button class="button is-primary" title="Sauvegarder l'action" :disabled="hasParamsError" @click="saveAction">
                <span class="icon"><i class="fa fa-save" /></span><span>Sauvegarder</span>
              </button>
              <button v-if="!isNew" class="button is-light" title="Rafraichir l'action" @click="getAction">
                <span class="icon"><i class="fa fa-sync-alt" /></span><span>Rafraichir</span>
              </button>
              <button v-if="!isNew" class="button is-light" title="Executer l'action" @click="executeAction">
                <span class="icon"><i class="fa fa-cogs" /></span><span>Exécuter</span>
              </button>
              <button v-if="!isNew" class="button is-light" title="Dupliquer l'action" @click="copyAction">
                <span class="icon"><i class="fa fa-copy" /></span><span>Dupliquer</span>
              </button>
              <button v-if="!isNew" class="button is-danger" title="Supprimer l'action" @click="removeAction">
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
import draggable from 'vuedraggable'
import Breadcrumb from '@/components/Breadcrumb'
import IconPicker from '@/components/admin/IconPicker'
import OptionsAutocomplete from '@/components/admin/OptionsAutocomplete'
import { AdminMixin } from '@/mixins/Admin'

export default {
  name: 'Action',
  components: {
    Breadcrumb,
    draggable,
    IconPicker,
    OptionsAutocomplete,
  },
  mixins: [
    AdminMixin,
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
      action: {
        eqId: null,
        isVisible: false,
        type: 'button',
        paramsType: 'string',
        stateFeedbackId: null,
      },
      isLoading: false,
      jsonError: null,
      newOption: {
        value: '',
        label: '',
      },
      isIconPickerVisible: false,
    }
  },
  computed: {
    isNew () { return this.id === 'new' },
    hasParamsError () { return this.jsonError && this.action.paramsType === 'json' },
    params: {
      get: function () {
        switch (this.action.paramsType) {
          case 'json':
            return Object.prototype.hasOwnProperty.call(this.action, 'params') ? JSON.stringify(this.action.params, null, 1) : ''
          case 'number':
            return Object.prototype.hasOwnProperty.call(this.action, 'params') ? parseFloat(this.action.params).toString() : ''
          default:
            return this.action.params
        }
      },
      set: function (string) {
        this.formatParams(string)
      },
    },
  },
  mounted () {
    if (!this.isNew) {
      this.getAction()
    } else {
      if (this.proposal) {
        this.action = Object.assign({}, this.action, this.proposal)
      }
      if (this.action.paramsType === 'json') {
        this.jsonError = null
      }
    }
  },
  methods: {
    async getAction () {
      this.isLoading = true
      this.action = await this.$Provider.getAction(this.id)
      if (this.action.paramsType === 'json') {
        this.jsonError = null
      }
      this.isLoading = false
    },
    async saveAction () {
      this.isLoading = true
      const action = Object.assign({}, this.action)
      const result = await this.vxSaveAction({ action, isNew: this.isNew })
      if (result) {
        if (this.isNew) {
          this.$router.replace({ name: this.$route.name, params: { id: result.id } })
        }
        this.action = Object.assign(this.action, result)
      }
      this.isLoading = false
    },
    copyAction () {
      const proposal = Object.assign({}, this.action)
      delete proposal.id
      delete proposal.logicalId
      proposal.name = `${proposal.name} (copie)`
      this.$router.push({
        name: 'admin-action',
        params: {
          id: 'new',
          proposal,
        },
      })
    },
    async removeAction () {
      this.isLoading = true
      if (await this.vxDeleteAction(this.action.id)) {
        this.$router.back()
      }
      this.isLoading = false
    },
    async executeAction () {
      this.isLoading = true
      try {
        await this.$Provider.executeAction(this.action.id, {})
      } catch (error) {
        this.$store.commit('app/setInformation', { type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    formatParams (params) {
      this.jsonError = null
      switch (this.action.paramsType) {
        case 'json':
          try {
            this.action.params = JSON.parse(params)
          } catch (error) {
            this.jsonError = error.message
          }
          break
        case 'boolean':
          try {
            this.action.params = Boolean(JSON.parse(params))
          } catch (error) {
            this.action.params = null
            this.action.params = false
          }
          break
        case 'number':
          this.action.params = parseFloat(params)
          if (isNaN(this.action.params)) {
            this.action.params = 0
          }
          break
        case 'string':
          if (typeof params === 'string') {
            this.action.params = params
          } else {
            this.action.params = JSON.stringify(params)
          }
          break
        default:
          this.action.params = params
      }
    },
    addOption () {
      if (!this.action.options) {
        this.action.options = []
      }
      this.action.options.push(Object.assign({}, this.newOption))
      this.newOption.value = ''
      this.newOption.label = ''
    },
    removeOption (index) {
      this.action.options.splice(index, 1)
    },
    setEquipmentId (equipment) {
      if (!equipment) {
        this.action.eqId = null
        return
      }
      this.action.eqId = equipment.id
    },
    setStateFeedbackId (state) {
      if (!state) {
        this.action.stateFeedbackId = null
        return
      }
      this.action.stateFeedbackId = state.id
    },
  },
}
</script>
