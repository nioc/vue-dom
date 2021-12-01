<template>
  <div class="field is-horizontal">
    <div v-if="element.type === 'state' || element.type === 'action' || element.type === 'stateHistory'" class="field-body">

      <div class="field is-narrow">
        <div class="control">
          <div class="field has-addons">
            <options-autocomplete :type="element.type === 'stateHistory' ? 'state' : element.type" :placeholder="element.type === 'action' ? 'Action' : 'État'" :value="element.id" @select="setElementId" />
            <div v-if="element.id" class="control">
              <router-link class="button is-primary" :to="{name: element.type === 'action' ? 'admin-action' : 'admin-state', params: {id: element.id}}" :title="'Consulter '+ element.type === 'action' ? 'l\'action' : 'l\'état'"><span class="icon" style="height: 40px;width: 40px;"><i class="fa fa-external-link-square-alt" /></span></router-link>
            </div>
          </div>
        </div>
      </div>

      <div class="field">
        <div class="control has-icons-left">
          <input v-model="element.label" class="input" type="text" placeholder="Libellé de l'élément">
          <span class="icon is-small is-left">
            <i class="fas fa-tag" />
          </span>
        </div>
      </div>

      <div v-if="element.type === 'stateHistory'" class="field">
        <div class="control has-icons-left">
          <input v-model="element.color" class="input" type="text" placeholder="Couleur de la série">
          <span class="icon is-small is-left">
            <i class="fas fa-palette" />
          </span>
        </div>
      </div>

      <div v-if="element.type === 'stateHistory'" class="control has-icons-left">
        <div class="select">
          <select v-model="element.isMainYAxis">
            <option :value="true">Axe Y 1</option>
            <option :value="false">Axe Y 2</option>
          </select>
          <div class="icon is-left">
            <i class="fas fa-arrows-alt-v" />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import OptionsAutocomplete from '@/components/admin/OptionsAutocomplete'

export default {
  name: 'UserViewCardElement',
  components: {
    OptionsAutocomplete,
  },
  props: {
    element: {
      type: Object,
      required: true,
    },
  },
  methods: {
    setElementId (element) {
      if (!element) {
        this.element.id = null
        return
      }
      this.element.id = element.id
      if (this.element.type === 'stateHistory') {
        this.element.dataType = element.type
      } else {
        this.element.parentId = element.eqId
      }
    },
  },
}
</script>
