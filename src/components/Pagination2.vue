<template>
  <CRow>
    <CCol md="4">
      <CRow class="mb-3">
        <CFormLabel for="rowperpage" class="col-4 col-form-label">
          Row per page
        </CFormLabel>
        <div class="col-4">
          <CFormSelect
            v-model="this.row_per_page"
            :options="optionsRowPerPage"
            v-on:change="changeRowPerPage($event)"
          >
          </CFormSelect>
        </div>
      </CRow>
    </CCol>
    <CCol v-if="parseInt(this.props.page.totalPages) > 0">
      <CRow class="mb-3 row justify-content-md-end">
        <CFormLabel for="gotopage" class="col-4 col-form-label text-end">
          Go to page
        </CFormLabel>
        <div class="col-3">
          <CFormInput
            type="number"
            placeholder="..."
            v-model="this.gotopage"
            @input="handleSearch($event)"
            min="1"
            :max="this.props.page.totalPages"
          />
        </div>
      </CRow>
    </CCol>
    <CCol md="3" v-if="parseInt(this.props.page.totalPages) > 0">
      <CPagination align="end">
        <CPaginationItem
          aria-label="Previous"
          href="#"
          :disabled="this.props.page.pageNo > 1 ? false : true"
          @click.prevent="doDoSearch(1)"
        >
          <span aria-hidden="true">&laquo</span>
        </CPaginationItem>
        <CPaginationItem
          v-if="this.arrayPages[0] > 0"
          :active="this.arrayPages[0] == this.props.page.pageNo ? true : false"
          href="#"
          @click.prevent="doDoSearch(parseInt(this.arrayPages[0]))"
        >
          {{ this.arrayPages[0] }}
        </CPaginationItem>
        <CPaginationItem
          v-if="this.arrayPages[1] >= 1 && this.arrayPages[1] <= (parseInt(this.props.page.totalPages))"
            :active='this.arrayPages[1]==this.props.page.pageNo? true : false ' href="#"
            @click.prevent="doDoSearch(parseInt(this.arrayPages[1]))">{{ this.arrayPages[1] }}</CPaginationItem>
        <CPaginationItem v-if="this.arrayPages[2]>=1 && this.arrayPages[2]<=(parseInt(this.props.page.totalPages))"
            :active='this.arrayPages[2]==this.props.page.pageNo? true : false ' href="#"
            @click.prevent="doDoSearch(parseInt(this.arrayPages[2]))">{{ this.arrayPages[2] }}</CPaginationItem>
        <CPaginationItem v-if="this.arrayPages[3]<=(parseInt(this.props.page.totalPages))"
            :active='this.arrayPages[3]==this.props.page.pageNo? true : false ' href="#"
            @click.prevent="doDoSearch(parseInt(this.arrayPages[3]))">{{ this.arrayPages[3] }}</CPaginationItem>
        <CPaginationItem v-if="this.arrayPages[4]<=(parseInt(this.props.page.totalPages))"
            :active='this.arrayPages[4]==this.props.page.pageNo? true : false ' href="#"
            @click.prevent="doDoSearch(parseInt(this.arrayPages[4]))">{{ this.arrayPages[4] }}</CPaginationItem>
        <CPaginationItem aria-label="Next" href="#"
            :disabled='this.props.page.pageNo<this.props.page.totalPages?false:true'
            @click.prevent="doDoSearch(parseInt(this.props.page.totalPages))">
            <span aria-hidden="true">&raquo</span>
        </CPaginationItem>
      </CPagination>
    </CCol>
  </CRow>
</template>
<script>
import datas from '@/utils/CommonData'
export default {
  name: 'Pagination',
  // obj: {}
  props: ['page', 'doSearch', 'changePageSize'],
  emits: ['update:page'],
  watch: {
    page() {
      this.$emit('update:page', this.props.page)
      this.setPage()
    },
  },
  data(props) {
    return {
      props: props,
      arrayPages: [0, 0, 0, 0, 0],
      optionsRowPerPage: datas.optionsRowPerPage,
      row_per_page: '',
      gotopage: 1,
      prevSearchTime: null,
      prevClick: 0,
    }
  },
  methods: {
    async changeRowPerPage(event) {
      let firstRowInPage = ((this.props.page.pageNo-1) * this.props.page.pageSize) + 1
      let targetPage = parseInt(firstRowInPage / event.target.value)
      await this.props.changePageSize(this.row_per_page,targetPage)

      this.doDoSearch(parseInt(targetPage) + 1)
      this.setPage()
    },
    doDoSearch(page) {
      console.log(page ? page : 1 + 'xx' + this.prevClick)
      let _page = page ? page : 1
      this.props.page.pageSize = this.row_per_page
      this.props.page.pageNo = _page
      this.props.doSearch(_page, this.row_per_page)
      this.setPage()
    },
    setPage() {
      if (parseInt(this.props.page.pageNo) === 1) {
        this.arrayPages[0] = parseInt(this.props.page.pageNo)
        this.arrayPages[1] = parseInt(this.props.page.pageNo) + 1
        this.arrayPages[2] = parseInt(this.props.page.pageNo) + 2
        this.arrayPages[3] = parseInt(this.props.page.pageNo) + 3
        this.arrayPages[4] = parseInt(this.props.page.pageNo) + 4
      } else if (parseInt(this.props.page.pageNo) === 2) {
        this.arrayPages[0] = parseInt(this.props.page.pageNo) - 1
        this.arrayPages[1] = parseInt(this.props.page.pageNo)
        this.arrayPages[2] = parseInt(this.props.page.pageNo) + 1
        this.arrayPages[3] = parseInt(this.props.page.pageNo) + 2
        this.arrayPages[4] = parseInt(this.props.page.pageNo) + 3
      } else if (parseInt(this.props.page.pageNo) === parseInt(this.props.page.totalPages) - 1) {
        this.arrayPages[0] = parseInt(this.props.page.pageNo) - 3
        this.arrayPages[1] = parseInt(this.props.page.pageNo) - 2
        this.arrayPages[2] = parseInt(this.props.page.pageNo) - 1
        this.arrayPages[3] = parseInt(this.props.page.pageNo)
        this.arrayPages[4] = parseInt(this.props.page.pageNo) + 1
      } else if (parseInt(this.props.page.pageNo)>0 && parseInt(this.props.page.pageNo) === parseInt(this.props.page.totalPages)) {
        this.arrayPages[0] = parseInt(this.props.page.pageNo) - 4
        this.arrayPages[1] = parseInt(this.props.page.pageNo) - 3
        this.arrayPages[2] = parseInt(this.props.page.pageNo) - 2
        this.arrayPages[3] = parseInt(this.props.page.pageNo) - 1
        this.arrayPages[4] = parseInt(this.props.page.pageNo)
      } else {
        this.arrayPages[0] = parseInt(this.props.page.pageNo) - 2
        this.arrayPages[1] = parseInt(this.props.page.pageNo) - 1
        this.arrayPages[2] = parseInt(this.props.page.pageNo)
        this.arrayPages[3] = parseInt(this.props.page.pageNo) + 1
        this.arrayPages[4] = parseInt(this.props.page.pageNo) + 2
      }
    },
    handleSearch(event) {
      const val = event.target.value.replace(/[^\d]/g, '') // strips letters, keeps numbers
      this.doDoSearch(val)
    },
  },
  created() {
    this.row_per_page = this.props.page.pageSize
    this.setPage()
  },
  setup() {
    return {}
  },
}
</script>
