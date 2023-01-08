<template>
  <o-collapse class="card mb-4" animation="slide" aria-id="databaseContent" :open="false" @open="getDatabaseCollections">
    <template #trigger="props">
      <header class="card-header" role="button" aria-controls="databaseContent" :aria-expanded="props.open">
        <p class="card-header-title">
          <span class="icon"><i class="fa fa-database" /></span><span>Base de données</span>
        </p>
        <a class="card-header-icon">
          <i class="fa" :class="props.open ? 'fa-caret-down' : 'fa-caret-up'" />
        </a>
      </header>
    </template>

    <section class="card-content is-relative">
      <o-loading v-model:active="isLoading" :full-page="false" />

      <div class="field">
        <div class="control">
          <label class="label">Collections à inclure dans la sauvegarde (toutes par défaut)</label>
          <o-table v-model:checked-rows="selectedCollections" :data="collections" striped hoverable checkable :header-checkable="false" :mobile-cards="false" sort-icon="caret-up" default-sort="name">
            <o-table-column v-slot="props" field="name" label="Nom" sortable>
              <span class="is-family-code">{{ props.row.name }}</span>
            </o-table-column>
            <o-table-column v-slot="props" field="stats.count" label="Nombre" sortable numeric position="right">
              {{ props.row.stats.count }}
            </o-table-column>
            <o-table-column v-slot="props" field="stats.size" label="Taille" sortable numeric position="right">
              {{ getHumanSizeCei(props.row.stats.size) }}
            </o-table-column>
            <o-table-column v-slot="props" field="stats.avgObjSize" label="Taille unitaire" sortable numeric position="right">
              {{ getHumanSizeCei(props.row.stats.avgObjSize) }}
            </o-table-column>
            <o-table-column v-slot="props" field="stats.storageSize" label="Données" sortable numeric position="right">
              {{ getHumanSizeCei(props.row.stats.storageSize) }}
            </o-table-column>
            <o-table-column v-slot="props" field="stats.totalIndexSize" label="Index" sortable numeric position="right">
              {{ getHumanSizeCei(props.row.stats.totalIndexSize) }}
            </o-table-column>
          </o-table>
        </div>
      </div>

      <div class="field">
        <div class="control">
          <label class="label">Format</label>
          <o-switch v-model="isJson" type="is-danger" passive-type="is-primary">{{ isJson ? 'JSON (incompatible avec l\'import)' : 'BSON encodé' }}</o-switch>
        </div>
      </div>

      <span class="buttons">
        <button class="button is-primary" title="Sauvegarder les collections sélectionnées" @click="getDatabaseBackup">
          <span class="icon"><i class="fa fa-download" /></span>
          <span>Sauvegarder</span>
        </button>
      </span>

      <span class="buttons">
        <div class="file has-name is-warning" title="Charger une sauvegarde">
          <label class="file-label">
            <input ref="file" class="file-input" type="file" @input="importDatabaseBackup">
            <span class="file-cta is-warning">
              <span class="file-icon"><i class="fas fa-cloud-upload-alt" /></span>
              <span class="file-label">Importer</span>
            </span>
            <span class="file-name" :class="{'has-text-grey-light': file}">{{ file.name || 'fichier.json' }}</span>
          </label>
        </div>
      </span>
    </section>
  </o-collapse>
</template>

<script>
import { useConversions } from '@/composables/useConversions'
import { useAppStore } from '@/store/app'
import { useDialog } from '@/composables/useDialog'
import { provider } from '@/services/Provider'

export default {
  name: 'SystemDatabase',
  setup() {
    const appStore = useAppStore()
    const { confirm } = useDialog()
    const { getHumanSizeCei } = useConversions()
    return { appStore, confirm, getHumanSizeCei }
  },
  data () {
    return {
      isLoading: false,
      collections: [],
      selectedCollections: [],
      file: {},
      isJson: false,
    }
  },
  methods: {
    async getDatabaseCollections () {
      this.isLoading = true
      try {
        this.collections = await provider.getDatabaseCollections()
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    async getDatabaseBackup () {
      this.isLoading = true
      try {
        await provider.getDatabaseBackup({ isJson: this.isJson, collections: this.selectedCollections.map((collection) => collection.name) })
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
    async importDatabaseBackup () {
      this.file = this.$refs.file.files[0]
      if (!this.file) {
        return
      }
      this.isLoading = true
      try {
        const results = await provider.importDatabaseBackup(this.file)
        let message = '<ul>'
        results.forEach((result) => {
          message += `<li>${result.name}: ${result.count}</li>`
        })
        message += '</ul>'
        this.confirm({
          title: 'Base de données restaurée',
          message,
          hasIcon: true,
          iconClass: 'fas fa-database',
        })
        this.file = {}
      } catch (error) {
        this.confirm({
          type: 'is-danger',
          title: 'Erreur lors de la restauration',
          message: error.message,
          hasIcon: true,
          iconClass: 'fas fa-database',
        })
      }
      this.isLoading = false
    },
  },
}
</script>
