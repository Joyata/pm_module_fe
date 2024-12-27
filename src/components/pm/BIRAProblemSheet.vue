<template>
  <div>
    <div v-for="(item, index) in ngItems" :key="index" class="mb-4">
      <CCard>
        <CCardHeader>
          <CCardTitle>Item Check: {{ item.itemCheck }}</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CFormGroup class="mt-3">
            <!-- <CFormLabel>Problem Description</CFormLabel> -->
            <CFormTextarea
              :id="`problem-description-${index}`"
              v-model="problemDescriptions[index]"
              :rows="3"
              placeholder="Describe the problem..."
            ></CFormTextarea>
          </CFormGroup>
        </CCardBody>
      </CCard>
    </div>
  </div>
</template>

<script>
import { CCardBody, CCardHeader, CFormTextarea, CFormGroup } from "@coreui/vue";

export default {
  name: "BIRAProblemSheet",
  props: ["ngItems"],
  data() {
    return {
      problemDescriptions: [],
    };
  },
  // created() {
  //   this.ngItems.forEach((item) => {
  //     this.biraResponses[item.itemCheck] = {
  //       background: "",
  //       issue: "",
  //       recommendation: "",
  //       action: "",
  //     };
  //   });
  // },
  methods: {
    // submitBIRA() {
    //   // Here you would typically send the BIRA responses to your backend
    //   console.log(this.biraResponses);
    //   this.$emit("bira-submitted");
    // },
    submitForm() {
      // Validate that all items have a description
      const allFilled = this.ngItems.every(
        (item, index) => this.problemDescriptions[index]
      );
      if (allFilled) {
        this.$emit("bira-submitted", this.problemDescriptions);
      } else {
        // Show an error message or handle incomplete form
        alert("Please fill in all problem descriptions");
      }
    },
  },
};
</script>
