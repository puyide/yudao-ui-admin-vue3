<template>
  <ContentWrap v-loading="loading">
    <!-- 基本信息 -->
    <el-card shadow="never" class="mb-16px">
      <template #header>
        <div class="flex items-center justify-between">
          <span class="font-bold">交接会话详情</span>
          <el-tag :type="getStatusType(detail?.handoverStatus)">
            {{ getStatusLabel(detail?.handoverStatus) }}
          </el-tag>
        </div>
      </template>
      <el-descriptions :column="3" border v-if="detail">
        <el-descriptions-item label="会话编号">{{ detail.id }}</el-descriptions-item>
        <el-descriptions-item label="关联预约">{{ detail.reservationId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="器材ID">{{ detail.equipmentId }}</el-descriptions-item>
        <el-descriptions-item label="出借方">
          {{ detail.lenderNickname || '-' }} (ID: {{ detail.lenderUserId }})
        </el-descriptions-item>
        <el-descriptions-item label="借用方">
          {{ detail.borrowerNickname || '-' }} (ID: {{ detail.borrowerUserId }})
        </el-descriptions-item>
        <el-descriptions-item label="交接方式">{{ getModeLabel(detail.handoverMode) }}</el-descriptions-item>
        <el-descriptions-item label="约定地址" :span="2">{{ detail.handoverAddress || '-' }}</el-descriptions-item>
        <el-descriptions-item label="约定时间">
          {{ detail.handoverTime ? formatDate(detail.handoverTime, 'YYYY-MM-DD HH:mm') : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="实际交接时间">
          {{ detail.actualHandoverTime ? formatDate(detail.actualHandoverTime, 'YYYY-MM-DD HH:mm:ss') : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="归还时间">
          {{ detail.returnTime ? formatDate(detail.returnTime, 'YYYY-MM-DD HH:mm:ss') : '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ formatDate(detail.createTime, 'YYYY-MM-DD HH:mm:ss') }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 快递信息 -->
    <el-card v-if="detail?.handoverMode === 2" shadow="never" class="mb-16px">
      <template #header>
        <span class="font-bold">快递信息</span>
      </template>
      <el-descriptions :column="3" border>
        <el-descriptions-item label="快递公司">{{ detail.expressCompany || '-' }}</el-descriptions-item>
        <el-descriptions-item label="快递单号">{{ detail.expressNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="物流状态">
          {{ getExpressStatusLabel(detail.expressStatus) }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 器材状态 -->
    <el-card shadow="never" class="mb-16px">
      <template #header>
        <span class="font-bold">器材验收</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="12">
          <h4>出借时状态</h4>
          <p>{{ detail?.equipmentCondition || '暂无描述' }}</p>
          <div v-if="detail?.equipmentPhotos?.length" class="mt-10px">
            <el-image
              v-for="(url, index) in detail.equipmentPhotos"
              :key="index"
              :src="url"
              :preview-src-list="detail.equipmentPhotos"
              class="w-80px h-80px mr-10px"
              fit="cover"
            />
          </div>
          <div class="mt-10px">
            <span>借用方验收：</span>
            <el-tag :type="getVerifyType(detail?.borrowerVerifyResult)">
              {{ getVerifyLabel(detail?.borrowerVerifyResult) }}
            </el-tag>
            <p v-if="detail?.borrowerVerifyRemark" class="text-gray-500 text-sm">
              备注：{{ detail.borrowerVerifyRemark }}
            </p>
          </div>
        </el-col>
        <el-col :span="12">
          <h4>归还时状态</h4>
          <p>{{ detail?.returnCondition || '暂无描述' }}</p>
          <div v-if="detail?.returnPhotos?.length" class="mt-10px">
            <el-image
              v-for="(url, index) in detail.returnPhotos"
              :key="index"
              :src="url"
              :preview-src-list="detail.returnPhotos"
              class="w-80px h-80px mr-10px"
              fit="cover"
            />
          </div>
          <div class="mt-10px">
            <span>出借方验收：</span>
            <el-tag :type="getVerifyType(detail?.lenderVerifyResult)">
              {{ getVerifyLabel(detail?.lenderVerifyResult) }}
            </el-tag>
            <p v-if="detail?.lenderVerifyRemark" class="text-gray-500 text-sm">
              备注：{{ detail.lenderVerifyRemark }}
            </p>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 消息记录 -->
    <el-card shadow="never" class="mb-16px">
      <template #header>
        <span class="font-bold">消息记录</span>
      </template>
      <div class="message-list max-h-400px overflow-auto">
        <div
          v-for="msg in messageList"
          :key="msg.id"
          class="message-item mb-10px p-10px rounded"
          :class="msg.senderUserId === 0 ? 'bg-gray-100' : 'bg-blue-50'"
        >
          <div class="flex items-center mb-5px">
            <span class="font-bold mr-10px">
              {{ msg.senderUserId === 0 ? '系统消息' : msg.senderNickname || `用户${msg.senderUserId}` }}
            </span>
            <span class="text-gray-400 text-sm">
              {{ formatDate(msg.createTime, 'YYYY-MM-DD HH:mm:ss') }}
            </span>
            <el-tag v-if="msg.isSensitive" type="danger" size="small" class="ml-10px">敏感</el-tag>
          </div>
          <div class="message-content">
            <template v-if="msg.messageType === 3">
              <el-image
                v-for="(url, index) in msg.mediaUrls"
                :key="index"
                :src="url"
                :preview-src-list="msg.mediaUrls"
                class="w-100px h-100px mr-10px"
                fit="cover"
              />
            </template>
            <template v-else>
              {{ msg.content }}
            </template>
          </div>
        </div>
        <el-empty v-if="!messageList.length" description="暂无消息" />
      </div>
    </el-card>

    <!-- 评价反馈 -->
    <el-card shadow="never">
      <template #header>
        <span class="font-bold">评价反馈</span>
      </template>
      <el-table :data="feedbackList" :stripe="true">
        <el-table-column align="center" label="类型" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.feedbackType === 1 ? 'success' : 'primary'">
              {{ scope.row.feedbackType === 1 ? '感谢' : '评价' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="发起方" prop="fromUserNickname" width="120" />
        <el-table-column align="center" label="接收方" prop="toUserNickname" width="120" />
        <el-table-column align="center" label="评分" width="120">
          <template #default="scope">
            <el-rate v-if="scope.row.rating" v-model="scope.row.rating" disabled />
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="内容" prop="content" />
        <el-table-column
          :formatter="dateFormatter"
          align="center"
          label="时间"
          prop="createTime"
          width="180"
        />
      </el-table>
      <el-empty v-if="!feedbackList.length" description="暂无评价" />
    </el-card>
  </ContentWrap>
</template>

<script lang="ts" setup>
import { dateFormatter, formatDate } from '@/utils/formatTime'
import * as HandoverApi from '@/api/mall/trade/handover'

defineOptions({ name: 'EquipmentHandoverDetail' })

const route = useRoute()

const loading = ref(true)
const detail = ref<any>(null)
const messageList = ref<any[]>([])
const feedbackList = ref<any[]>([])

/** 加载数据 */
const loadData = async () => {
  const id = route.params.id as unknown as number
  loading.value = true
  try {
    detail.value = await HandoverApi.getHandover(id)
    messageList.value = await HandoverApi.getHandoverMessageList(id)
    feedbackList.value = await HandoverApi.getHandoverFeedbackList(id)
  } finally {
    loading.value = false
  }
}

/** 状态相关方法 */
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

const getExpressStatusLabel = (status: number) => {
  const map: Record<number, string> = {
    0: '待发货', 1: '已发货', 2: '运输中', 3: '已签收', 4: '异常'
  }
  return map[status] || '未知'
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
  loadData()
})
</script>

