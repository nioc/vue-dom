<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-system'}, icon: 'fa-server', text: 'Système', isActive: true}]" />
    </div>
    <div class="hero-body px-3">
      <div class="container">
        <system-jobs />
        <system-logs />
        <system-metrics />
        <system-links />
        <system-database />
      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb.vue'
import SystemJobs from '@/components/admin/SystemJobs.vue'
import SystemLogs from '@/components/admin/SystemLogs.vue'
import SystemMetrics from '@/components/admin/SystemMetrics.vue'
import SystemLinks from '@/components/admin/SystemLinks.vue'
import SystemDatabase from '@/components/admin/SystemDatabase.vue'

export default {
  name: 'System',
  components: {
    Breadcrumb,
    SystemJobs,
    SystemLogs,
    SystemMetrics,
    SystemLinks,
    SystemDatabase,
  },
}
</script>
