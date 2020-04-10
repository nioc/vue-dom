<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: '/', icon: 'fa-home', text: 'Home', isActive: true}]" :summary="summary" />
    </div>
    <div class="hero-body">
      <div class="container">
        <div class="columns is-multiline">
          <object-tile v-for="object in ordered" :id="object.id" :key="object.id" />
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ObjectsMixin } from '@/mixins/Objects'
import { SummaryMixin } from '@/mixins/Summary'
import Breadcrumb from '@/components/Breadcrumb'
import ObjectTile from '@/components/ObjectTile'

function findChild (objects, objectsOrdered, parent) {
  if (parent.id) {
    objectsOrdered.push(parent)
  }
  const childs = []
  objects.forEach((object) => {
    if (object.father_id === parent.id) {
      childs.push(object)
    }
  })
  childs.sort((a, b) => a.order - b.order)
  childs.forEach((child) => {
    objectsOrdered = findChild(objects, objectsOrdered, child)
  })
  return objectsOrdered
}

export default {
  name: 'Objects',
  components: {
    Breadcrumb,
    ObjectTile,
  },
  mixins: [ObjectsMixin, SummaryMixin],
  computed: {
    ordered () { return findChild(this.objectsRaw, [], { id: null }) },
    summary () { return this.objectsSummaryById(0) },
  },
}
</script>
