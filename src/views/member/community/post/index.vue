<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="100px"
    >
      <el-form-item label="帖子ID" prop="tid">
        <el-input
          v-model="queryParams.tid"
          placeholder="请输入帖子ID"
          clearable
          @keyup.enter="handleQuery"
          class="!w-180px"
        />
      </el-form-item>
      <el-form-item label="内容关键词" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入内容关键词"
          clearable
          @keyup.enter="handleQuery"
          class="!w-200px"
        />
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          value-format="YYYY-MM-DD HH:mm:ss"
          type="daterange"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-220px"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
        <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" /> 重置</el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="回帖ID" align="center" prop="pid" width="80" />
      <el-table-column label="所属帖子" align="left" prop="topicTitle" min-width="200">
        <template #default="scope">
          <el-link type="primary" @click="goToTopic(scope.row.tid)">
            {{ scope.row.topicTitle || `帖子#${scope.row.tid}` }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="回复内容" align="left" min-width="300">
        <template #default="scope">
          <div class="line-clamp-2" v-html="scope.row.content"></div>
        </template>
      </el-table-column>
      <el-table-column label="作者" align="center" width="150">
        <template #default="scope">
          <div class="flex items-center justify-center">
            <el-avatar :size="24" :src="scope.row.author?.avatar" class="mr-5px">
              {{ scope.row.author?.nickname?.charAt(0) }}
            </el-avatar>
            <span>{{ scope.row.author?.nickname || '匿名' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="点赞数" align="center" prop="likeCount" width="80" />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="170"
      />
      <el-table-column label="操作" align="center" width="150" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openDetail(scope.row)"
            v-hasPermi="['member:community:query']"
          >
            查看
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.pid)"
            v-hasPermi="['member:community:delete']"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 详情弹窗 -->
  <PostDetailDialog ref="detailDialogRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import * as CommunityApi from '@/api/member/community'
import PostDetailDialog from './PostDetailDialog.vue'

defineOptions({ name: 'CommunityPost' })

const router = useRouter()
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  tid: undefined,
  title: '',
  createTime: []
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await CommunityApi.getPostPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 详情弹窗 */
const detailDialogRef = ref()
const openDetail = (row: any) => {
  detailDialogRef.value.open(row)
}

/** 跳转到帖子 */
const goToTopic = (tid: number) => {
  router.push({ path: '/member/community/topic', query: { tid } })
}

/** 删除按钮操作 */
const handleDelete = async (pid: number) => {
  try {
    // 删除的二次确认
    await message.delConfirm()
    // 发起删除
    await CommunityApi.deletePost(pid)
    message.success(t('common.delSuccess'))
    // 刷新列表
    await getList()
  } catch {}
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>

