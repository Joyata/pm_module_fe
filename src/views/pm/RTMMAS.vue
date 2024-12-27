<template>
  <CRow>
    <CCol :md="12">
      <SearchFilter
        @search="handleSearch"
        :unreadCount="unreadCount"
        @toggleNotifications="toggleNotificationsModal"
      ></SearchFilter>
    </CCol>
  </CRow>
  <CRow>
    <CCol :md="12">
      <CCard class="mb-3">
        <CCardHeader>
          <h4>Shop Floor Layout</h4>
        </CCardHeader>
        <CCardBody>
          <CRow>
            <CCol v-for="machine in machines" :key="machine.id" sm="6" lg="3">
              <CCard
                class="mb-3 cursor-pointer"
                @click="goToMachine(machine.id)"
              >
                <CCardBody>
                  <CCardTitle>{{ machine.name }}</CCardTitle>
                  <CCardText>
                    <CBadge :color="getStatusColor(machine.status)">
                      {{ machine.status }}
                    </CBadge>
                  </CCardText>
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>

  <!-- Notifications Modal -->
  <Notifications
    :visible="showNotificationsModal"
    @close="toggleNotificationsModal"
  ></Notifications>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import SearchFilter from "../../components/pm/SearchFilter.vue";
import Notifications from "../../components/pm/Notifications.vue";

export default {
  name: "RTMMAS",

  components: {
    SearchFilter,
    Notifications,
  },

  data() {
    return {
      showNotificationsModal: false,
      machines: [
        { id: 1, name: "Machine 1", status: "Running" },
        { id: 2, name: "Machine 2", status: "Running" },
        { id: 3, name: "Machine 3", status: "Idle" },
        { id: 4, name: "Machine 4", status: "Maintenance" },
      ],
    };
  },

  async created() {
    await this.$store.dispatch(
      "notifications/initializeNotifications",
      this.user?.role
    );
  },

  computed: {
    ...mapState("auth", ["user"]),
    ...mapGetters("notifications", ["getUnreadNotifications"]),

    unreadCount() {
      return this.getUnreadNotifications.length;
    },

    userRole() {
      return this.user?.role;
    },
  },

  methods: {
    ...mapActions("machines", ["fetchMachinesByStation"]),
    async handleSearch(searchParams) {
      if (this.selectedStation !== searchParams.station_id) {
        this.selectedStation = searchParams.station_id;
        this.selectedMachine = "";
        if (this.selectedStation) {
          await this.fetchMachinesByStation(this.selectedStation);
        }
      }
    },

    goToMachine(machineId) {
      this.$router.push(`/pm/machine/${machineId}`);
    },
    getStatusColor(status) {
      const colors = {
        Running: "success",
        Idle: "warning",
        Maintenance: "danger",
        Stopped: "secondary",
      };
      return colors[status] || "primary";
    },

    toggleNotificationsModal() {
      this.showNotificationsModal = !this.showNotificationsModal;
    },
  },
};
</script>

<style lang="scss" scoped>
// Extra Small devices (max 575px)
@media (max-width: 575.98px) {
  .card {
    margin-bottom: 0.5rem;
  }

  .card-body {
    padding: 0.75rem;
  }

  .card-title {
    font-size: 1rem;
  }

  .badge {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
  }
}

// Small devices (landscape phones, 576px and up)
@media (min-width: 576px) and (max-width: 767.98px) {
  .card {
    margin-bottom: 1rem;
  }

  .card-title {
    font-size: 1.1rem;
  }

  .badge {
    font-size: 0.85rem;
  }
}

// Medium devices (tablets, 768px and up)
@media (min-width: 768px) and (max-width: 991.98px) {
  .card {
    margin-bottom: 1.25rem;
  }

  .card-body {
    padding: 1rem;
  }
}

// Large devices (desktops, 992px and up)
@media (min-width: 992px) and (max-width: 1199.98px) {
  .card-body {
    padding: 1.25rem;
  }
}

// X-Large devices (large desktops, 1200px and up)
@media (min-width: 1200px) and (max-width: 1399.98px) {
  .card {
    margin-bottom: 1.5rem;
  }
}

// XX-Large devices (larger desktops, 1400px and up)
@media (min-width: 1400px) {
  .card {
    margin-bottom: 1.75rem;
  }

  .card-body {
    padding: 1.5rem;
  }
}

// Base styles (applied to all screen sizes)
.cursor-pointer {
  cursor: pointer;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.02);
  }
}
</style>
