<template>
  <div>
    <AppSidebar />
    <div class="wrapper d-flex flex-column min-vh-100 bg-blurred">
      <AppHeader />
      <div class="body flex-grow-1 px-3">
        <CContainer :fluid="true">
          <router-view />
        </CContainer>
      </div>
      <AppFooter />
    </div>
  </div>
</template>
<script>
import { CContainer } from '@coreui/vue'
import AppFooter from '@/standalone/components/AppFooter.vue'
import AppHeader from '@/standalone/components/AppHeader.vue'
import AppSidebar from '@/standalone/components/AppSidebar.vue'

export default {
  name: 'DefaultLayout',
  components: {
    AppFooter,
    AppHeader,
    AppSidebar,
    CContainer,
  },
}
</script>
