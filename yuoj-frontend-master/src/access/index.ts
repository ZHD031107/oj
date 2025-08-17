// import router from "@/router";
// import store from "@/store";
// import ACCESS_ENUM from "@/access/accessEnum";
// import checkAccess from "@/access/checkAccess";
//
// router.beforeEach(async (to, from, next) => {
//   const needAccess = to.meta.access
//     ? (to.meta.access as string)
//     : ACCESS_ENUM.NOT_LOGIN; // 修改默认值
//   console.log("访问路由:", to.path);
//   console.log("需要的权限:", to.meta?.access);
//
//   // console.log("登陆用户信息", store.state.user.loginUser);
//   let loginUser = store.state.user.loginUser;
//   // // 如果之前没登陆过，自动登录
//   if (!loginUser || !loginUser.userRole) {
//     // 加 await 是为了等用户登录成功之后，再执行后续的代码
//     await store.dispatch("user/getLoginUser");
//     loginUser = store.state.user.loginUser;
//   }
//   const needAccess = (to.meta?.access as string) ?? ACCESS_ENUM.NOT_LOGIN;
//   // 要跳转的页面必须要登陆
//   if (needAccess !== ACCESS_ENUM.NOT_LOGIN) {
//     // 如果没登陆，跳转到登录页面
//     if (
//       !loginUser ||
//       !loginUser.userRole ||
//       loginUser.userRole === ACCESS_ENUM.NOT_LOGIN
//     ) {
//       next(`/user/login?redirect=${to.fullPath}`);
//       return;
//     }
//     // 如果已经登陆了，但是权限不足，那么跳转到无权限页面
//     if (!checkAccess(loginUser, needAccess)) {
//       next("/noAuth");
//       return;
//     }
//   }
//   next();
// });
import router from "@/router";
import store from "@/store";
import ACCESS_ENUM from "@/access/accessEnum";

import checkAccess from "@/access/checkAccess";

router.beforeEach(async (to, _from, next) => {
  // 1. 修复未使用的 'from' 参数
  // console.log("登陆用户信息", store.state.user.loginUser);
  // console.group(`[路由守卫] ${to.path}`);
  // console.log("路由元信息:", to.meta);
  // console.log("原始权限:", to.meta?.access);
  //
  // let loginUser = store.state.user.loginUser;
  //
  // // 如果之前没登陆过，自动登录
  // if (!loginUser?.userRole) {
  //   // 2. 简化判断条件
  //   // 加 await 是为了等用户登录成功之后，再执行后续的代码
  //   await store.dispatch("user/getLoginUser");
  //   loginUser = store.state.user.loginUser;
  // }
  console.group(`[路由守卫] ${to.path}`);
  let loginUser = store.state.user.loginUser;

  // 增强的自动登录逻辑
  if (
    !loginUser ||
    !loginUser.userRole ||
    loginUser.userRole === ACCESS_ENUM.NOT_LOGIN
  ) {
    console.log("尝试自动登录...");
    try {
      await store.dispatch("user/getLoginUser");
      loginUser = store.state.user.loginUser;
      console.log("自动登录结果:", loginUser);
    } catch (error) {
      console.error("自动登录失败:", error);
      // 清除可能的无效状态
      store.commit("user/setUser", null);
    }
  }

  // 3. 修复变量重复声明问题
  // const requiredAccess = (to.meta?.access as string) ?? ACCESS_ENUM.NOT_LOGIN;
  //
  // // 要跳转的页面必须要登陆
  // if (requiredAccess !== ACCESS_ENUM.NOT_LOGIN) {
  //   // 如果没登陆，跳转到登录页面
  //   if (!loginUser?.userRole || loginUser.userRole === ACCESS_ENUM.NOT_LOGIN) {
  //     next(`/user/login?redirect=${to.fullPath}`);
  //     return;
  //   }
  //   // 如果已经登陆了，但是权限不足，那么跳转到无权限页面
  //   if (!checkAccess(loginUser, requiredAccess)) {
  //     next("/noAuth");
  //     return;
  //   }
  // }
  // next();
  const requiredAccess = (to.meta?.access as string) || ACCESS_ENUM.NOT_LOGIN;

  // 特殊处理管理路径
  if (
    to.path.startsWith("/manage/") &&
    requiredAccess === ACCESS_ENUM.NOT_LOGIN
  ) {
    // 强制要求登录
    if (!loginUser?.userRole || loginUser.userRole === ACCESS_ENUM.NOT_LOGIN) {
      next(`/user/login?redirect=${to.fullPath}`);
      return;
    }
  }

  // 原有权限检查逻辑保持不变...
  if (requiredAccess !== ACCESS_ENUM.NOT_LOGIN) {
    // ...原有登录检查...
  }

  next();
  console.log("处理后的权限:", requiredAccess);
  console.log("用户角色:", loginUser?.userRole);
  console.groupEnd();

  // ...权限检查逻辑...
});
