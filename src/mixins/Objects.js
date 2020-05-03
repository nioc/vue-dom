import { createNamespacedHelpers } from 'vuex'
const { mapState, mapActions } = createNamespacedHelpers('data')

function findChild (objects, objectsOrdered, parent) {
  if (parent.id) {
    objectsOrdered.push(parent)
  }
  const childs = []
  objects.forEach((object) => {
    if (object.parentId === parent.id) {
      childs.push(object)
    }
  })
  childs.sort((a, b) => a.order - b.order)
  childs.forEach((child) => {
    objectsOrdered = findChild(objects, objectsOrdered, child)
  })
  return objectsOrdered
}

export const ObjectsMixin = {
  computed: {
    objectsOrdered () { return findChild(this.objectsRaw, [], { id: null }) },
    ...mapState(['objects', 'objectsRaw', 'tagsList']),
  },
  methods: {
    ...mapActions(['loadObjects']),
  },
}
