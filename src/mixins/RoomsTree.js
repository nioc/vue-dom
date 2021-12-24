const cloneDeep = require('lodash.clonedeep')

function setLevel (rooms, parentId, search) {
  const childs = []
  rooms
    .filter((room) => room.parentId === parentId)
    .forEach((childRoom) => {
      childRoom.childs = setLevel(rooms, childRoom.id, search)
      if (childRoom.childs.length === 0) {
        if (Object.prototype.hasOwnProperty.call(childRoom, 'name') && childRoom.name && childRoom.name.toLowerCase().indexOf(search) > -1) {
          childs.push(childRoom)
        }
      } else {
        childs.push(childRoom)
      }
    })
  return childs
}

export const RoomsTreeMixin = {
  methods: {
    getRoomsTree (rooms, search = '') { return setLevel(Object.values(cloneDeep(rooms)), null, search.toLowerCase()) },
  },
}
