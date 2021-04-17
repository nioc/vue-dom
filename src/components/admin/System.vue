<template>
  <section class="hero">
    <div class="hero-head">
      <breadcrumb :items="[{link: {name: 'admin'}, icon: 'fa-tools', text: 'Admin', isActive: false}, {link: {name: 'admin-system'}, icon: 'fa-server', text: 'Système', isActive: true}]" />
    </div>
    <div class="hero-body has-padding-horizontal-7">
      <div class="container">
        <system-jobs />
        <system-logs />
        <system-metrics />
        <system-database />
      </div>
    </div>
  </section>
</template>

<script>
import Breadcrumb from '@/components/Breadcrumb'
import SystemJobs from '@/components/admin/SystemJobs'
import SystemLogs from '@/components/admin/SystemLogs'
import SystemMetrics from '@/components/admin/SystemMetrics'
import SystemDatabase from '@/components/admin/SystemDatabase'

export default {
  name: 'System',
  components: {
    Breadcrumb,
    SystemJobs,
    SystemLogs,
    SystemMetrics,
    SystemDatabase,
  },
}
</script>
