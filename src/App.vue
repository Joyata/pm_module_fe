<template>
  <!-- <Toaster position="top-center" closeButton /> -->
  <router-view />
</template>

<script>
import { Toaster } from "vue-sonner";

export default {
  name: "App",
  components: {
    Toaster,
  },
};
</script>

<!--
<style lang="scss">
// Import Main styles for this application
//@import 'styles/style';
@import 'styles/custom';
</style>
-->
