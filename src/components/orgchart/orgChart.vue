<template>
  <CRow>
    <CCol>
      <table v-if="orgData.title" class="org-table">
        <tr>
          <td
            :colspan="
              Array.isArray(orgData.children) ? orgData.children.length * 2 : 1
            "
            :class="{
              ['org-parent-level']: isChildren(),
              ['org-extend']: true,
            }"
          >
            <div class="org-node">
              <div class="org-container" @click="$emit('click-node', orgData)">
                <div class="org-title" :class="orgData.titleClass || []">
                  {{ orgData.title }}
                </div>
                <div
                  class="org-content"
                  v-if="isMember()"
                  :class="orgData.contentClass || []"
                >
                  <div
                    class="org-content-item"
                    v-for="(member, index) in orgData.member"
                    @click.stop="$emit('click-node', member)"
                  >
                    <div class="item-box">
                      <p class="item-title">{{ member.name }}</p>
                      <p class="item-add">{{ member.add }}</p>
                    </div>
                    <div class="avat" v-if="member.image_url">
                      <img :src="member.image_url" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="org-extend-arrow"
              v-if="isChildren()"
              @click="setToggleExtend(orgData, !orgData.extend)"
            ></div>
          </td>
        </tr>
        <tr
          v-if="isChildren()"
          :style="{ visibility: orgData.extend ? 'visible' : 'hidden' }"
        >
          <td
            v-for="(children, index) in orgData.children"
            :key="index"
            colspan="2"
            class="org-child-level"
          >
            <OrganizationChart
              :data="children"
              @click-node="$emit('click-node', $event)"
            />
          </td>
        </tr>
      </table>
    </CCol>
  </CRow>
</template>

<script>
export default {
  name: "orgChart",
  props: ["data"],
  data() {
    return {
      orgData: {
        title: "CEO",
        member: [
          {
            name: "Oliver",
            image_url:
              "https://github.com/LeeJams/LeeJams.github.io/blob/master/assets/img/user.jpg?raw=true",
          },
        ],
        extend: false,
        children: [
          {
            title: "MANAGEMENT",
            extend: true,
            member: [
              {
                name: "Jake",
                add: "Junior Staff",
                extend: false,
                image_url:
                  "https://github.com/LeeJams/LeeJams.github.io/blob/master/assets/img/user.jpg?raw=true",
              },
              {
                name: "Noah",
                add: "Senior Staff",
                extend: false,
                image_url:
                  "https://github.com/LeeJams/LeeJams.github.io/blob/master/assets/img/user.jpg?raw=true",
              },
              {
                name: "James",
                add: "Senior Manager",
                extend: false,
                image_url:
                  "https://github.com/LeeJams/LeeJams.github.io/blob/master/assets/img/user.jpg?raw=true",
              },
            ],
          },
          {
            title: "DEVELOPMENT",
            extend: false,
            member: [
              {
                name: "Emma",
                add: "CTO",
                extend: false,
                image_url:
                  "https://github.com/LeeJams/LeeJams.github.io/blob/master/assets/img/user.jpg?raw=true",
              },
            ],

            children: [
              {
                title: "FRONTEND",
                titleClass: "frontend-title",
                extend: false,
                contentClass: "frontend-content",
                member: [
                  {
                    name: "David",
                    add: "Senior Staff",
                  },
                  {
                    name: "Ava",
                    add: "Senior Staff",
                  },
                  {
                    name: "Sophia",
                    add: "Senior Staff",
                  },
                ],
              },
              {
                title: "BACKEND",
                titleClass: "backend-title",
                extend: false,
                contentClass: "backend-content",
                member: [
                  {
                    name: "Kyle",
                    add: "Senior Staff",
                  },
                  {
                    name: "Richard",
                    add: "Senior Staff",
                  },
                  {
                    name: "Daniel",
                    add: "Senior Staff",
                  },
                ],
              },
            ],
          },
          {
            title: "DESIGN",
            extend: false,
            member: [
              {
                name: "Jacob",
                add: "Senior Staff",
              },
            ],
          },
          {
            title: "MARKETING",
            extend: false,
          },
          {
            title: "SALES",
            extend: false,
            children: [
              {
                title: "SALES A TEAM",
              },
              {
                title: "SALES B TEAM",
              },
            ],
          },
        ],
      },
    };
  },
  watch: {
    data: {
      handler: function (Props) {
        const extendKey = function (orgData) {
          if (Array.isArray(orgData.children)) {
            orgData.children.forEach((c) => {
              extendKey(c);
            });
          }
          return orgData;
        };
        if (Props) {
          this.orgData = extendKey(Props);
        }
      },
      immediate: true,
    },
  },
  methods: {
    setToggleExtend: function (orgData, extend) {
      orgData.extend = extend;
      Array.isArray(orgData.children) &&
        orgData.children.forEach((c) => {
          this.setToggleExtend(c, extend);
        });
      this.$forceUpdate();
    },
    isChildren: function () {
      return (
        Array.isArray(this.orgData.children) && this.orgData.children.length
      );
    },
    isMember: function () {
      return Array.isArray(this.orgData.member) && this.orgData.member.length;
    },
  },
};
</script>

<style scoped>
.org-table {
  border-collapse: separate !important;
  border-spacing: 0 !important;
}

.org-table td {
  position: relative;
  vertical-align: top;
  padding: 0 0 50px 0;
  text-align: center;
}

.org-node {
  position: relative;
  display: inline-block;
  margin: 0 1em;
  box-sizing: border-box;
}

.org-node .org-container {
  position: relative;
  display: inline-block;
  z-index: 2;
  width: 100%;
  min-width: 150px;
}

.org-title {
  font-weight: 700;
  width: 100%;
  border: 1px solid #00000000;
  background-color: #e3e3e3;
  border-radius: 4px;
  padding: 15px 5px;
  white-space: pre;
}

.org-content {
  margin-top: 3px;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 5px;
  white-space: pre;
  text-align: left;
}

.org-content .org-content-item {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 5px;
  border-bottom: 1px solid #e7e7e7;
}

.org-content .org-content-item:last-child {
  border-bottom: none;
}

.org-content-item .item-box {
  flex: 1;
}

.org-content-item .item-box .item-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.org-content-item .item-box .item-add {
  margin: 0;
  font-size: 0.8rem;
}

.org-content-item .avat {
  display: block;
  width: 3em;
  height: 3em;
  overflow: hidden;
  background: #fff;
  border: 1px solid #ccc;
  box-sizing: border-box;
  border-radius: 2em;
  margin-left: 5px;
}

.org-content-item .avat img {
  width: 100%;
  height: 100%;
}

.org-child-level::before {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 100%;
  height: 15px;
  border-left: 2px solid #ccc;
  transform: translate3d(-1px, 0, 0);
}

.org-child-level::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: -15px;
  border-top: 2px solid #ccc;
}

.org-child-level:first-child:before,
.org-child-level:last-child:before {
  display: none;
}

.org-child-level:first-child:after {
  left: 50%;
  height: 13px;
  border: 2px solid;
  border-color: #ccc transparent transparent #ccc;
  transform: translate3d(1px, 0, 0);
}

.org-child-level:last-child:after {
  right: 50%;
  height: 13px;
  border: 2px solid;
  border-color: #ccc #ccc transparent transparent;
  transform: translate3d(-1px, 0, 0);
}

.org-child-level:first-child.org-child-level:last-child::after {
  left: auto;
  border-radius: 0;
  border-color: transparent #ccc transparent transparent;
  transform: translate3d(1px, 0, 0);
}

.org-extend .org-extend-arrow:before {
  transform: rotateZ(-45deg);
}

.org-extend::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 13px;
  height: 17px;
  border-left: 2px solid #ccc;
  transform: translate3d(-1px, 0, 0);
}

.org-extend-arrow {
  position: absolute;
  left: 50%;
  bottom: 22px;
  width: 10px;
  height: 10px;
  padding: 10px;
  transform: translate3d(-15px, 0, 0);
  cursor: pointer;
}

.org-extend-arrow:before {
  content: "";
  display: block;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: 2px solid;
  border-color: #ccc #ccc transparent transparent;
  transform: rotateZ(135deg);
  transform-origin: 50% 50% 0;
  transition: transform ease 300ms;
}

.org-extend-arrow:hover:before {
  border-color: #333 #333 transparent transparent;
}
</style>
