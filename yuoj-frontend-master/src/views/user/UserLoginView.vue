<template>
  <div id="userLoginView">
    <h2 style="margin-bottom: 16px">用户登录</h2>
    <a-form
      style="max-width: 480px; margin: 0 auto"
      label-align="left"
      auto-label-width
      :model="form"
      @submit="handleSubmit"
    >
      <a-form-item field="userAccount" label="账号">
        <a-input v-model="form.userAccount" placeholder="请输入账号" />
      </a-form-item>
      <a-form-item field="userPassword" tooltip="密码不少于 8 位" label="密码">
        <a-input-password
          v-model="form.userPassword"
          placeholder="请输入密码"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 120px">
          登录
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { UserControllerService, UserLoginRequest } from "../../../generated";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import ACCESS_ENUM from "@/access/accessEnum";

/**
 * 表单信息
 */
const form = reactive({
  userAccount: "",
  userPassword: "",
} as UserLoginRequest);

const router = useRouter();
const store = useStore();

const handleSubmit = async () => {
  try {
    const res = await UserControllerService.userLoginUsingPost(form);
    if (res.code === 0 && res.data) {
      // 直接使用登录接口返回的用户信息
      const loginUser = {
        ...res.data,
        userRole: res.data.userRole || ACCESS_ENUM.USER,
      };

      // 提交 mutation 更新用户状态
      store.commit("user/setLoginUser", loginUser);

      // 可选：如果需要持久化，可以存储到 localStorage
      localStorage.setItem("loginUser", JSON.stringify(loginUser));

      // 跳转到首页
      router.push({ path: "/", replace: true });

      message.success("登录成功！");
    } else {
      message.error(`登录失败: ${res.message || "未知错误"}`);
    }
  } catch (error) {
    console.error("登录请求异常:", error);
    message.error("登录失败，请检查网络");
  }
};
</script>
