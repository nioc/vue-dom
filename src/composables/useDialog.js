import Modal from '@/components/Modal.vue'
import { useProgrammatic } from '@oruga-ui/oruga-next'

export function useDialog() {

  const confirm = async (props = {}, callback) => {
    const { oruga } = useProgrammatic()
    const prompt = oruga.modal.open({
      component: Modal,
      rootClass: 'dialog',
      props,
    })
    const result = await prompt.promise
    if (callback !== undefined) {
      callback(result)
    }
    return result
  }

  const confirmDelete = async (message = 'L\'élément sera supprimé.', modalProps = {}) => {
    return (await confirm({
      type: 'is-danger',
      title: 'Confirmation de suppression',
      message: `<p>${message}</p><p>Souhaitez-vous continuer ?</p>`,
      hasIcon: true,
      hasCancelButton: true,
      iconClass: 'fas fa-trash',
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      ...modalProps,
    })).action === 'ok'
  }

  return {
    confirm,
    confirmDelete,
  }
}
