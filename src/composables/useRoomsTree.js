import cloneDeep from 'lodash.clonedeep'

export function useRoomsTree() {
  const getRoomsOrdered = (roomsRaw) => {
    return findChild(roomsRaw.filter((room) => room.isVisible), [], { id: null })
  }
  const getRoomsTree = (rooms, search = '') => {
    return setLevel(Object.values(cloneDeep(rooms)), null, search.toLowerCase())
  }
  return {
    getRoomsOrdered,
    getRoomsTree,
  }
}
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
