<template>
  <CCard class="mb-3">
    <CCardBody>
      <CRow class="align-items-center g-0">
        <!-- Location Info Fields -->
        <CCol
          :xs="12"
          :sm="6"
          :md="6"
          :lg="2.5"
          v-for="field in locationFields"
          :key="field.id"
        >
          <CInputGroup>
            <CInputGroupText as="label" :for="field.id">
              {{ field.label }}
            </CInputGroupText>
            <CFormInput type="text" :value="field.value" readonly></CFormInput>
          </CInputGroup>
        </CCol>
        <!-- Notification Button -->
        <CCol
          :xs="2"
          :sm="2"
          :md="2"
          :lg="2"
          class="notification-col d-flex justify-content-end"
        >
          <CButton
            color="primary"
            class="notification-btn position-relative"
            @click="$emit('toggleNotifications')"
          >
            <CIcon icon="cil-bell" />
            <CBadge color="secondary" position="top-end" shape="rounded-pill">{{
              unreadCount
            }}</CBadge>
          </CButton>
        </CCol>
      </CRow>
    </CCardBody>
  </CCard>
</template>

<script>
export default {
  name: "LocationCard",

  props: {
    locationFields: {
      type: Array,
      required: true,
    },
    unreadCount: {
      type: Number,
      default: 0,
    },
  },

  emits: ["toggleNotifications"],
};
</script>

<style lang="scss" scoped>
// For Location Info Fields
// Select container styling
.select-container {
  background: white;
  border-radius: 0.375rem;
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;

  label {
    display: block;
    font-size: 0.875rem;
    color: #666;
    margin-bottom: 0.25rem;
  }

  :deep(.form-select) {
    border: none;
    padding: 0.25rem 0;
    font-size: 1rem;
    background-color: transparent !important;
    cursor: pointer;

    &:focus {
      box-shadow: none;
      outline: none;
    }

    &:disabled {
      background-color: transparent;
      opacity: 0.7;
    }
  }
}

// Input Group Styling
:deep(.input-group) {
  .input-group-text {
    min-width: 70px;
    justify-content: center;
    border-right: 1px solid #ced4da;
  }

  .form-select {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}

// Row spacing
:deep(.row) {
  & > [class*="col"] {
    &:not(:last-child) {
      flex: 1;
      margin-right: 0.5rem;
    }

    &:last-child {
      flex: 0 0 auto;
      margin-left: auto;
    }
  }
}

// Responsive Design
// Extra Small devices (max 575px)
@media (max-width: 575.98px) {
  :deep(.row) {
    flex-direction: column;
    gap: 1rem;
    padding: 0;

    & > [class*="col"] {
      width: 100%;
      margin-right: 0;
      padding: 0;

      &:last-child {
        width: 100%;
        padding: 0;
        margin-right: 0.5rem;

        .d-flex {
          width: 100%;
          flex-direction: row;
          gap: 0.5rem;
        }
      }
    }
  }

  :deep(.input-group) {
    width: 100%;
  }
}

// Small devices (landscape phones, 576px and up)
@media (min-width: 576px) and (max-width: 767.98px) {
  :deep(.row) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;

    & > [class*="col"] {
      width: 100%;

      &:last-child {
        grid-column: 1 / -1;

        .d-flex {
          justify-content: stretch;
          gap: 0.5rem;
        }
      }
    }
  }

  :deep(.input-group) {
    width: 100%;
  }
}

// Medium devices (tablets, 768px and up)
@media (min-width: 768px) and (max-width: 991.98px) {
  :deep(.row) {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;

    & > [class*="col"] {
      width: 100%;

      &:last-child {
        grid-column: 1 / -1;

        .d-flex {
          justify-content: stretch;
          gap: 0.5rem;
        }
      }
    }
  }

  :deep(.input-group) {
    width: 100%;
  }
}

// Large devices (desktops, 992px and up)
@media (min-width: 992px) and (max-width: 1199.98px) {
  :deep(.row) {
    & > [class*="col"] {
      padding: 0 0.25rem;
    }
  }
}

// X-Large devices (large desktops, 1200px and up)
@media (min-width: 1200px) and (max-width: 1399.98px) {
  :deep(.row) {
    & > [class*="col"] {
      padding: 0 0.5rem;
    }
  }
}

// XX-Large devices (larger desktops, 1400px and up)
@media (min-width: 1400px) {
  :deep(.row) {
    & > [class*="col"] {
      padding: 0 0.75rem;
    }
  }
}
</style>
