<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-actions-records'}, icon: 'fa-book-open', text: 'Journal des actions', isActive: true}]" />
    </div>
    <div class="hero-body px-3">
      <div class="container">
        <o-collapse class="card mb-4" animation="slide" aria-id="schedulerContent" :open="true" @open="getActionsRecords(false)">
          <template #trigger="props">
            <header class="card-header" role="button" aria-controls="schedulerContent" :aria-expanded="props.open">
              <p class="card-header-title">
                <span class="icon"><i class="fas fa-book-open" /></span><span>Journal des actions</span>
              </p>
              <a class="card-header-icon">
                <i class="fa" :class="props.open ? 'fa-caret-down' : 'fa-caret-up'" />
              </a>
            </header>
          </template>
          <div class="card-content is-relative">
            <o-loading v-model:active="isLoading" :full-page="false" />
            <timeline v-slot="record" :events="displayedRecords" :group-by-day="true">
              <div class="is-flex-direction-column">
                <div>
                  {{ record.description }}
                </div>
                <div class="is-flex is-align-items-center has-text-grey is-size-7">
                  <span v-if="record.userName" class="image is-16x16 mr-1">
                    <img class="is-rounded" :src="getAvatarSrc(record.userId)">
                  </span>
                  <span><span v-if="record.userName">{{ record.userName }} - </span>{{ record.channel }}<time class="is-hidden-tablet" :datetime="record.isoTime"> - {{ record.time }}</time><span v-if="!record.icon"> - <router-link :to="{name: 'admin-action', params: {id: record.actionId}}">Fix action icon</router-link></span></span>
                </div>
              </div>
            </timeline>
            <button class="button is-light" @click="limit += 10">
              <span class="icon"><i class="fas fa-search-plus" /></span><span>Afficher plus</span>
            </button>
          </div>
        </o-collapse>

      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb.vue'
import Timeline from '@/components/Timeline.vue'
import { useAppStore } from '@/store/app'
import { useDataStore } from '@/store/data'
import { useEquipmentsHelper } from '@/composables/useEquipmentsHelper'
import { provider } from '@/services/Provider'

function fixCase (text) {
  return text.split(' ').map((word, wordIndex) => {
    if (wordIndex > 0) {
      if (/[A-Z].*[A-Z]+.*/.test(word)) {
        return word
      } else {
        return word.toLowerCase()
      }
    } else {
      return word.charAt(0).toUpperCase() + word.slice(1)
    }
  }).join(' ')
}

export default {
  name: 'ActionsRecords',
  components: {
    Breadcrumb,
    Timeline,
  },
  setup() {
    const appStore = useAppStore()
    const dataStore = useDataStore()
    const { getIconClass } = useEquipmentsHelper()
    return { appStore, dataStore, getIconClass }
  },
  data () {
    return {
      records: [],
      isLoading: false,
      limit: 20,
    }
  },
  computed: {
    displayedRecords () {
      return this.records
        .slice(0, this.limit)
    },
  },
  mounted () {
    this.getActionsRecords()
  },
  methods: {
    getAvatarSrc (userId) {
      return provider.getAvatarUri(userId)
    },
    async getActionsRecords () {
      this.isLoading = true
      try {
        this.records = (await provider.getActionsRecords())
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 100)
          .map((record) => {
            const action = this.dataStore.getActionById(record.actionId)
            let description = action.name
            if (action.eqId) {
              const equipment = this.dataStore.getEquipmentById(action.eqId)
              description = `${description} ${equipment.name}`
            }
            if (action.type === 'switch') {
              description = `${record.params.value ? 'Activation' : 'Extinction'} ${description.toLowerCase()}`
            }
            record.description = fixCase(description)
            record.icon = action.icon
            return record
          })
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
  },
}
</script>
