<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="100px"
    >
      <el-form-item label="交接状态" prop="handoverStatus">
        <el-select v-model="queryParams.handoverStatus" class="!w-200px" clearable placeholder="全部">
          <el-option label="待确认" :value="0" />
          <el-option label="已确认" :value="1" />
          <el-option label="进行中" :value="2" />
          <el-option label="已完成" :value="3" />
          <el-option label="已取消" :value="4" />
          <el-option label="异常" :value="5" />
        </el-select>
      </el-form-item>
      <el-form-item label="交接方式" prop="handoverMode">
        <el-select v-model="queryParams.handoverMode" class="!w-200px" clearable placeholder="全部">
          <el-option label="当面交接" :value="1" />
          <el-option label="快递配送" :value="2" />
          <el-option label="自提点" :value="3" />
          <el-option label="上门服务" :value="4" />
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker
          v-model="queryParams.createTime"
          :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
          class="!w-240px"
          end-placeholder="结束日期"
          start-placeholder="开始日期"
          type="daterange"
          value-format="YYYY-MM-DD HH:mm:ss"
        />
      </el-form-item>
      <el-form-item>
        <el-button @click="handleQuery">
          <Icon class="mr-5px" icon="ep:search" />
          搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon class="mr-5px" icon="ep:refresh" />
          重置
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true">
      <el-table-column align="center" label="会话编号" prop="id" width="100" />
      <el-table-column align="center" label="器材信息" min-width="180">
        <template #default="scope">
          <div class="flex items-center">
            <el-image
              v-if="scope.row.equipmentPicUrl"
              :src="scope.row.equipmentPicUrl"
              class="w-40px h-40px mr-10px"
              fit="cover"
            />
            <span>{{ scope.row.equipmentName || '-' }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column align="center" label="出借方" prop="lenderNickname" width="100" />
      <el-table-column align="center" label="借用方" prop="borrowerNickname" width="100" />
      <el-table-column align="center" label="交接状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.handoverStatus)">
            {{ getStatusLabel(scope.row.handoverStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="交接方式" width="100">
        <template #default="scope">
          {{ getModeLabel(scope.row.handoverMode) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="约定时间" width="150">
        <template #default="scope">
          {{ scope.row.handoverTime ? formatDate(scope.row.handoverTime, 'YYYY-MM-DD HH:mm') : '-' }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="出借方验收" width="100">
        <template #default="scope">
          <el-tag :type="getVerifyType(scope.row.lenderVerifyResult)">
            {{ getVerifyLabel(scope.row.lenderVerifyResult) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="借用方验收" width="100">
        <template #default="scope">
          <el-tag :type="getVerifyType(scope.row.borrowerVerifyResult)">
            {{ getVerifyLabel(scope.row.borrowerVerifyResult) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="创建时间"
        prop="createTime"
        width="180"
      />
      <el-table-column align="center" fixed="right" label="操作" width="150">
        <template #default="scope">
          <el-button link type="primary" @click="openDetail(scope.row.id)">详情</el-button>
          <el-button link type="warning" @click="handleIntervene(scope.row)">介入</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 介入弹窗 -->
  <Dialog v-model="interveneDialogVisible" title="管理员介入" width="500px">
    <el-form :model="interveneForm" label-width="100px">
      <el-form-item label="发送消息">
        <el-input
          v-model="interveneForm.content"
          type="textarea"
          :rows="4"
          placeholder="请输入要发送给双方的系统消息"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="interveneDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitIntervene">发送</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { dateFormatter, formatDate } from '@/utils/formatTime'
import * as HandoverApi from '@/api/mall/trade/handover'

defineOptions({ name: 'EquipmentHandover' })

const message = useMessage()
const { push } = useRouter()

const loading = ref(true)
const total = ref(0)
const list = ref([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  handoverStatus: undefined,
  handoverMode: undefined,
  createTime: []
})
const queryFormRef = ref()

// 介入弹窗
const interveneDialogVisible = ref(false)
const interveneForm = reactive({
  handoverId: 0,
  content: ''
})

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await HandoverApi.getHandoverPage(queryParams)
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

/** 打开详情 */
const openDetail = (id: number) => {
  push({ name: 'EquipmentHandoverDetail', params: { id } })
}

/** 介入处理 */
const handleIntervene = (row: any) => {
  interveneForm.handoverId = row.id
  interveneForm.content = ''
  interveneDialogVisible.value = true
}

/** 提交介入 */
const submitIntervene = async () => {
  if (!interveneForm.content) {
    message.warning('请输入消息内容')
    return
  }
  await HandoverApi.sendAdminMessage(interveneForm.handoverId, interveneForm.content)
  message.success('发送成功')
  interveneDialogVisible.value = false
}

/** 获取状态标签 */
const getStatusLabel = (status: number) => {
  const map: Record<number, string> = {
    0: '待确认', 1: '已确认', 2: '进行中', 3: '已完成', 4: '已取消', 5: '异常'
  }
  return map[status] || '未知'
}

const getStatusType = (status: number) => {
  const map: Record<number, string> = {
    0: 'warning', 1: 'primary', 2: 'info', 3: 'success', 4: 'info', 5: 'danger'
  }
  return map[status] || 'info'
}

const getModeLabel = (mode: number) => {
  const map: Record<number, string> = {
    1: '当面交接', 2: '快递配送', 3: '自提点', 4: '上门服务'
  }
  return map[mode] || '未知'
}

const getVerifyLabel = (result: number | null) => {
  if (result === null || result === undefined) return '待验收'
  const map: Record<number, string> = { 0: '待验收', 1: '通过', 2: '有异常' }
  return map[result] || '未知'
}

const getVerifyType = (result: number | null) => {
  if (result === null || result === undefined) return 'info'
  const map: Record<number, string> = { 0: 'info', 1: 'success', 2: 'danger' }
  return map[result] || 'info'
}

/** 初始化 */
onMounted(() => {
  getList()
})
</script>

