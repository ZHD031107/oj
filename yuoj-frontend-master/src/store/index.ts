import { createStore } from "vuex";
import user from "./user";

export interface RootState {
  user: {
    loginUser: {
      userName: string;
      userRole: string;
    };
  };
}

const store = createStore<RootState>({
  modules: {
    user,
  },
  mutations: {},
  actions: {},
});

export default store;
