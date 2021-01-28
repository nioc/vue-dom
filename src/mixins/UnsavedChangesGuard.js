export const UnsavedChangesGuardMixin = {
  beforeRouteUpdate (to, from, next) {
    // handle application navigation to same component with other params
    this.askConfirmation()
      .then(() => {
        return next()
      })
      .catch(() => {
        return next(false)
      })
  },
  beforeRouteLeave (to, from, next) {
    // handle application navigation to another component
    this.askConfirmation()
      .then(() => {
        return next()
      })
      .catch(() => {
        return next(false)
      })
  },
  beforeMount () {
    // handle browser navigation
    window.addEventListener('beforeunload', this.preventClose)
  },
  beforeDestroy () {
    window.removeEventListener('beforeunload', this.preventClose)
  },
  data () {
    return {
      hasUnsavedChanges: false,
      unwatch: null,
    }
  },
  methods: {
    addUnsavedChangesGuard (watched) {
      this.removeUnsavedChangesGuard()
      this.unwatch = this.$watch(
        watched,
        () => {
          this.hasUnsavedChanges = true
        },
        { deep: true },
      )
    },
    removeUnsavedChangesGuard () {
      if (this.unwatch) {
        this.unwatch()
        this.unwatch = null
        this.hasUnsavedChanges = false
      }
    },
    preventClose (event) {
      if (this.hasUnsavedChanges) {
        event.returnValue = 'Modifications non enregistrées'
      }
    },
    askConfirmation () {
      return new Promise((resolve, reject) => {
        if (!this.hasUnsavedChanges) {
          return resolve()
        }
        this.$buefy.dialog.confirm({
          type: 'is-danger',
          title: 'Modifications non enregistrées',
          message: '<p>Vos changements seront perdus si vous quittez la page.</p><p>Souhaitez-vous continuer ?</p>',
          hasIcon: true,
          icon: 'save',
          iconPack: 'fa',
          confirmText: 'Quitter la page',
          cancelText: 'Rester sur la page',
          onConfirm: () => resolve(),
          onCancel: () => reject(new Error('cancel')),
        })
      })
    },
  },
}
