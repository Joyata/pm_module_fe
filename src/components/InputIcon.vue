<template>
    <CInputGroup>
        <CFormInput
            readonly
            type="text"
            id="icon"
            placeholder="Select Icon"
            :value="modelValue"
            @click="() => { iconModal = true }"
        />
        <CButton type="button" color="secondary" variant="outline" @click="clear()"><CIcon icon="cilX" /></CButton>
    </CInputGroup>
    <CModal scrollable size="xl" :visible="iconModal" @close="() => { iconModal = false }">
        <CModalHeader>
            <CModalTitle>Select icon</CModalTitle>
            <CNav variant="pills" role="tablist" class="ms-4">
                <CNavItem>
                    <CNavLink
                        href="javascript:void(0);"
                        :active="tabPanePillsActiveKey === 1"
                        @click="() => {tabPanePillsActiveKey = 1}"
                    >
                        Linear
                    </CNavLink>
                </CNavItem>
                <CNavItem>
                    <CNavLink
                        href="javascript:void(0);"
                        :active="tabPanePillsActiveKey === 2"
                        @click="() => {tabPanePillsActiveKey = 2}"
                    >
                        Brand
                    </CNavLink>
                </CNavItem>
                <CNavItem>
                    <CNavLink
                        href="javascript:void(0);"
                        :active="tabPanePillsActiveKey === 3"
                        @click="() => {tabPanePillsActiveKey = 3}"
                    >
                        Flags
                    </CNavLink>
                </CNavItem>
            </CNav>
        </CModalHeader>
        <CModalBody>
        <CTabContent>
            <CTabPane role="tabpanel" aria-labelledby="home-tab" :visible="tabPanePillsActiveKey === 1">
                <CRow class="text-center">
                    <template v-for="(icon, iconName) in iconsLinear" :key="iconName">
                        <CCol class="mb-5" :xs="3" :sm="2">
                        <CButton @click="() => { iconModal = false; $emit('update:modelValue', toKebabCase(iconName))}">
                            <CIcon :content="icon" size="xxl" />
                            <div>{{ toKebabCase(iconName) }}</div>
                        </CButton>
                        </CCol>
                    </template>
                </CRow>
            </CTabPane>
            <CTabPane role="tabpanel" aria-labelledby="profile-tab" :visible="tabPanePillsActiveKey === 2">
                <CRow class="text-center">
                    <template v-for="(icon, iconName) in iconsBrand" :key="iconName">
                        <CCol class="mb-5" :xs="3" :sm="2">
                        <CButton @click="() => { iconModal = false; $emit('update:modelValue', toKebabCase(iconName))}">
                            <CIcon :content="icon" size="xxl" />
                            <div>{{ toKebabCase(iconName) }}</div>
                        </CButton>
                        </CCol>
                    </template>
                </CRow>
            </CTabPane>
            <CTabPane role="tabpanel" aria-labelledby="contact-tab" :visible="tabPanePillsActiveKey === 3">
                <CRow class="text-center">
                    <template v-for="(icon, iconName) in iconsFlags" :key="iconName">
                        <CCol class="mb-5" :xs="3" :sm="2">
                        <CButton @click="() => { iconModal = false; $emit('update:modelValue', toKebabCase(iconName))}">
                            <CIcon :content="icon" size="xxl" />
                            <div>{{ toKebabCase(iconName) }}</div>
                        </CButton>
                        </CCol>
                    </template>
                </CRow>
            </CTabPane>
        </CTabContent>
        </CModalBody>
    </CModal>
</template>

<script>
import { freeSet } from '@coreui/icons'
import { brandSet } from '@coreui/icons'
import { flagSet } from '@coreui/icons'

export default {
    name: 'InputIcon',
    props: ['modelValue'],
    emits: ['update:modelValue'],
    setup() {
        const toKebabCase = (str) =>
        str.replace(/([a-z])([A-Z0-9])/g, '$1-$2').toLowerCase()
        const iconsLinear = freeSet
        const iconsBrand = brandSet
        const iconsFlags = flagSet
        return {
            iconsLinear,
            iconsBrand,
            iconsFlags,
            toKebabCase,
        }
    },
    data () {
        return {
            iconModal: false,
            tabPanePillsActiveKey: 1,
        }
    },
    methods: {
        clear() {
            this.$emit('update:modelValue', '')
        },
    },
}
</script>