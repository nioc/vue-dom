import Vue from 'vue'
import Vuex from 'vuex'
import app from '@/store/modules/app'
import objects from '@/store/modules/objects'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    app,
    objects,
  },

  strict: process.env.NODE_ENV !== 'production',
})
