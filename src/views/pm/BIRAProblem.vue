<template>
  <CRow>
    <CCol :md="12">
      <SearchFilter></SearchFilter>
    </CCol>
  </CRow>
  <CRow>
    <CCol :md="12">
      <CCard class="mb-3">
        <CCardBody>
          <CRow class="mb-3">
            <CCol>
              <TableBIRA
                :update-bira-status="updateBIRAStatus"
                :current-page-BIRA="currentPageBIRA"
                :items-per-page="itemsPerPage"
                @change-page="changePageBIRA"
              ></TableBIRA>
            </CCol>
          </CRow>

          <!-- Pagination Controls -->
          <CPagination
            align="end"
            :pages="totalBIRAPages"
            :active-page="currentPageBIRA"
            @update:active-page="changePageBIRA"
            aria-label="Page navigation example"
          >
            <CPaginationItem
              :disabled="currentPageBIRA === 1"
              @click="prevPageBIRA"
            >
              Previous
            </CPaginationItem>
            <CPaginationItem
              v-for="page in totalBIRAPages"
              :key="page"
              :active="page === currentPageBIRA"
              @click="changePageBIRA(page)"
            >
              {{ page }}
            </CPaginationItem>
            <CPaginationItem
              :disabled="currentPageBIRA === totalBIRAPages"
              @click="nextPageBIRA"
            >
              Next
            </CPaginationItem>
          </CPagination>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import SearchFilter from "../../components/pm/SearchFilter.vue";
import TableBIRA from "../../components/pm/TableBIRA.vue";

export default {
  name: "BIRAProblem",
  components: {
    SearchFilter,
    TableBIRA,
  },
  data() {
    return {
      loading: false,
      currentPageBIRA: 1,
      itemsPerPage: 5,
      BIRA: [],
    };
  },
  computed: {
    ...mapGetters("BIRA", ["allBIRA"]),
    totalBIRAPages() {
      return this.allBIRA
        ? Math.ceil(this.allBIRA.length / this.itemsPerPage)
        : 0;
    },
  },
  methods: {
    ...mapActions("BIRA", ["fetchBIRA"]),
    changePageBIRA(page) {
      this.currentPageBIRA = page;
      console.log(page);
      console.log(this.currentPageBIRA);
    },
    prevPageBIRA() {
      if (this.currentPageBIRA > 1) {
        this.currentPageBIRA--;
      }
    },
    nextPageBIRA() {
      if (this.currentPageBIRA < this.totalBIRAPages) {
        this.currentPageBIRA++;
      }
    },
  },
  mounted() {
    this.fetchBIRA();
  },
};
</script>
