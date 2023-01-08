<template>
  <span>
    <span v-if="userAgent.browser && userAgent.browser.name" class="mr-3 is-block-mobile is-inline-block-tablet" style="white-space: nowrap;">
      <i :class="userAgent.browser.iconClass" />
      {{ userAgent.browser.name }}{{ userAgent.browser.version ? ' '+userAgent.browser.version : '' }}
    </span>
    <span v-if="userAgent.os && userAgent.os.name" class="mr-3 is-block-mobile is-inline-block-tablet" style="white-space: nowrap;">
      <i :class="userAgent.os.iconClass" />
      {{ userAgent.os.name }}{{ userAgent.os.version ? ' '+userAgent.os.version : '' }}
    </span>
    <span v-if="userAgent.device && userAgent.device.type && userAgent.device.type === 'mobile'" class="is-block-mobile is-inline-block-tablet" style="white-space: nowrap;">
      <i class="fas fa-fw fa-mobile-alt" />
      {{ userAgent.device.vendor }}{{ userAgent.device.model ? ' '+userAgent.device.model : '' }}
    </span>
  </span>
</template>

<script>
import UAParser from 'ua-parser-js'
import { provider } from '@/services/Provider'

export default {
  name: 'UserAgent',
  props: {
    userAgentString: {
      type: String,
      default: '',
    },
  },
  data () {
    return {
      browsersList: provider.getBrowsersList(),
    }
  },
  computed: {
    userAgent () {
      const userAgent = new UAParser(this.userAgentString, { browser: this.browsersList }).getResult()
      if (Object.prototype.hasOwnProperty.call(userAgent.browser, 'name') && userAgent.browser.name) {
        switch (userAgent.browser.name.toLowerCase()) {
          case 'firefox':
            userAgent.browser.iconClass = 'fa-fw fab fa-firefox-browser'
            break
          case window.custom.provider.system:
            userAgent.browser.iconClass = 'fa-fw fa fa-vue-dom'
            break
          case 'chrome':
          case 'chrome webview':
          case 'chromium':
            userAgent.browser.iconClass = 'fa-fw fab fa-chrome'
            break
          case 'mobile safari':
          case 'safari':
            userAgent.browser.iconClass = 'fa-fw fab fa-safari'
            break
          case 'edge':
            userAgent.browser.iconClass = 'fa-fw fab fa-edge'
            break
          case 'ie':
            userAgent.browser.iconClass = 'fa-fw fab fa-internet-explorer'
            break
          default:
            userAgent.browser.iconClass = 'fa-fw far fa-question-circle'
        }
      }
      if (Object.prototype.hasOwnProperty.call(userAgent, 'os')) {
        switch (userAgent.os.name) {
          case 'Ubuntu':
            userAgent.os.iconClass = 'fa-fw fab fa-ubuntu'
            break
          case 'Linux':
          case 'Debian':
          case 'Unix':
            userAgent.os.iconClass = 'fa-fw fab fa-linux'
            break
          case 'Android':
          case 'Android-x86':
            userAgent.os.iconClass = 'fa-fw fab fa-android'
            break
          case 'iOS':
          case 'Mac OS':
            userAgent.os.iconClass = 'fa-fw fab fa-apple'
            break
          case 'Windows':
          case 'Windows Phone':
          case 'Windows Mobile':
            userAgent.os.iconClass = 'fa-fw fab fa-windows'
            break
          case 'CentOS':
            userAgent.os.iconClass = 'fa-fw fab fa-centos'
            break
          case 'SUSE':
            userAgent.os.iconClass = 'fa-fw fab fa-suse'
            break
          case 'RedHat':
            userAgent.os.iconClass = 'fa-fw fab fa-redhat'
            break
          case 'Fedora':
            userAgent.os.iconClass = 'fa-fw fab fa-fedora'
            break
          default:
            userAgent.os.iconClass = 'fa-fw far fa-question-circle'
        }
      }
      return userAgent
    },
  },
}
</script>
