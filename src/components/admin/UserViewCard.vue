<template>
  <div class="field-body">
    <div v-if="card.type === 'custom'" class="field-body">

      <div class="field is-narrow is-required">
        <div class="control has-icons-left">
          <input v-model="card.title" class="input" type="text" placeholder="Titre de la carte">
          <span class="icon is-small is-left">
            <i class="fas fa-tag" />
          </span>
        </div>
      </div>

      <div class="field is-grouped">
        <div class="control">
          <button class="button is-primary is-light" title="Ajouter un état" @click="addState">
            <span class="icon"><i class="fa fa-plus-circle" /></span>
            <span>État</span>
          </button>
        </div>
        <div class="control">
          <button class="button is-primary is-light" title="Ajouter une action" @click="addAction">
            <span class="icon"><i class="fa fa-plus-circle" /></span>
            <span>Action</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="card.type === 'history'" class="field-body">

      <div class="field is-narrow is-required">
        <div class="control has-icons-left">
          <input v-model="card.title" class="input" type="text" placeholder="Titre de la carte">
          <span class="icon is-small is-left">
            <i class="fas fa-tag" />
          </span>
        </div>
      </div>

      <div class="field is-grouped">
        <div class="control">
          <button class="button is-primary is-light" title="Ajouter un historique d'état" @click="addStateHistory">
            <span class="icon"><i class="fa fa-plus-circle" /></span>
            <span>Historique</span>
          </button>
        </div>
      </div>
    </div>

    <div v-if="card.type === 'equipment'" class="field-body">
      <div class="field">
        <div class="control">
          <div class="field has-addons">
            <options-autocomplete type="equipment" placeholder="Équipement" :value="card.id" @select="setEquipmentId" />
            <div v-if="card.id" class="control">
              <router-link class="button is-primary" :to="{name: 'admin-equipment', params: {id: card.id}}" title="Consulter l'équipement"><span class="icon" style="height: 40px;width: 40px;"><i class="fa fa-external-link-square-alt" /></span></router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import OptionsAutocomplete from '@/components/admin/OptionsAutocomplete.vue'

export default {
  name: 'UserViewCard',
  components: {
    OptionsAutocomplete,
  },
  props: {
    card: {
      type: Object,
      required: true,
    },
  },
  methods: {
    setEquipmentId (equipment) {
      if (!equipment) {
        this.card.id = null
        return
      }
      this.card.id = equipment.id
    },
    addState () {
      this.card.elements.push({
        type: 'state',
        id: null,
        parentId: null,
        label: null,
      })
    },
    addAction () {
      this.card.elements.push({
        type: 'action',
        id: null,
        parentId: null,
        label: null,
      })
    },
    addStateHistory () {
      this.card.elements.push({
        type: 'stateHistory',
        id: null,
        dataType: 'numeric',
        label: null,
        color: 'rgb(150, 201, 39)',
        isMainYAxis: true,
      })
    },
  },
}
</script>
