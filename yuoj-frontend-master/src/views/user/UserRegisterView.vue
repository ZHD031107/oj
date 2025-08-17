<template>
  <div id="userRegisterView">
    <h2 style="margin-bottom: 16px">用户注册</h2>
    <a-form
      style="max-width: 480px; margin: 0 auto"
      label-align="left"
      auto-label-width
      :model="form"
      :rules="formRules"
      @submit="handleSubmit"
    >
      <a-form-item field="userAccount" label="账号">
        <a-input
          v-model="form.userAccount"
          placeholder="请输入账号（4-16位字符）"
          allow-clear
        />
      </a-form-item>

      <a-form-item field="userPassword" label="密码">
        <a-input-password
          v-model="form.userPassword"
          placeholder="请输入密码（不少于8位）"
          allow-clear
        />
      </a-form-item>

      <a-form-item field="checkPassword" label="确认密码">
        <a-input-password
          v-model="form.checkPassword"
          placeholder="请再次输入密码"
          allow-clear
        />
      </a-form-item>

      <a-form-item>
        <a-button
          type="primary"
          html-type="submit"
          style="width: 120px"
          :loading="loading"
        >
          注册
        </a-button>
        <a-button type="outline" style="margin-left: 16px" @click="goToLogin">
          返回登录
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import {
  UserControllerService,
  type UserRegisterRequest,
} from "../../../generated";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
import type { FieldRule } from "@arco-design/web-vue/es/form/interface";

const router = useRouter();
const loading = ref(false);

// 注册表单数据
const form = reactive<UserRegisterRequest>({
  userAccount: "",
  userPassword: "",
  checkPassword: "", // 前端校验字段，不发送给后端
});

// 表单验证规则
const formRules = reactive<Record<string, FieldRule[]>>({
  userAccount: [
    { required: true, message: "账号不能为空" },
    { minLength: 4, message: "账号长度不能少于4位" },
    { maxLength: 16, message: "账号长度不能超过16位" },
    {
      match: /^[a-zA-Z0-9_]+$/,
      message: "账号只能包含字母、数字和下划线",
    },
  ],
  userPassword: [
    { required: true, message: "密码不能为空" },
    { minLength: 8, message: "密码长度不能少于8位" },
    {
      match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      message: "密码需包含大小写字母和数字",
    },
  ],
  checkPassword: [
    { required: true, message: "请再次输入密码" },
    {
      validator: (value, callback) => {
        if (value !== form.userPassword) {
          callback("两次输入的密码不一致");
        } else {
          callback();
        }
      },
    },
  ],
});

/**
 * 提交注册表单
 */
const handleSubmit = async (data: {
  values: Record<string, any>;
  errors: Record<string, any> | undefined;
}) => {
  // 验证失败
  if (data.errors) return;

  try {
    loading.value = true;

    // 调用注册接口（仅发送接口需要的字段）
    const res = await UserControllerService.userRegisterUsingPost({
      userAccount: form.userAccount,
      userPassword: form.userPassword,
      checkPassword: form.checkPassword,
    });

    // 打印完整响应以便调试
    console.log("注册接口响应:", res);

    // 处理注册结果
    if (res.code === 0) {
      message.success("注册成功");
      // 跳转到登录页
      router.push({
        path: "/user/login",
        replace: true,
      });
    } else {
      // 增强错误处理
      const errorMsg = res.message || "未知错误，请检查控制台";
      message.error(`注册失败: ${errorMsg}`);

      // 常见错误提示
      if (res.message?.includes("已存在")) {
        message.warning("该账号已被注册，请使用其他账号");
      } else if (res.message?.includes("密码")) {
        message.warning("密码不符合要求");
      }
    }
  } catch (error: any) {
    console.error("注册请求异常:", error);

    // 更详细的网络错误处理
    if (error?.response) {
      // HTTP 错误状态码处理
      const status = error.response.status;
      if (status === 400) {
        message.error("请求参数错误");
      } else if (status === 401) {
        message.error("未授权访问");
      } else if (status === 500) {
        message.error("服务器内部错误");
      } else {
        message.error(`请求失败: ${status}`);
      }

      // 尝试解析后端返回的错误信息
      const errorData = error.response.data;
      if (errorData?.message) {
        message.error(`后端错误: ${errorData.message}`);
      }
    } else if (error?.request) {
      // 请求已发出但没有响应
      message.error("网络错误，请检查连接");
    } else {
      // 其他错误
      message.error("请求失败，请重试");
    }
  } finally {
    loading.value = false;
  }
};

/**
 * 跳转到登录页
 */
const goToLogin = () => {
  router.push({
    path: "/user/login",
    replace: true,
  });
};
</script>

<style scoped>
#userRegisterView {
  padding: 40px 20px;
  max-width: 600px;
  margin: 0 auto;
  background-color: var(--color-bg-2);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

h2 {
  text-align: center;
  color: rgb(var(--arcoblue-6));
  margin-bottom: 24px;
}

@media (max-width: 480px) {
  #userRegisterView {
    padding: 20px 16px;
  }
}
</style>
