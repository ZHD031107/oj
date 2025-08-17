<template>
  <a-row id="globalHeader" align="center" :wrap="false">
    <a-col flex="auto">
      <a-menu
        mode="horizontal"
        :selected-keys="selectedKeys"
        @menu-item-click="doMenuClick"
      >
        <a-menu-item
          key="0"
          :style="{ padding: 0, marginRight: '38px' }"
          disabled
        >
          <div class="title-bar">
            <img class="logo" src="../assets/zhd.svg" />
            <div class="title">周 OJ</div>
          </div>
        </a-menu-item>
        <a-menu-item v-for="item in orderedVisibleRoutes" :key="item.path">
          {{ item.name }}
        </a-menu-item>
      </a-menu>
    </a-col>
    <a-col flex="100px">
      <div class="user-area">
        <a-dropdown v-if="isLoggedIn" position="br" trigger="click">
          <div class="user-info">
            <div class="user-display">
              <span class="user-name">{{ displayUserName }}</span>
              <span v-if="isAdmin" class="admin-tag">管理员</span>
              <icon-down class="dropdown-icon" />
            </div>
          </div>
          <template #content>
            <a-doption @click="handleLogout">
              <template #icon>
                <icon-export />
              </template>
              <span>退出登录</span>
            </a-doption>
            <a-doption @click="handleSwitchUser">
              <template #icon>
                <icon-user />
              </template>
              <span>切换账户</span>
            </a-doption>
          </template>
        </a-dropdown>
        <div v-else class="auth-buttons">
          <a-button type="outline" size="small" @click="handleLogin">
            <icon-user style="margin-right: 4px" />你好，请登录
          </a-button>
          <a-button type="primary" size="small" @click="handleRegister">
            <icon-edit style="margin-right: 4px" />注册账号
          </a-button>
        </div>
      </div>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { routes } from "../router/routes";
import { useRoute, useRouter } from "vue-router";
import { computed, ref } from "vue";
import { useStore } from "vuex";
import checkAccess from "@/access/checkAccess";
import ACCESS_ENUM from "@/access/accessEnum";
import { IconDown, IconExport, IconUser } from "@arco-design/web-vue/es/icon";
import { Modal, Message } from "@arco-design/web-vue";
import { onMounted } from "vue";

const router = useRouter();
const route = useRoute();
const store = useStore();
onMounted(async () => {
  await store.dispatch("user/getLoginUser");
});
const displayUserName = computed(() => {
  const user = store.state.user?.loginUser;

  // 优先级：userAccount > userName > 默认值
  return user?.userAccount || user?.userName || "用户";
});

// 获取登录用户信息
//const loginUser = computed(() => store.state.user.loginUser);
const loginUser = computed(() => {
  // 添加：如果 Vuex 中没有用户信息，尝试从本地存储获取
  if (!store.state.user?.loginUser) {
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      store.commit("user/setUser", JSON.parse(storedUser));
    }
  }
  return store.state.user?.loginUser;
});

// 检查是否已登录
const isLoggedIn = computed(() => {
  return (
    loginUser.value?.userRole &&
    loginUser.value.userRole !== ACCESS_ENUM.NOT_LOGIN
  );
});

// 检查是否是管理员
const isAdmin = computed(() => {
  return loginUser.value?.userRole === ACCESS_ENUM.ADMIN;
});

// 展示在菜单的有序路由数组
const orderedVisibleRoutes = computed(() => {
  // 1. 首先过滤出可见路由
  const filteredRoutes = routes.filter((item) => {
    // 隐藏指定菜单项
    if (item.meta?.hideInMenu) {
      return false;
    }

    // 检查权限
    const hasAccess = checkAccess(
      loginUser.value,
      item?.meta?.access as string
    );

    // 管理员可以看到所有非隐藏菜单
    return isAdmin.value ? true : hasAccess;
  });

  // 2. 定义菜单项的顺序优先级
  const menuPriority = [
    "/", // 主页 - 最高优先级
    "/questions", // 浏览题目
    "/question_submit", // 题目提交
    "/add/question", // 创建题目
    "/manage/question", // 管理题目
  ];

  // 3. 按自定义顺序排序
  return filteredRoutes.sort((a, b) => {
    const aIndex = menuPriority.indexOf(a.path);
    const bIndex = menuPriority.indexOf(b.path);

    // 如果都在优先级列表中，按列表顺序排序
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }

    // 如果只有一个在列表中，优先显示在列表中的项
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;

    // 都不在列表中，按原始顺序（或按名称字母顺序）
    const aName = a.name ? String(a.name) : "";
    const bName = b.name ? String(b.name) : "";
    return aName.localeCompare(bName);
  });
});

// 设置当前选中的菜单项
const selectedKeys = ref([route.path]);

// 路由跳转后，更新选中的菜单项
router.afterEach((to) => {
  selectedKeys.value = [to.path];
});

const doMenuClick = (key: string) => {
  router.push({
    path: key,
  });
};

// 处理登录操作
const handleLogin = () => {
  router.push({
    path: "/user/login",
    query: {
      redirect: route.fullPath,
    },
  });
};
const handleRegister = () => {
  router.push({
    path: "/user/register",
    query: {
      redirect: route.fullPath,
    },
  });
};

// 处理退出登录
const handleLogout = () => {
  Modal.confirm({
    title: "确认退出登录",
    content: "您确定要退出当前账号吗？",
    okText: "确定退出",
    cancelText: "取消",
    onOk: async () => {
      try {
        localStorage.removeItem("userInfo");
        localStorage.removeItem("accessToken");
        // 调用退出登录API
        await store.dispatch("user/logout");

        // 重置用户状态
        store.commit("user/setUser", null);

        // 跳转到首页
        router.push("/");

        // 提示退出成功
        Message.success("已成功退出登录");
      } catch (error) {
        Message.error("退出登录失败，请重试");
      }
    },
  });
};
const handleAuthSuccess = async (userData: any) => {
  // 保存到 Vuex
  store.commit("user/setUser", userData);

  // 保存到本地存储
  localStorage.setItem("userInfo", JSON.stringify(userData));

  // 重新获取用户信息（确保获取最新数据）
  await store.dispatch("user/getLoginUser");

  // 跳转到目标页面或首页
  const redirect = route.query.redirect || "/";
  router.push(redirect as string);
};
// 处理切换用户
const handleSwitchUser = () => {
  // 先退出当前账号
  store.dispatch("user/logout").finally(() => {
    store.commit("user/setUser", null);

    // 跳转到登录页
    router.push({
      path: "/user/login",
      query: {
        redirect: route.fullPath,
        switchUser: "true", // 添加标识表示是切换用户
      },
    });
  });
};
</script>

<style scoped>
.title-bar {
  display: flex;
  align-items: center;
}

.title {
  color: #444;
  margin-left: 16px;
}

.logo {
  height: 48px;
}

.user-area {
  display: flex;
  justify-content: flex-end;
  padding-right: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.user-info:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.user-name {
  margin-right: 6px;
  font-weight: 500;
}

.admin-tag {
  background-color: #ffd04b;
  color: #8a691a;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  margin-left: 4px;
}
/* 其他样式保持不变... */

.user-area {
  display: flex;
  justify-content: flex-end;
  padding-right: 16px;
  min-width: 150px; /* 确保有足够空间 */
}

.user-info {
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
}

.user-display {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  background-color: rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
  white-space: nowrap; /* 防止换行 */
}

.user-info:hover .user-display {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-name {
  font-weight: 500;
  font-size: 20px;
  color: rgb(68, 68, 68);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.2; /* 确保行高一致 */
}

.admin-tag {
  background-color: #ffd04b;
  color: #8a691a;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block; /* 确保在同一行 */
  line-height: 1.4; /* 垂直居中 */
}

.dropdown-icon {
  font-size: 12px;
  color: white;
  margin-left: 2px;
  flex-shrink: 0; /* 防止被压缩 */
}

.user-info:hover .dropdown-icon {
  color: rgb(68, 68, 68);
  transform: translateY(1px);
}

/* 小屏幕适配 */
@media (max-width: 768px) {
  .user-display {
    padding: 4px 8px;
  }

  .user-name {
    max-width: 60px;
    font-size: 13px;
  }

  .admin-tag {
    padding: 1px 6px;
    font-size: 11px;
  }
}
.auth-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-right: 16px;
}

.auth-buttons-container {
  display: flex;
  justify-content: flex-end;
}

.auth-buttons .arco-btn-outline {
  border-color: #1e88e5;
  color: #1e88e5;
}

.auth-buttons .arco-btn-outline:hover {
  background-color: #1e88e5;
  color: white;
}

.auth-buttons .arco-btn-primary {
  background-color: #1e88e5;
  border-color: #1e88e5;
}

.auth-buttons .arco-btn-primary:hover {
  background-color: #1565c0;
  border-color: #1565c0;
}

/* 修复 ArcoDesign 图标对齐问题 */
.arco-icon {
  vertical-align: -0.15em; /* 精确对齐文本 */
}
</style>
