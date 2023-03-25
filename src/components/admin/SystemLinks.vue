<template>
  <o-collapse class="card mb-4" animation="slide" aria-id="linksContent" :open="false" @open="getLinks()">
    <template #trigger="props">
      <header class="card-header" role="button" aria-controls="linksContent" :aria-expanded="props.open">
        <p class="card-header-title">
          <span class="icon"><i class="fas fa-link" /></span><span>Liens</span>
        </p>
        <a class="card-header-icon">
          <i class="fa" :class="props.open ? 'fa-caret-down' : 'fa-caret-up'" />
        </a>
      </header>
    </template>

    <section class="card-content is-relative">
      <o-loading v-model:active="isLoading" :full-page="false" />
      <ul v-if="linksGroups.length">
        <li v-for="(group, groupIndex) in linksGroups" :key="groupIndex" class="mb-5">
          <h2 class="subtitle is-5">{{ group.name }}</h2>
          <ul v-if="group.links.length" class="ml-5">
            <li v-for="(link, linkIndex) in group.links" :key="linkIndex" class="mb-2">
              <a :href="link.url" target="_blank" rel="noopener noreferrer"><span class="icon-text"><span class="icon mr-2"><i :class="link.icon" /></span>{{ link.name }}</span></a>
              <i v-if="link.description" class="has-text-weight-light has-text-grey"> - {{ link.description }}</i>
            </li>
          </ul>
        </li>
      </ul>
      <div v-else>Aucun lien configuré</div>
    </section>
  </o-collapse>
</template>

<script>
import { useAppStore } from '@/store/app'
import { provider } from '@/services/Provider'

export default {
  name: 'SystemLinks',
  setup() {
    const appStore = useAppStore()
    return { appStore }
  },
  data () {
    return {
      linksGroups: [],
      isLoading: false,
    }
  },
  methods: {
    async getLinks () {
      this.isLoading = true
      try {
        this.linksGroups = await provider.getSystemLinks()
      } catch (error) {
        this.appStore.setInformation({ type: 'is-danger', message: error.message })
      }
      this.isLoading = false
    },
  },
}
</script>
