<template>
  <div class="field is-horizontal">
    <div v-if="element.type === 'state' || element.type === 'action'" class="field-body">

      <div class="field is-narrow">
        <div class="control">
          <div class="field has-addons">
            <options-autocomplete :type="element.type" :placeholder="element.type === 'state' ? 'État' : 'Action'" :value="element.id" @select="setElementId" />
            <div v-if="element.id" class="control">
              <router-link class="button is-primary" :to="{name: element.type === 'state' ? 'admin-state' : 'admin-action', params: {id: element.id}}" :title="'Consulter '+ element.type === 'state' ? 'l\'état' : 'l\'action'"><span class="icon" style="height: 40px;width: 40px;"><i class="fa fa-external-link-square-alt" /></span></router-link>
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
      this.element.parentId = element.eqId
    },
  },
}
</script>
