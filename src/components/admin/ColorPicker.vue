<template>
  <label for="input-color" class="input button is-flex p-2" title="Choisir une couleur">
    <span class="icon is-small m-0" :style="`color: ${hexValue};`">
      <i class="fas fa-palette" />
    </span>
    <input id="input-color" v-model="hexValue" type="color" style="display: none">
  </label>

</template>

<script>
export default {
  name: 'ColorPicker',
  props: {
    modelValue: {
      type: String,
      required: true,
    },
  },
  emits: ['update:modelValue'],
  computed: {
    hexValue: {
      get() {
        return this.rgbToHex(this.modelValue)
      },
      set(value) {
        this.$emit('update:modelValue', this.hexToRgb(value))
      },
    },
  },
  methods: {
    rgbToHex (rgbString) {
      if (!rgbString) {
        return '#000000'
      }
      const [r, g, b] = rgbString.match(/(0?\.?\d{1,3})%?\b/g).map(component => Number(component))
      return '#' + [r, g, b].map(x => {
        const hex = x.toString(16)
        return hex.length === 1 ? '0' + hex : hex
      }).join('')
    },
    hexToRgb (hex) {
      return 'rgb('+hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
        ,(m, r, g, b) => '#' + r + r + g + g + b + b)
        .substring(1).match(/.{2}/g)
        .map(x => parseInt(x, 16))
        .join(', ') + ')'
    },
  },
}
</script>
