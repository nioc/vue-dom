<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-equipments'}, icon: 'fa-microchip', text: 'Équipements'}, {link: {name: 'admin-equipment', params: {id}}, text: equipment.name, isActive: true}]" />
    </div>
    <div class="hero-body has-padding-horizontal-7">
      <div class="container">
        <b-loading v-model="isLoading" :is-full-page="false" />
        <div class="card has-margin-bottom-6">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-microchip" /></span><span>Informations de l'equipment</span>
            </p>
          </header>
          <section class="card-content">
            <div class="field is-required">
              <label class="label">Nom</label>
              <div class="control has-icons-left">
                <input v-model="equipment.name" class="input" type="text" placeholder="Nom de l'équipement">
                <span class="icon is-small is-left">
                  <i class="fas fa-tag" />
                </span>
              </div>
            </div>
            <div class="field is-required">
              <label class="label">Module</label>
              <div class="control has-icons-left">
                <input v-model="equipment.module" class="input" type="text" placeholder="Module gérant l'équipement">
                <span class="icon is-small is-left">
                  <i class="fas fa-cogs" />
                </span>
              </div>
            </div>
            <div class="field">
              <label class="label">Identifiant logique</label>
              <div class="control has-icons-left">
                <input v-model="equipment.logicalId" class="input" type="text" placeholder="Identifiant logique (adresse MAC, ...)">
                <span class="icon is-small is-left">
                  <i class="fas fa-at" />
                </span>
              </div>
            </div>
            <div class="field">
              <div class="control">
                <label class="label">Statut</label>
                <b-switch v-model="equipment.isActive">{{ equipment.isActive ? 'Actif' : 'Inactif' }}</b-switch>
              </div>
            </div>
            <div class="field">
              <div class="control">
                <label class="label">Visibilité</label>
                <b-switch v-model="equipment.isVisible">{{ equipment.isVisible ? 'Visible' : 'Masqué' }}</b-switch>
              </div>
            </div>
            <div class="field">
              <label class="label">Emplacement</label>
              <div class="control">
                <div class="field has-addons">
                  <div class="control has-icons-left">
                    <span class="select">
                      <select v-model="equipment.roomId">
                        <option :value="null">Aucun</option>
                        <option v-for="room in rooms" :key="room.id" :value="room.id">{{ room.name }}</option>
                      </select>
                    </span>
                    <span class="icon is-small is-left">
                      <i class="fas fa-home" />
                    </span>
                  </div>
                  <div v-if="equipment.roomId" class="control">
                    <router-link class="button is-primary" :to="{name: 'admin-room', params: {id: equipment.roomId}}" title="Consulter l'emplacement"><span class="icon" style="height: 40px;width: 40px;"><i class="fa fa-external-link-square-alt" /></span></router-link>
                  </div>
                </div>
              </div>
            </div>
            <div class="field">
              <label class="label">Batterie</label>
              <div class="control has-icons-left">
                <input v-model="equipment.battery" class="input" type="text" placeholder="Pourcentage de batterie restant" readonly>
                <span class="icon is-small is-left">
                  <i class="fas fa-battery-three-quarters" />
                </span>
              </div>
            </div>
            <div class="field">
              <label class="label">Dernière communication</label>
              <div class="control has-icons-left">
                <input v-model="equipmentLastCommunication" class="input" type="datetime" placeholder="Date de dernière communication" readonly disabled>
                <span class="icon is-small is-left">
                  <i class="far fa-clock" />
                </span>
              </div>
            </div>
            <div class="field">
              <label class="label">Tags</label>
              <div class="control has-icons-left">
                <input v-model="newTag" class="input" type="text" placeholder="Nouveau tag" @change="addTag">
                <span class="icon is-small is-left">
                  <i class="fas fa-tags" />
                </span>
              </div>
            </div>
            <div class="tags">
              <span v-for="(tag, index) in equipment.tags" :key="tag" class="tag is-light is-medium">
                {{ tag }}
                <button class="delete is-small" title="Retirer ce tag" @click="equipment.tags.splice(index, 1)" />
              </span>
            </div>
            <div class="buttons">
              <button class="button is-primary" title="Sauvegarder l'équipement" @click="saveEquipment()">
                <span class="icon"><i class="fa fa-save" /></span><span>Sauvegarder</span>
              </button>
              <button v-if="!isNew" class="button is-light" title="Dupliquer l'équipement" @click="copyEquipment()">
                <span class="icon"><i class="fa fa-copy" /></span><span>Dupliquer</span>
              </button>
              <button v-if="!isNew" class="button is-danger" title="Supprimer l'équipement" @click="removeEquipment()">
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
import { CmdMixin } from '@/mixins/Cmd'
import { AdminMixin } from '@/mixins/Admin'

export default {
  name: 'Equipment',
  components: {
    Breadcrumb,
  },
  mixins: [
    CmdMixin,
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
      equipment: {
        isActive: false,
        isVisible: false,
        roomId: null,
        tags: [],
      },
      newTag: '',
      isLoading: false,
    }
  },
  computed: {
    isNew () { return this.id === 'new' },
    equipmentLastCommunication () { return this.$moment(this.equipment.lastCommunication).format('LLL') },
  },
  mounted () {
    if (!this.isNew) {
      this.getEquipment()
    } else {
      if (this.proposal) {
        this.equipment = Object.assign({}, this.equipment, this.proposal)
      }
    }
  },
  methods: {
    async getEquipment () {
      this.isLoading = true
      this.equipment = Object.assign({}, this.equipment, await this.$Provider.getEquipment(this.id))
      this.isLoading = false
    },
    async saveEquipment () {
      this.isLoading = true
      const equipment = Object.assign({}, this.equipment)
      delete equipment.battery
      delete equipment.lastCommunication
      delete equipment.actions
      delete equipment.states
      const result = await this.vxSaveEquipment({ equipment, isNew: this.isNew })
      if (result) {
        if (this.isNew) {
          this.$router.replace({ name: this.$route.name, params: { id: result.id } })
        }
        this.equipment = Object.assign(this.equipment, result)
      }
      this.isLoading = false
    },
    copyEquipment () {
      const proposal = Object.assign({}, this.equipment)
      delete proposal.id
      delete proposal.logicalId
      delete proposal.battery
      delete proposal.lastCommunication
      delete proposal.hasNoCommunication
      delete proposal.actions
      delete proposal.states
      proposal.name = `${proposal.name} (copie)`
      this.$router.push({
        name: 'admin-equipment',
        params: {
          id: 'new',
          proposal,
        },
      })
    },
    async removeEquipment () {
      this.isLoading = true
      if (await this.vxDeleteEquipment(this.equipment.id)) {
        this.$router.back()
      }
      this.isLoading = false
    },
    addTag () {
      if (this.newTag) {
        if (!this.equipment.tags) {
          this.equipment.tags = []
        }
        if (!this.equipment.tags.includes(this.newTag)) {
          this.equipment.tags.push(this.newTag)
        }
        this.newTag = ''
      }
    },
    removeTag (index) {
      this.equipment.tags.splice(index, 1)
    },
  },
}
</script>
