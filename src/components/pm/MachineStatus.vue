<template>
  <CBadge
    :color="status.color"
    class="px-3 py-2"
    :class="{
      'pulse-animation': status.color !== 'success',
    }"
  >
    <CIcon :icon="getStatusIcon(status.color)" class="me-1"></CIcon>
    {{ status.text }}
  </CBadge>
</template>

<script>
export default {
  name: "MachineStatus",
  props: {
    status: {
      type: Object,
      required: true,
      validator: (value) => {
        return value.hasOwnProperty("color") && value.hasOwnProperty("text");
      },
    },
    getStatusIcon: {
      type: Function,
      required: true,
    },
  },
};
</script>

<style scoped>
.pulse-animation {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}
</style>
