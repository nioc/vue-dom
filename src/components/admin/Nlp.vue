<template>
  <section class="hero">

    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-nlp'}, icon: 'fa-brain', text: 'Traitement automatique du langage naturel', isActive: true}]" />
    </div>

    <div class="hero-body px-3">
      <div class="container">

        <div class="card mb-4">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-comment-dots" /></span><span>Intentions</span>
            </p>
          </header>
          <intents class="card-content" />
        </div>

        <div class="card mb-4">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-cubes" /></span><span>Entités</span>
            </p>
          </header>
          <entities class="card-content" />
        </div>

        <div class="card mb-4">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fa fa-brain" /></span><span>Moteur</span>
            </p>
          </header>
          <nlp-engine class="card-content" />
        </div>

      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import Intents from '@/components/admin/Intents'
import Entities from '@/components/admin/Entities'
import NlpEngine from '@/components/admin/NlpEngine'

export default {
  name: 'Nlp',
  components: {
    Breadcrumb,
    Intents,
    Entities,
    NlpEngine,
  },
}
</script>
