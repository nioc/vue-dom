import { useDialog } from '@/composables/useDialog'
import { onBeforeMount, onUnmounted, watch } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

export function useUnsavedChangesGuard() {
  let hasUnsavedChanges = false
  let unwatch = null

  onBeforeRouteUpdate (async () => {
    // handle application navigation to same component with other params
    return await askConfirmation()
  })

  onBeforeRouteLeave (async () => {
    // handle application navigation to another component
    return await askConfirmation()
  })

  onBeforeMount(() => {
    // handle browser navigation
    window.addEventListener('beforeunload', preventClose)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeunload', preventClose)
  })

  function addUnsavedChangesGuard (watched) {
    removeUnsavedChangesGuard()
    unwatch = watch(
      watched,
      () => {
        hasUnsavedChanges = true
      },
      { deep: true },
    )
  }

  function removeUnsavedChangesGuard () {
    if (unwatch) {
      unwatch()
      unwatch = null
      hasUnsavedChanges = false
    }
  }

  function preventClose (event) {
    if (hasUnsavedChanges) {
      event.returnValue = 'Modifications non enregistrées'
    }
  }

  async function askConfirmation () {
    if (!hasUnsavedChanges) {
      return true
    }
    const { confirm } = useDialog()
    return (await confirm({
      type: 'is-danger',
      title: 'Modifications non enregistrées',
      message: '<p>Vos changements seront perdus si vous quittez la page.</p><p>Souhaitez-vous continuer ?</p>',
      hasIcon: true,
      hasCancelButton: true,
      iconClass: 'fas fa-save',
      confirmText: 'Quitter la page',
      cancelText: 'Rester sur la page',
    })).action === 'ok'
  }

  return {
    hasUnsavedChanges,
    addUnsavedChangesGuard,
    removeUnsavedChangesGuard,
  }
}
