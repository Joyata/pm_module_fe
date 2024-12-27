<template>
    <CInputGroup>
        <CFormInput type="text" :id="this.props.id" :placeholder="this.props.placeholder" 
            v-model="modelLabel" @keyup="searchLabelHandler($event)" 
            v-on:focus="selectActif"   
            v-on:blur="selectBlur"/>
        <input type="hidden" v-model="modelValue" />
        <CButton type="button" color="secondary" variant="outline" @click="clear()">
            <CIcon icon="cilArrowBottom" />
        </CButton>
    </CInputGroup>
    <ul class="list-group" v-if="this.isSelectActif">
        <template v-for="item in this.props.options">
            <li class="list-group-item list-group-item-action"   
                @click="() => {                      
                        this.selectValue= item.value;
                        this.modelLabel= item.label; 
                        modelValue = item.value;  
                        selectInactif();
                        $emit('update:modelValue', modelValue)
                        }"        
                v-if="this.modelLabel=='' || item.label.toUpperCase().includes(this.searchLabel.toUpperCase())">
                {{item.label}}</li>
        </template>
    </ul>
</template>
<script>
export default {
    name: 'SelectWSearch',
    props: ['id', 'model', 'disabled', 'options', 'placeholder', 'modelValue', 'selectDS'],
    emits: ['update:modelValue','update:options'],
    watch: {
        'id'() {
            this.$emit('update:id', this.props.id);
            //...
        },
        // 'model'() {
        //     this.$emit('update:model', this.props.model);
        //     //...
        // },
        'disabled'() {
            this.$emit('update:disabled', this.props.disabled);
            //...
        },
        // 'options'() {
        //     this.$emit('update:options', this.props.options);
        //     //...
        // },
        'placeholder'() {
            this.$emit('update:placeholder', this.props.placeholder);
            //...
        },
    },
    data(props) {
        return {
            props: props,
            form: {
                id: '',
                parentId: '',
                displayText: '',
                applicationId: '',
                functionId: '',
                icon: '',
            },
            isSelectActif: false,
            selectValue: '',
            searchLabel: '',
            modelLabel: ''
        }
    },
    // components: {
    // },
    // created: function () {
    // },
    methods: {
        selectBlur(){
            setTimeout(()=>{ this.selectInactif(); },100);
        },
        async searchLabelHandler(event){
            this.searchLabel  =  event.target.value;
        },
        selectActif() {
            this.isSelectActif = true;
        },
        selectInactif() {
            this.isSelectActif = false;
        }
    },
    async created() {
        // let selectData = await this.props.selectDS(this.modelValue,1);
        // this.$emit('update:options', selectData);
    },
    setup() {
        return {
        }
    },
}
</script>