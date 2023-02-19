<template>
  <o-collapse class="card mb-4" animation="slide" aria-id="links" :open="open" @open="isOpened=true">
    <template #trigger="props">
      <header class="card-header" role="button" aria-controls="links" :aria-expanded="props.open">
        <p class="card-header-title">
          <span class="icon"><i class="fas fa-link" /></span><span>Objet liés</span>
        </p>
        <a class="card-header-icon">
          <i class="fa" :class="props.open ? 'fa-caret-down' : 'fa-caret-up'" />
        </a>
      </header>
    </template>
    <section class="card-content">
      <related v-if="isOpened" :id="id" :type="type" />
    </section>
  </o-collapse>
</template>

<script>
import Related from '@/components/admin/Related.vue'

export default {
  name: 'RelatedCollapsable',
  components: {
    Related,
  },
  props: {
    id: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    open: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      isOpened: this.open,
    }
  },
}
</script>
