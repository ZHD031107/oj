/* eslint-disable */
declare module "*.vue" {
  import type { DefineComponent } from "vue";
    import { Store } from 'vuex';
    import { UserState } from '@/store/modules/user';
  const component: DefineComponent<{}, {}, any>;
  export default component;


    declare module '@vue/runtime-core' {
        // 声明自己的 store state
        interface State {
            user: UserState;
        }

        // 为 `this.$store` 提供类型声明
        interface ComponentCustomProperties {
            $store: Store<State>;
        }
    }
}
