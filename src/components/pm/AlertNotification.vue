<template>
  <div class="notifications-container">
    <TransitionGroup name="notification">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="alert-notification"
        :class="notification.type"
      >
        <div class="alert-icon">
          <CIcon
            v-if="notification.type === 'success'"
            icon="cil-check-circle"
            size="xl"
          />
          <CIcon
            v-else-if="notification.type === 'danger'"
            icon="cil-x-circle"
            size="xl"
          />
          <CIcon
            v-else-if="notification.type === 'warning'"
            icon="cil-warning"
            size="xl"
          />
          <CIcon v-else icon="cil-info" size="xl" />
        </div>
        <div class="alert-content">
          <strong>{{ notification.title }}</strong>
          <p>{{ notification.message }}</p>
        </div>
        <CButton
          color="dark"
          variant="ghost"
          size="sm"
          @click="removeNotification(notification.id)"
        >
          <CIcon icon="cil-x" />
        </CButton>
      </div>
    </TransitionGroup>
  </div>
</template>

<script>
export default {
  name: "AlertNotification",
  data() {
    return {
      notifications: [],
    };
  },
  methods: {
    addNotification(notification) {
      const id = Date.now();
      this.notifications.unshift({
        ...notification,
        id,
      });

      // Limit number of notifications
      if (this.notifications.length > 5) {
        this.notifications.pop();
      }

      // Auto remove after 5 seconds
      setTimeout(() => {
        this.removeNotification(id);
      }, 5000);

      return id;
    },
    removeNotification(id) {
      const index = this.notifications.findIndex((n) => n.id === id);
      if (index !== -1) {
        this.notifications.splice(index, 1);
      }
    },
  },
};
</script>

<style scoped>
.notifications-container {
  position: fixed;
  top: 80px; /* Adjust based on your header height */
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 1033;
  pointer-events: none;
}

.alert-notification {
  pointer-events: auto;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 320px;
  max-width: 400px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: white;
}

.alert-icon {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.alert-content {
  flex-grow: 1;
  padding-right: 10px;
}

.alert-content p {
  margin: 5px 0 0 0;
  font-size: 0.9rem;
}

.alert-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.5);
  transition: width 100ms linear;
}

/* Alert Types */
.warning {
  background-color: #fff3cd;
  border: 1px solid #ffecb5;
  color: #856404;
}

.warning .alert-progress {
  background-color: #856404;
}

.danger {
  background-color: #f8d7da;
  border: 1px solid #f5c2c7;
  color: #721c24;
}

.danger .alert-progress {
  background-color: #721c24;
}

.success {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.success .alert-progress {
  background-color: #155724;
}

.info {
  background-color: #cce5ff;
  border: 1px solid #b8daff;
  color: #004085;
}

.info .alert-progress {
  background-color: #004085;
}

/* Transitions */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Responsive Design */
@media (max-width: 768px) {
  .notifications-container {
    top: 70px;
    right: 10px;
    left: 10px;
  }

  .alert-notification {
    min-width: unset;
    max-width: unset;
    width: 100%;
  }
}
</style>
