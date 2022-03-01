<template>
  <ul>
    <li v-for="room in rooms" :key="room.id">
      <router-link :to="{name: 'admin-room', params: {id: room.id}}" :class="{'has-text-danger': !room.isVisible}"><i v-if="room.icon" class="fa-fw fa-mr" :class="room.icon" />{{ room.name }}</router-link>
      <rooms-tree :rooms="room.childs" />
    </li>
  </ul>
</template>

<script>
export default {
  name: 'RoomsTree',
  props: {
    rooms: {
      type: Array,
      required: true,
    },
  },
}
</script>
