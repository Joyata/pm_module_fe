<template>
  <div class="current-values mt-2">
    <template v-for="axis in availableAxes" :key="axis">
      <div
        :class="[
          'current-value',
          getSensorValueClass(axis, currentValues[axis]),
        ]"
      >
        {{ axis.toUpperCase() }}:
        <span class="fw-bold">
          {{ formatValue(currentValues[axis]) }}
        </span>
        {{ sensorConfig.unit }}
      </div>
    </template>
  </div>
</template>

<script>
export default {
  name: "CurrentValues",
  props: {
    currentValues: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    availableAxes: {
      type: Array,
      required: true,
    },
    sensorConfig: {
      type: Object,
      required: true,
    },
    getSensorValueClass: {
      type: Function,
      required: true,
    },
  },

  methods: {
    formatValue(value) {
      return value !== undefined ? value.toFixed(2) : "N/A";
    },
  },
};
</script>

<style lang="scss" scoped>
.current-values {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.current-value {
  display: inline-flex;
  align-items: center;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  background: #f8f9fa;
  font-size: 0.875rem;
  line-height: 1.2;
  white-space: nowrap;

  &.text-success {
    background-color: rgba(25, 135, 84, 0.1);
  }

  &.text-warning {
    background-color: rgba(255, 193, 7, 0.1);
  }

  &.text-danger {
    background-color: rgba(220, 53, 69, 0.1);
  }

  .fw-bold {
    font-size: 1.1rem;
    padding: 0 0.25rem;
  }
}

@media (max-width: 767.98px) {
  .current-value {
    padding: 0.25rem 0.5rem;
    font-size: 0.8125rem;

    .fw-bold {
      font-size: 1rem;
    }
  }
}
</style>
