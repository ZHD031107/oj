<template>
  <div id="addQuestionView">
    <h2>创建题目</h2>
    <a-form :model="form" label-align="left">
      <a-form-item field="title" label="标题">
        <a-input v-model="form.title" placeholder="请输入标题" />
      </a-form-item>

      <!--      <a-form-item field="tags" label="标签">-->
      <!--        <a-select-->
      <!--          v-model="form.tags"-->
      <!--          :options="tagOptions"-->
      <!--          placeholder="请选择标签"-->
      <!--          multiple-->
      <!--          allow-clear-->
      <!--          allow-create-->
      <!--          :style="{ width: '100%' }"-->
      <!--          :max-tag-count="3"-->
      <!--          @change="handleTagChange"-->
      <!--        >-->
      <!--          <template #tag="{ data }">-->
      <!--            <a-tag-->
      <!--              :status="getTagStatus(data.label)"-->
      <!--              :bordered="true"-->
      <!--              size="medium"-->
      <!--            >-->
      <!--              {{ data.label }}-->
      <!--            </a-tag>-->
      <!--          </template>-->
      <!--        </a-select>-->
      <!--      </a-form-item>-->
      <a-form-item field="tags" label="标签">
        <a-select
          v-model="form.tags"
          :options="tagOptions"
          placeholder="请选择标签"
          multiple
          allow-clear
          allow-create
          :style="{ width: '100%' }"
          :max-tag-count="3"
          @change="handleTagChange"
        >
          <template #tag="{ data }">
            <a-tag
              :class="getTagClass(data.label)"
              :bordered="true"
              size="medium"
            >
              {{ data.label }}
            </a-tag>
          </template>
        </a-select>
      </a-form-item>

      <a-form-item field="content" label="题目内容">
        <MdEditor :value="form.content" :handle-change="onContentChange" />
      </a-form-item>
      <a-form-item field="answer" label="答案">
        <MdEditor :value="form.answer" :handle-change="onAnswerChange" />
      </a-form-item>
      <a-form-item label="判题配置" :content-flex="false" :merge-props="false">
        <a-space direction="vertical" style="min-width: 480px">
          <a-form-item field="judgeConfig.timeLimit" label="时间限制">
            <a-input-number
              v-model="form.judgeConfig.timeLimit"
              placeholder="请输入时间限制"
              mode="button"
              min="0"
              size="large"
            />
          </a-form-item>
          <a-form-item field="judgeConfig.memoryLimit" label="内存限制">
            <a-input-number
              v-model="form.judgeConfig.memoryLimit"
              placeholder="请输入内存限制"
              mode="button"
              min="0"
              size="large"
            />
          </a-form-item>
          <a-form-item field="judgeConfig.stackLimit" label="堆栈限制">
            <a-input-number
              v-model="form.judgeConfig.stackLimit"
              placeholder="请输入堆栈限制"
              mode="button"
              min="0"
              size="large"
            />
          </a-form-item>
        </a-space>
      </a-form-item>
      <a-form-item
        label="测试用例配置"
        :content-flex="false"
        :merge-props="false"
      >
        <a-form-item
          v-for="(judgeCaseItem, index) of form.judgeCase"
          :key="index"
          no-style
        >
          <a-space direction="vertical" style="min-width: 640px">
            <a-form-item
              :field="`form.judgeCase[${index}].input`"
              :label="`输入用例-${index}`"
              :key="index"
            >
              <a-input
                v-model="judgeCaseItem.input"
                placeholder="请输入测试输入用例"
              />
            </a-form-item>
            <a-form-item
              :field="`form.judgeCase[${index}].output`"
              :label="`输出用例-${index}`"
              :key="index"
            >
              <a-input
                v-model="judgeCaseItem.output"
                placeholder="请输入测试输出用例"
              />
            </a-form-item>
            <a-button status="danger" @click="handleDelete(index)">
              删除
            </a-button>
          </a-space>
        </a-form-item>
        <div style="margin-top: 32px">
          <a-button @click="handleAdd" type="outline" status="success"
            >新增测试用例
          </a-button>
        </div>
      </a-form-item>
      <div style="margin-top: 16px" />
      <a-form-item>
        <a-button type="primary" style="min-width: 200px" @click="doSubmit"
          >提交
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from "vue"; // 添加 reactive 导入
import MdEditor from "@/components/MdEditor.vue";
import { QuestionControllerService } from "../../../generated";
import message from "@arco-design/web-vue/es/message";
import { useRoute } from "vue-router";

const route = useRoute();
// 如果页面地址包含 update，视为更新页面
const updatePage = route.path.includes("update");

// 使用 reactive 定义 form 对象
const form = reactive({
  title: "",
  tags: [] as string[], // 明确指定类型为字符串数组
  answer: "",
  content: "",
  judgeConfig: {
    memoryLimit: 1000,
    stackLimit: 1000,
    timeLimit: 1000,
  },
  judgeCase: [
    {
      input: "",
      output: "",
    },
  ],
});

const tagOptions = ref([
  { value: "简单", label: "简单" },
  { value: "中等", label: "中等" },
  { value: "困难", label: "困难" },
  // ...其他标签...
]);

// 使用内置 status 属性
// const getTagStatus = (tagLabel: string) => {
//   switch (tagLabel) {
//     case "简单":
//       return "success"; // 绿色
//     case "中等":
//       return "warning"; // 橙色
//     case "困难":
//       return "danger"; // 红色
//     default:
//       return ""; // 默认样式（蓝色）
//   }
// };
const getTagClass = (tagLabel: string) => {
  switch (tagLabel) {
    case "简单":
      return "custom-tag-green";
    case "中等":
      return "custom-tag-orange";
    case "困难":
      return "custom-tag-red";
    default:
      return "custom-tag-blue";
  }
};

// 处理标签变化
const handleTagChange = (value: string[]) => {
  console.log("当前选择的标签:", value);
};

/**
 * 根据题目 id 获取老的数据
 */
const loadData = async () => {
  const id = route.query.id;
  if (!id) {
    return;
  }
  const res = await QuestionControllerService.getQuestionByIdUsingGet(
    id as any
  );
  if (res.code === 0) {
    // 直接赋值给 reactive 对象
    Object.assign(form, res.data);

    // json 转 js 对象
    if (!form.judgeCase) {
      form.judgeCase = [
        {
          input: "",
          output: "",
        },
      ];
    } else if (typeof form.judgeCase === "string") {
      form.judgeCase = JSON.parse(form.judgeCase);
    }

    if (!form.judgeConfig) {
      form.judgeConfig = {
        memoryLimit: 1000,
        stackLimit: 1000,
        timeLimit: 1000,
      };
    } else if (typeof form.judgeConfig === "string") {
      form.judgeConfig = JSON.parse(form.judgeConfig);
    }

    if (!form.tags) {
      form.tags = [];
    } else if (typeof form.tags === "string") {
      form.tags = JSON.parse(form.tags);
    }
  } else {
    message.error("加载失败，" + res.message);
  }
};

onMounted(() => {
  loadData();
});

const doSubmit = async () => {
  console.log(form);
  // 区分更新还是创建
  if (updatePage) {
    const res = await QuestionControllerService.updateQuestionUsingPost(form);
    if (res.code === 0) {
      message.success("更新成功");
    } else {
      message.error("更新失败，" + res.message);
    }
  } else {
    const res = await QuestionControllerService.addQuestionUsingPost(form);
    if (res.code === 0) {
      message.success("创建成功");
    } else {
      message.error("创建失败，" + res.message);
    }
  }
};

/**
 * 新增判题用例
 */
const handleAdd = () => {
  form.judgeCase.push({
    input: "",
    output: "",
  });
};

/**
 * 删除判题用例
 */
const handleDelete = (index: number) => {
  form.judgeCase.splice(index, 1);
};

const onContentChange = (value: string) => {
  form.content = value;
};

const onAnswerChange = (value: string) => {
  form.answer = value;
};
</script>

<style scoped>
#addQuestionView :deep(.arco-tag) {
  all: initial !important; /* 重置所有默认样式 */
  display: inline-flex !important;
  align-items: center !important;
  box-sizing: border-box !important;
  margin: 2px 4px 2px 0 !important;
  padding: 0 8px !important;
  font-size: 14px !important;
  line-height: 24px !important;
  border-radius: 4px !important;
  border: 1px solid !important;
  font-weight: 500 !important;
}

/* 自定义标签样式 */
#addQuestionView :deep(.custom-tag-green) {
  background-color: rgba(0, 180, 42, 0.1) !important;
  border-color: rgba(0, 180, 42, 0.3) !important;
  color: #00b42a !important;
}

#addQuestionView :deep(.custom-tag-orange) {
  background-color: rgba(255, 125, 0, 0.1) !important;
  border-color: rgba(255, 125, 0, 0.3) !important;
  color: #ff7d00 !important;
}

#addQuestionView :deep(.custom-tag-red) {
  background-color: rgba(245, 63, 63, 0.1) !important;
  border-color: rgba(245, 63, 63, 0.3) !important;
  color: #f53f3f !important;
}

#addQuestionView :deep(.custom-tag-blue) {
  background-color: rgba(22, 93, 255, 0.1) !important;
  border-color: rgba(22, 93, 255, 0.3) !important;
  color: #165dff !important;
}
</style>
