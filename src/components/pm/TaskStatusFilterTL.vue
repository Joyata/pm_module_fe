<template>
  <div
    class="status-filter-container"
    :class="{ 'horizontal-layout': isHorizontal }"
  >
    <CRow class="g-2" :class="{ 'justify-content-between': isHorizontal }">
      <CCol
        v-for="(button, index) in statusButtons"
        :key="index"
        :xs="isHorizontal ? 6 : 12"
        :sm="isHorizontal ? 6 : 12"
        :md="isHorizontal ? 3 : 12"
        :lg="isHorizontal ? 3 : 12"
      >
        <CButton
          class="status-btn"
          :class="[
            { active: modelValue === button.status },
            getButtonColorClass(button.status),
          ]"
          @click="$emit('update:modelValue', button.status)"
        >
          <span class="status-label">{{ button.label }}</span>
          <span class="status-count">{{ button.count }}</span>
        </CButton>
      </CCol>
    </CRow>
  </div>
</template>

<script>
export default {
  name: "TaskStatusFilter",
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    statusButtons: {
      type: Array,
      required: true,
    },
    isHorizontal: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["update:modelValue"],
  methods: {
    getButtonColorClass(status) {
      switch (status) {
        case "ALL":
          return "btn-total";
        case "PENDING":
          return "btn-pending";
        case "APPROVED":
          return "btn-approved";
        case "REJECTED":
          return "btn-rejected";
        default:
          return "";
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.status-filter-container {
  width: 100%;

  &.horizontal-layout {
    .status-btn {
      height: 80px;
    }

    @media (max-width: 767.98px) {
      .status-btn {
        height: 70px;
      }
    }
  }
}

.status-btn {
  width: 100%;
  min-height: 64px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0.75rem;
  border: none;
  border-radius: 0.5rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  &.active {
    transform: scale(1.02);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .status-label {
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.25rem;
  }

  .status-count {
    font-size: 1.25rem;
    font-weight: 600;
  }

  // Status Colors with improved contrast
  &.btn-total {
    background-color: #78909c;
    color: white;

    &:hover {
      background-color: darken(#78909c, 5%);
    }
  }

  &.btn-approved {
    background-color: #4caf50;
    color: white;

    &:hover {
      background-color: darken(#4caf50, 5%);
    }
  }

  &.btn-pending {
    background-color: #ffa726;
    color: white;

    &:hover {
      background-color: darken(#ffa726, 5%);
    }
  }

  &.btn-rejected {
    background-color: #ef5350;
    color: white;

    &:hover {
      background-color: darken(#ef5350, 5%);
    }
  }
}

// Responsive styles
@media (max-width: 575.98px) {
  .status-btn {
    padding: 0.5rem;
    min-height: 60px;

    .status-label {
      font-size: 0.75rem;
    }

    .status-count {
      font-size: 1.125rem;
    }
  }

  .horizontal-layout {
    .row {
      margin: -0.25rem;
    }

    .col {
      padding: 0.25rem;
    }
  }
}

@media (min-width: 576px) and (max-width: 991.98px) {
  .horizontal-layout {
    .status-btn {
      .status-label {
        font-size: 0.8125rem;
      }
    }
  }
}
</style>
