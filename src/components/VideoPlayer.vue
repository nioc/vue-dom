<template>
  <video ref="videoPlayer" class="video-js" />
</template>

<script>
import videojs from 'video.js'

export default {
  name: 'VideoPlayer',
  props: {
    src: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    poster: {
      type: String,
      default: null,
    },
    isFullScreen: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Object,
      default () {
        return {
          autoplay: true,
          controls: true,
          sources: [],
        }
      },
    },
  },
  data () {
    return {
      player: null,
    }
  },
  mounted () {
    const options = { ...this.options }
    options.sources = [{
      src: this.src,
      type: this.type,
    }]
    if (this.poster) {
      options.poster = this.poster
    }
    const isFullScreen = this.isFullScreen
    this.player = videojs(this.$refs.videoPlayer, options, function onPlayerReady () {
      if (isFullScreen) {
        this.requestFullscreen()
      }
    })
  },
  beforeUnmount () {
    if (this.player) {
      this.player.dispose()
    }
  },
}
</script>

<style src="video.js/dist/video-js.css"></style>
