<template>
  <CRow>
    <CCol>
      <!-- Start:Search -->
      <CCard class="mb-3">
        <CCardBody>
          <CRow class="align-items-center g-0">
            <!-- Plant Select -->
            <CCol :xs="12" :sm="6" :md="6" :lg="2.5">
              <CInputGroup>
                <CInputGroupText as="label" for="PlantSelect"
                  >Plant</CInputGroupText
                >
                <CFormSelect
                  id="PlantSelect"
                  v-model="selectedPlant"
                  :options="plants"
                  @change="onPlantChange"
                  required
                  style="cursor: pointer"
                >
                </CFormSelect>
              </CInputGroup>
            </CCol>
            <!-- Shop Select -->
            <CCol :xs="12" :sm="6" :md="6" :lg="2.5">
              <div v-tooltip="!selectedPlant ? 'Select Plant first!' : ''">
                <CInputGroup required>
                  <CInputGroupText as="label" for="ShopSelect"
                    >Shop</CInputGroupText
                  >
                  <CFormSelect
                    id="ShopSelect"
                    v-model="selectedShop"
                    :options="shops"
                    @change="onShopChange"
                    :disabled="!selectedPlant"
                    style="cursor: pointer"
                  >
                  </CFormSelect>
                </CInputGroup>
              </div>
            </CCol>
            <!-- Line Select -->
            <CCol :xs="12" :sm="6" :md="6" :lg="2.5">
              <div
                v-tooltip="
                  !selectedPlant
                    ? 'Select Plant first!'
                    : !selectedShop
                    ? 'Select Shop first!'
                    : ''
                "
              >
                <CInputGroup required>
                  <CInputGroupText as="label" for="LineSelect"
                    >Line</CInputGroupText
                  >
                  <CFormSelect
                    id="LineSelect"
                    v-model="selectedLine"
                    :options="lines"
                    @change="onLineChange"
                    :disabled="!selectedShop"
                    style="cursor: pointer"
                  >
                  </CFormSelect>
                </CInputGroup>
              </div>
            </CCol>
            <!-- Station Select -->
            <CCol :xs="12" :sm="6" :md="6" :lg="2.5">
              <div
                v-tooltip="
                  !selectedPlant
                    ? 'Select Plant first!'
                    : !selectedShop
                    ? 'Select Shop first!'
                    : !selectedLine
                    ? 'Select Line first!'
                    : ''
                "
              >
                <CInputGroup required>
                  <CInputGroupText as="label" for="StationSelect"
                    >Station</CInputGroupText
                  >
                  <CFormSelect
                    id="StationSelect"
                    v-model="selectedStation"
                    :options="stations"
                    :disabled="!selectedLine"
                    style="cursor: pointer"
                  >
                  </CFormSelect>
                </CInputGroup>
              </div>
            </CCol>

            <!-- Buttons -->
            <CCol :xs="12" :sm="12" :md="12" :lg="2">
              <div class="d-flex gap-2 justify-content-end">
                <CButton
                  class="white-font"
                  @click="search"
                  :disabled="!isSearchValid || isLoading"
                >
                  <CIcon icon="cil-search" />
                  {{ isLoading ? "Searching..." : "Search" }}</CButton
                >
                <CButton
                  color="primary"
                  class="position-relative"
                  @click="$emit('toggleNotifications')"
                >
                  <CIcon icon="cil-bell" />
                  <CBadge
                    color="secondary"
                    position="top-end"
                    shape="rounded-pill"
                    >{{ unreadCount }}</CBadge
                  ></CButton
                >
              </div>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
  <!-- End:Search -->
</template>

<script>
import api from "../../apis/CommonAPI";

export default {
  name: "SearchFilter",
  props: {
    unreadCount: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      selectedPlant: null,
      selectedShop: null,
      selectedLine: null,
      selectedStation: null,
      searchResults: [],
      isLoading: false,
      plants: [
        {
          label: "Select Plant",
          value: 0,
          disabled: true,
          selected: true,
        },
      ],
      shops: [
        {
          label: "Select Shop",
          value: 0,
          disabled: true,
          selected: true,
        },
      ],
      lines: [
        {
          label: "Select Line",
          value: 0,
          disabled: true,
          selected: true,
        },
      ],
      stations: [
        {
          label: "Select Station",
          value: 0,
          disabled: true,
          selected: true,
        },
      ],
    };
  },
  computed: {
    isSearchValid() {
      return (
        this.selectedPlant &&
        this.selectedShop &&
        this.selectedLine &&
        this.selectedStation
      );
    },
  },
  methods: {
    async fetchOptions(collection, parentId = null) {
      try {
        this.isLoading = true;
        let url = `/asset/list-asset?collection=${collection}`;
        if (parentId) {
          url += `&parent_id=${parentId}`;
        }

        const response = await api.get(url, "?");
        console.log(`Response for ${collection}: `, response);

        if (response?.data?.data) {
          const mappedData = response.data.data.map((item) => ({
            value: item._id,
            // Adjust the name field based on collection type
            label: item[`${collection}_nm`] || item.name,
          }));
          console.log(`Mapped data for ${collection}: `, mappedData);
          return mappedData;
        }
        return [];
      } catch (error) {
        console.error(`Error fetching ${collection}: `, error);
        this.error = error.response?.data?.message || "An error occurred";
        return [];
      } finally {
        this.isLoading = false;
      }
    },

    async getPlantOpts() {
      const plants = await this.fetchOptions("plant");
      console.log("Fetched plants: ", plants);
      this.plants = [
        { value: 0, label: "Select Plant", disabled: true, selected: true },
        ...plants,
      ];
      console.log("Updated Plants Array: ", this.plants);
    },
    async getShopOpts(plantId) {
      this.shops = [
        { value: 0, label: "Select Shop", disabled: true, selected: true },
      ];
      console.log("Current Shops: ", this.shops);
      if (plantId) {
        const shops = await this.fetchOptions("shop", plantId);
        console.log("Fetched shops: ", shops);
        this.shops = [...this.shops, ...shops];
      }
      console.log("Updated Shops Array: ", this.shops);
    },
    async getLineOpts(shopId) {
      this.lines = [
        { value: 0, label: "Select Line", disabled: true, selected: true },
      ];
      console.log("Current Lines: ", this.lines);
      if (shopId) {
        const lines = await this.fetchOptions("line", shopId);
        console.log("Fetched lines: ", this.lines);
        this.lines = [...this.lines, ...lines];
      }
      console.log("Updated Lines Array: ", this.lines);
    },
    async getStationOpts(lineId) {
      this.stations = [
        { value: 0, label: "Select Station", disabled: true, selected: true },
      ];
      console.log("Current Stations: ", this.stations);
      if (lineId) {
        const stations = await this.fetchOptions("station", lineId);
        console.log("Fetched stations: ", stations);
        this.stations = [...this.stations, ...stations];
      }
      console.log("Updated Stations Array: ", this.stations);
    },
    async onPlantChange(e) {
      const value = e.target.value;
      if (value === "0") {
        this.selectedPlant = null;
      } else {
        this.selectedPlant = value;
      }
      this.resetSelections("shop");
      if (this.selectedPlant) {
        await this.getShopOpts(this.selectedPlant);
      }
    },
    async onShopChange(e) {
      const value = e.target.value;
      if (value === "0") {
        this.selectedShop = null;
      } else {
        this.selectedShop = value;
      }
      this.resetSelections("line");
      if (this.selectedShop) {
        await this.getLineOpts(this.selectedShop);
      }
    },
    async onLineChange(e) {
      const value = e.target.value;
      if (value === "0") {
        this.selectedLine = null;
      } else {
        this.selectedLine = value;
      }
      this.resetSelections("station");
      if (this.selectedLine) {
        await this.getStationOpts(this.selectedLine);
      }
    },
    resetSelections(level) {
      switch (level) {
        case "shop":
          this.selectedShop = null;
          this.selectedLine = null;
          this.selectedStation = null;
          this.shops = [
            {
              value: null,
              label: "Select Shop",
              disabled: true,
              selected: true,
            },
          ];
          this.lines = [
            {
              value: null,
              label: "Select Line",
              disabled: true,
              selected: true,
            },
          ];
          this.stations = [
            {
              value: null,
              label: "Select Station",
              disabled: true,
              selected: true,
            },
          ];
          break;
        case "line":
          this.selectedLine = null;
          this.selectedStation = null;
          this.lines = [
            {
              value: null,
              label: "Select Line",
              disabled: true,
              selected: true,
            },
          ];
          this.stations = [
            {
              value: null,
              label: "Select Station",
              disabled: true,
              selected: true,
            },
          ];
          break;
        case "station":
          this.selectedStation = null;
          this.stations = [
            {
              value: null,
              label: "Select Station",
              disabled: true,
              selected: true,
            },
          ];
          break;
      }
    },

    getSelectedItemName(options, value) {
      const item = options.find((opt) => opt.value === value);
      return item ? item.label : "Not selected";
    },

    search() {
      if (!this.isSearchValid) return;

      console.group("Search Parameters");
      console.log(
        "Plant:",
        this.getSelectedItemName(this.plants, this.selectedPlant)
      );
      console.log(
        "Shop:",
        this.getSelectedItemName(this.shops, this.selectedShop)
      );
      console.log(
        "Line:",
        this.getSelectedItemName(this.lines, this.selectedLine)
      );
      console.log(
        "Station:",
        this.getSelectedItemName(this.stations, this.selectedStation)
      );

      const searchParams = {
        plant_id: this.selectedPlant,
        shop_id: this.selectedShop,
        line_id: this.selectedLine,
        station_id: this.selectedStation,
      };
      console.log("Search params: ", searchParams);
      // this.performSearch(searchParams);
      this.$emit("search", searchParams);
    },
  },
  mounted() {
    this.getPlantOpts();
  },
  directives: {
    tooltip: {
      mounted(el, binding) {
        if (binding.value) {
          el.setAttribute("data-tooltip", binding.value);
          el.classList.add("tooltip-trigger");
        } else {
          el.removeAttribute("data-tooltip");
          el.classList.remove("tooltip-trigger");
        }
      },
      updated(el, binding) {
        if (binding.value) {
          el.setAttribute("data-tooltip", binding.value);
          el.classList.add("tooltip-trigger");
        } else {
          el.removeAttribute("data-tooltip");
          el.classList.remove("tooltip-trigger");
        }
      },
    },
  },
};
</script>

<style lang="scss" scoped>
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

// Button styling
.white-font {
  color: white;
  background-color: #1e55e3;
  border-radius: 0.375rem;

  &:hover {
    background-color: darken(#1e55e3, 10%);
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

          .btn:first-child {
            flex: 1;
          }
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

          .btn:first-child {
            flex: 1;
          }
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

          .btn:first-child {
            flex: 1;
          }
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

// Tooltip styles
.tooltip-trigger {
  position: relative;

  &::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding: 5px;
    background-color: #333;
    color: white;
    border-radius: 4px;
    font-size: 14px;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s, visibility 0.3s;
    z-index: 1000;
  }

  &:hover::after {
    opacity: 1;
    visibility: visible;
  }
}
</style>
