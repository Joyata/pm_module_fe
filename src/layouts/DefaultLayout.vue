<template>
  <div>
    <div class="body flex-grow-1 px-3">
      <CContainer lg style="margin: 0px!important;">
        <router-view />
      </CContainer>
    </div>
  </div>
</template>
<script>
import { CContainer } from '@coreui/vue'
//import AppFooter from '@/components/AppFooter.vue'
//import AppHeader from '@/components/AppHeader.vue'
//import AppSidebar from '@/components/AppSidebar.vue'
//import router from '@/router'

export default {
  name: 'DefaultLayout',
  components: {
    CContainer,
  },
  setup() {
    /*
      const getBreadcrumbs = () => {
        return router.currentRoute.value.matched.map((route) => {
          return {
            active: route.path === router.currentRoute.value.fullPath,
            name: route.name,
            path: `${router.options.history.base}${route.path}`,
          }
        })
      }
      router.afterEach(() => {
        let breadcrumbs = getBreadcrumbs()
        localStorage.breadcrumbs=JSON.stringify(breadcrumbs);
        document.getElementById("breadcrumbsChangeValue").click();
        console.log(localStorage.breadcrumbs)
      })
    */
  }
}
</script>
