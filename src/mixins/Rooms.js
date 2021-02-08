import { createNamespacedHelpers } from 'vuex'
const { mapState, mapGetters, mapActions } = createNamespacedHelpers('data')

function findChild (rooms, roomsOrdered, parent) {
  if (parent.id !== null) {
    roomsOrdered.push(parent)
  }
  const childs = []
  rooms.forEach((room) => {
    if (room.parentId === parent.id) {
      childs.push(room)
    }
  })
  childs.sort((a, b) => a.order - b.order)
  childs.forEach((child) => {
    roomsOrdered = findChild(rooms, roomsOrdered, child)
  })
  return roomsOrdered
}

export const RoomsMixin = {
  computed: {
    roomsOrdered () { return findChild(this.roomsRaw.filter((room) => room.isVisible), [], { id: null }) },
    ...mapState(['rooms', 'roomsRaw', 'tagsList']),
    ...mapGetters([
      'getRoomVisiblesEquipment',
    ]),
  },
  methods: {
    ...mapActions(['vxLoadRooms']),
  },
}
