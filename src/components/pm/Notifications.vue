<template>
  <div>
    <!-- Toast Notifications -->
    <CToaster placement="top-end">
      <CToast
        v-for="notification in notifications"
        :key="notification.id"
        :autohide="true"
        :delay="5000"
        :class="getNotificationClass(notification.category)"
      >
        <CToastHeader closeButton>
          <span class="me-auto fw-bold">{{ notification.title }}</span>
          <small class="text-muted">{{
            formatTime(notification.timestamp)
          }}</small>
        </CToastHeader>
        <CToastBody>{{ notification.message }}</CToastBody>
      </CToast>
    </CToaster>

    <!-- Modal Notifications -->
    <CModal :visible="showModal" @close="closeModal" size="lg">
      <CModalHeader>
        <CModalTitle>Notifications</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <!-- Notification Tabs -->
        <CNav variant="tabs" role="tablist" class="justify-content-center">
          <CNavItem role="presentation">
            <CNavLink
              href="javascript:void(0);"
              :active="activeTab === 'unread'"
              @click="activeTab = 'unread'"
            >
              Unread
              <CBadge
                v-if="unreadCount"
                color="danger"
                shape="rounded-pill"
                class="ms-1"
              >
                {{ unreadCount }}
              </CBadge>
            </CNavLink>
          </CNavItem>
          <CNavItem role="presentation">
            <CNavLink
              href="javascript:void(0);"
              :active="activeTab === 'read'"
              @click="activeTab = 'read'"
            >
              Read
            </CNavLink>
          </CNavItem>
        </CNav>

        <!-- Notification Content -->
        <CTabContent class="mt-3">
          <!-- Unread Notifications -->
          <CTabPane :visible="activeTab === 'unread'">
            <CListGroup v-if="unreadNotifications.length > 0">
              <CListGroupItem
                v-for="notification in unreadNotifications"
                :key="notification.id"
                :class="getNotificationClass(notification.category)"
                :color="getNotificationColor(notification.category)"
              >
                <div class="d-flex w-100 justify-content-between">
                  <h5 class="mb-1">{{ notification.title }}</h5>
                  <small>{{ formatDate(notification.timestamp) }}</small>
                </div>
                <p class="mb-1">{{ notification.message }}</p>
                <CButton
                  color="link"
                  size="sm"
                  @click="markAsRead(notification.id)"
                >
                  Mark as read
                </CButton>
              </CListGroupItem>
            </CListGroup>
            <p v-else class="text-center py-3">No unread notifications</p>
          </CTabPane>

          <!-- Read Notifications -->
          <CTabPane :visible="activeTab === 'read'">
            <CListGroup v-if="readNotifications.length > 0">
              <CListGroupItem
                v-for="notification in readNotifications"
                :key="notification.id"
                :class="getNotificationClass(notification.category)"
                :color="getNotificationColor(notification.category)"
              >
                <div class="d-flex w-100 justify-content-between">
                  <h5 class="mb-1">{{ notification.title }}</h5>
                  <small>{{ formatDate(notification.timestamp) }}</small>
                </div>
                <p class="mb-1">{{ notification.message }}</p>
              </CListGroupItem>
            </CListGroup>
            <p v-else class="text-center py-3">No read notifications</p>
          </CTabPane>
        </CTabContent>
      </CModalBody>
      <CModalFooter>
        <CButton
          color="primary"
          @click="markAllAsRead"
          :disabled="unreadNotifications.length === 0"
        >
          Mark all as read
        </CButton>
        <CButton color="secondary" @click="closeModal"> Close </CButton>
      </CModalFooter>
    </CModal>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";

export default {
  name: "Notifications",
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      activeTab: "unread",
      showModal: false,
    };
  },
  computed: {
    ...mapGetters("notifications", [
      "getNotifications",
      "getUnreadNotifications",
      "getReadNotifications",
    ]),
    notifications() {
      return this.getNotifications;
    },
    unreadNotifications() {
      return this.getUnreadNotifications;
    },
    readNotifications() {
      return this.getReadNotifications;
    },
    unreadCount() {
      return this.unreadNotifications.length;
    },
  },
  methods: {
    ...mapActions("notifications", [
      "markAsRead",
      "markAllAsRead",
      "removeNotification",
    ]),
    formatDate(timestamp) {
      return new Date(timestamp).toLocaleString("en-GB");
    },
    formatTime(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    getNotificationColor(category) {
      switch (category) {
        case "task":
          return "info";
        case "inventory":
          return "warning";
        case "approval":
          return "success";
        case "problem":
          return "danger";
        case "scheduling":
          return "primary";
        case "report":
          return "dark";
        default:
          return "light";
      }
    },
    getNotificationClass(category) {
      return `notification-${this.getNotificationColor(category)}`;
    },

    closeModal() {
      this.showModal = false;
      this.$emit("close");
    },
  },
  watch: {
    visible(newValue) {
      this.showModal = newValue;
    },
  },
};
</script>

<style scoped>
.notification-info {
  border-left: 4px solid var(--cui-info);
}
.notification-warning {
  border-left: 4px solid var(--cui-warning);
}
.notification-success {
  border-left: 4px solid var(--cui-success);
}
.notification-danger {
  border-left: 4px solid var(--cui-danger);
}
.notification-primary {
  border-left: 4px solid var(--cui-primary);
}
.notification-dark {
  border-left: 4px solid var(--cui-dark);
}
</style>
