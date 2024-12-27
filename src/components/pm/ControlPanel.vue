<template>
  <div class="controls-section">
    <div class="controls-wrapper">
      <!-- Time Range Group -->
      <div class="time-range-group">
        <div
          v-for="range in timeRanges"
          :key="range.value"
          class="control-item"
          :class="{ active: selectedRange === range.value }"
          @click="$emit('range-change', range.value)"
        >
          <span class="control-value">{{ range.label }}</span>
          <span class="control-label">{{ range.description }}</span>
        </div>
      </div>

      <!-- Action Buttons Group -->
      <div class="action-buttons-group">
        <div
          class="control-item action-btn"
          :class="{
            'btn-danger': isMonitoring,
            'btn-success': !isMonitoring,
          }"
          @click="$emit('toggle-monitoring')"
        >
          <CIcon
            :icon="isMonitoring ? 'cil-media-pause' : 'cil-media-play'"
            size="xl"
            class="control-icon"
          />
          <span class="control-value">{{
            isMonitoring ? "Pause" : "Resume"
          }}</span>
          <span class="control-label">Monitoring</span>
        </div>

        <div
          class="control-item action-btn btn-primary"
          @click="$emit('show-export')"
        >
          <CIcon icon="cil-cloud-download" size="xl" class="control-icon" />
          <span class="control-value">Export</span>
          <span class="control-label">Download Data</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ControlPanel",
  props: {
    timeRanges: {
      type: Array,
      required: true,
    },
    selectedRange: {
      type: String,
      required: true,
    },
    isMonitoring: {
      type: Boolean,
      required: true,
    },
  },
  emits: ["range-change", "toggle-monitoring", "show-export"],
};
</script>

<style lang="scss" scoped>
.controls-section {
  background: #fff;
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.controls-wrapper {
  display: flex;
  gap: 2rem;
  align-items: stretch;
}

.time-range-group {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.action-buttons-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  min-width: 300px;
}

.control-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 100px;
  text-align: center;

  &:hover:not(.active) {
    background: #b6b6b6;
    transform: translateY(-1px);
  }

  &.active {
    background: #0d6efd;
    border-color: #0d6efd;
    color: white;

    .control-label {
      opacity: 1;
    }

    &::after {
      content: "";
      position: absolute;
      bottom: -4px;
      left: 50%;
      transform: translateX(-50%);
      width: 8px;
      height: 8px;
      background: currentColor;
      border-radius: 50%;
    }
  }
}

.action-btn {
  border: none;
  color: white;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(110%);
  }

  &:active {
    transform: translateY(1px);
  }

  &.btn-danger {
    background: #dc3545;
  }

  &.btn-success {
    background: #198754;
  }

  &.btn-primary {
    background: #0d6efd;
  }

  .control-icon {
    transition: transform 0.2s ease;
  }

  &:hover .control-icon {
    transform: translateY(-2px);
  }
}

.control-icon {
  margin-bottom: 0.5rem;
  height: 24px;
  width: 24px;
}

.control-value {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: 0.25rem;
}

.control-label {
  font-size: 0.75rem;
  opacity: 0.85;
  line-height: 1.2;
}

@media (max-width: 991.98px) {
  .controls-wrapper {
    flex-direction: column;
    gap: 1rem;
  }

  .action-buttons-group {
    min-width: 100%;
  }
}

@media (max-width: 575.98px) {
  .time-range-group {
    grid-template-columns: repeat(2, 1fr);
  }

  .action-buttons-group {
    grid-template-columns: 1fr;
  }

  .control-item {
    min-height: 80px;
  }
}
</style>
