<template>
    <li class="list-unstyled">
        <CBadge
          color="danger"
          class="mb-2"
          @click="toggle"
          @dblclick="changeType"
        >
            {{model.id}} - {{ model.displayText }}&nbsp;
            <span v-if="isFolder">
            <CIcon v-if="isOpen" icon="cilCaretBottom" size="sm"/>
            <CIcon v-else icon="cilCaretRight" size="sm"/>
            </span>
        </CBadge >
        <ul v-show="isOpen" v-if="isFolder">
          <TreeItem
              class="item"
              v-for="model in model.children"
              :model="model"
              v-model="modelValue"
            >
          </TreeItem>
          <CButton color="primary" variant="outline" class="mb-2" @click="addChild" size="sm">
            <CIcon icon="cilPlus" size="sm"/>
          </CButton>
        </ul>
    </li>
</template>

<script>
    export default {
      name: 'TreeItem', // necessary for self-reference
      props: {
        model: Object,
        modelValue: String,
      },
      emits: ['update:modelValue'],
      data() {
        return {
          isOpen: false
        }
      },
      computed: {
        isFolder() {
          return this.model.children && this.model.children.length
        }
      },
      watch: {
        // whenever question changes, this function will run
        modelValue(newModelValue, oldModelValue) {
          this.$emit('update:modelValue', newModelValue)
        }
      },
      methods: {
        toggle() {
          if (this.isFolder) {
            this.isOpen = !this.isOpen
          }
        },
        changeType() {
          if (!this.isFolder) {
            this.model.children = []
            this.addChild()
            this.isOpen = true
          }
        },
        addChild() {
          this.$emit('update:modelValue', this.model.id)
          // console.log('passing val',this.model.id)
          // console.log('in model',this.modelValue)
        }
      }
    }
</script>