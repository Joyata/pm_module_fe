<template>
  <CFooter class="footer">
    <div class="footer-content">
      <div class="footer-left">
        <a>Maintenance Information System</a>
        <span class="ms-1">&copy; {{ new Date().getFullYear() }} TMMIN</span>
      </div>
      <div class="footer-right">
        <span class="me-1" target="_blank">Powered by</span>
        <a href="https://coreui.io/vue">CoreUI for Vue</a>
      </div>
    </div>
  </CFooter>
</template>

<script>
export default {
  name: "AppFooter",
};
</script>
