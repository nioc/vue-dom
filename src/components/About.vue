<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: '/', icon: 'fa-info-circle', text: 'A propos', isActive: true}]" />
    </div>
    <div class="hero-body">
      <div class="container box">
        <h2 class="title">À propos</h2>
        <h3 class="subtitle is-5 is-flex">
          <a :href="homepage" target="_blank" rel="noreferrer"><img class="image is-96x96" src="./../assets/home.png"><p class="subtitle has-text-primary has-text-centered">{{ name }}</p></a>
        </h3>
        <div class="content field is-grouped is-grouped-multiline">
          <div class="control">
            <div class="tags has-addons">
              <span class="tag is-dark">Version installée</span>
              <span class="tag" :class="[isUpToDate ? 'is-success': 'is-danger']" :title="gitVersion">{{ version.installed }}</span>
            </div>
          </div>
          <div class="control">
            <a v-if="!isUpToDate" class="tags has-addons" :href="version.latestLink" target="_blank" rel="noreferrer">
              <span class="tag is-dark">Dernière version</span>
              <span class="tag is-info">{{ version.latest }}</span>
            </a>
          </div>
        </div>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <p class="content" v-html="description" />
        <p v-if="license.name" class="content">Ce projet est sous la licence <a :href="license.url" target="_blank" rel="noreferrer">{{ license.name }}.</a></p>
      </div>
    </div>
  </section>
</template>

<script>
import { version, license, homepage, vueDom } from '../../package.json'
import axios from 'axios'
import spdxLicenseList from 'spdx-license-list'
import Breadcrumb from '@/components/Breadcrumb'

export default {
  name: 'About',
  components: {
    Breadcrumb,
  },
  data () {
    return {
      name: vueDom.name,
      version: {
        installed: version,
        latest: null,
        latestLink: null,
      },
      // eslint-disable-next-line no-undef
      gitVersion,
      description: vueDom.description,
      license: {
        id: license,
        name: null,
        url: null,
      },
      homepage,
      isUpToDate: true,
    }
  },
  mounted () {
    this.getLastVersion()
    this.getLicense()
  },
  methods: {
    getLastVersion () {
      axios.get(vueDom.latestReleaseUrl)
        .then((response) => {
          this.version.latest = response.data.tag_name
          this.version.latestLink = response.data.html_url
          if (this.version.latest !== this.version.installed) {
            this.isUpToDate = false
          }
        })
    },
    getLicense () {
      Object.assign(this.license, spdxLicenseList[license])
    },
  },
}
</script>
