import ACCESS_ENUM from "@/access/accessEnum";
import { UserControllerService } from "../../generated";
import { Module } from "vuex"; // 使用正确的 Module 类型
import { RootState } from "./index";
export interface UserState {
  loginUser: {
    userName: string;
    userRole: string;
  };
}
const userModule: Module<UserState, RootState> = {
  // 使用正确的 Module 类型
  namespaced: true,
  state: (): UserState => ({
    loginUser: {
      userName: "未登录",
      userRole: ACCESS_ENUM.NOT_LOGIN,
    },
  }),
  mutations: {
    // 更新用户信息
    updateUser(state, payload) {
      state.loginUser = {
        ...state.loginUser,
        ...payload,
      };
    },
    // 设置完整的用户对象
    setUser(state: UserState, payload: any) {
      if (payload) {
        state.loginUser = {
          userName: payload.userName || payload.userAccount || "未登录", // 增强用户名处理
          userRole: payload.userRole || ACCESS_ENUM.USER,
        };
      } else {
        // 重置为未登录状态
        state.loginUser = {
          userName: "未登录",
          userRole: ACCESS_ENUM.NOT_LOGIN,
        };
      }
    },
  },
  actions: {
    async getLoginUser({ commit }) {
      try {
        const res = await UserControllerService.getLoginUserUsingGet();
        if (res.code === 0 && res.data) {
          commit("setUser", res.data);
          return res.data;
        } else {
          commit("setUser", null);
          return null;
        }
      } catch (error) {
        console.error("获取登录用户失败:", error);
        commit("setUser", null);
        return null;
      }
    },

    // 退出登录
    async logout({ commit }) {
      try {
        // 调用后端退出登录API
        await UserControllerService.userLogoutUsingPost();

        // 清除本地用户状态
        commit("setUser", null);

        // 清除本地存储的token等凭证
        localStorage.removeItem("userToken");
        sessionStorage.removeItem("userSession");

        return true;
      } catch (error) {
        console.error("退出登录失败:", error);
        return false;
      }
    },
  },
};

export default userModule;
