<template>
  <CContainer fluid>
    <CRow>
      <CCol :md="12">
        <SearchFilter></SearchFilter>
      </CCol>
    </CRow>
    <CRow>
      <CCol :md="12">
        <CCard class="mb-3">
          <CCardBody>
            <CRow>
              <CCol :md="3">
                <CInputGroup class="mb-3">
                  <CInputGroupText as="label" for="MonthSelect"
                    >Month</CInputGroupText
                  >
                  <CFormInput
                    v-model="filterStatus.month"
                    type="month"
                    class="form-control"
                    placeholder="Month"
                  >
                  </CFormInput>
                </CInputGroup>
              </CCol>
            </CRow>
            <CRow>
              <CCol lg="12">
                <CCard class="mb-3">
                  <CCardHeader>
                    <CCardTitle>PM Achievement</CCardTitle>
                  </CCardHeader>
                  <CCardBody align="center">
                    <PMAchievement></PMAchievement>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
            <CRow>
              <CCol lg="12">
                <CCard class="mb-3">
                  <CCardHeader>
                    <CCardTitle>BIRA Achievement</CCardTitle>
                  </CCardHeader>
                  <CCardBody align="center">
                    <CRow>
                      <CCol>
                        <CCard class="mb-3">
                          <CCardBody
                            style="
                              background-color: rgba(255, 192, 0, 1);
                              border-radius: 5px;
                            "
                          >
                            <CRow>
                              <CCol style="color: white">
                                <h3>PM1</h3>
                                <h6>MP Not Available</h6>
                              </CCol>
                            </CRow>
                          </CCardBody>
                        </CCard>
                      </CCol>

                      <CCol>
                        <CCard class="mb-3">
                          <CCardBody
                            style="
                              background-color: rgba(255, 51, 153, 1);
                              border-radius: 5px;
                            "
                          >
                            <CRow>
                              <CCol style="color: white">
                                <h3>PM2</h3>
                                <h6>Full Production</h6>
                              </CCol>
                            </CRow>
                          </CCardBody>
                        </CCard>
                      </CCol>
                      <CCol>
                        <CCard class="mb-3">
                          <CCardBody
                            style="
                              background-color: rgba(0, 176, 240, 1);
                              border-radius: 5px;
                            "
                          >
                            <CRow>
                              <CCol style="color: white">
                                <h3>PM3</h3>
                                <h6>Priority Recovery</h6>
                              </CCol>
                            </CRow>
                          </CCardBody>
                        </CCard>
                      </CCol>
                      <CCol>
                        <CCard class="mb-3">
                          <CCardBody
                            style="
                              background-color: rgba(146, 208, 80, 1);
                              border-radius: 5px;
                            "
                          >
                            <CRow>
                              <CCol style="color: white">
                                <h3>PM4</h3>
                                <h6>Support External</h6>
                              </CCol>
                            </CRow>
                          </CCardBody>
                        </CCard>
                      </CCol>
                      <CCol>
                        <CCard class="mb-3">
                          <CCardBody
                            style="
                              background-color: rgba(204, 255, 102, 1);
                              border-radius: 5px;
                            "
                          >
                            <CRow>
                              <CCol style="color: white">
                                <h3>PM5</h3>
                                <h6>Tool Not Available</h6>
                              </CCol>
                            </CRow>
                          </CCardBody>
                        </CCard>
                      </CCol>
                      <CCol>
                        <CCard class="mb-3">
                          <CCardBody
                            style="
                              background-color: rgba(255, 0, 0, 1);
                              border-radius: 5px;
                            "
                          >
                            <CRow>
                              <CCol style="color: white">
                                <h3>PM6</h3>
                                <h6>PM Not Complete</h6>
                              </CCol>
                            </CRow>
                          </CCardBody>
                        </CCard>
                      </CCol>
                    </CRow>
                    <CRow>
                      <CCol>
                        <BIRAAchievement></BIRAAchievement>
                      </CCol>
                      <CCol>
                        <TablePM6></TablePM6>
                      </CCol>
                    </CRow>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </CContainer>
</template>

<script>
import moment from "moment";
import SearchFilter from "../../components/pm/SearchFilter.vue";
import PMAchievement from "../charts/PMAchievement.vue";
import BIRAAchievement from "../charts/BIRAAchievement.vue";
import TablePM6 from "../../components/pm/TablePM6.vue";

export default {
  name: "Achievement",
  data: () => {
    return {
      selectedMonth: moment().format("YYYY-MM"),
      filter: {
        month: `${moment().format("YYYY-MM")}`,
      },
      selectedMonthStatus: moment().format("YYYY-MM"),
      filterStatus: {
        month: `${moment().format("YYYY-MM")}`,
      },
    };
  },
  components: {
    SearchFilter,
    PMAchievement,
    BIRAAchievement,
    TablePM6,
  },
};
</script>

<style scoped></style>
