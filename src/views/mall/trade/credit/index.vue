<template>
  <ContentWrap>
    <!-- Tab切换 -->
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="信用分列表" name="score" />
      <el-tab-pane label="变动记录" name="log" />
    </el-tabs>

    <!-- 信用分列表 -->
    <template v-if="activeTab === 'score'">
      <el-form
        ref="scoreQueryFormRef"
        :inline="true"
        :model="scoreQueryParams"
        class="-mb-15px"
        label-width="80px"
      >
        <el-form-item label="用户ID" prop="userId">
          <el-input
            v-model="scoreQueryParams.userId"
            class="!w-200px"
            clearable
            placeholder="请输入用户ID"
            @keyup.enter="handleScoreQuery"
          />
        </el-form-item>
        <el-form-item label="信用分" prop="minScore">
          <el-input-number
            v-model="scoreQueryParams.minScore"
            class="!w-120px"
            :min="0"
            :max="150"
            placeholder="最低分"
          />
          <span class="mx-10px">-</span>
          <el-input-number
            v-model="scoreQueryParams.maxScore"
            class="!w-120px"
            :min="0"
            :max="150"
            placeholder="最高分"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleScoreQuery">
            <Icon class="mr-5px" icon="ep:search" />
            搜索
          </el-button>
          <el-button @click="resetScoreQuery">
            <Icon class="mr-5px" icon="ep:refresh" />
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="scoreLoading" :data="scoreList" :stripe="true" class="mt-16px">
        <el-table-column align="center" label="用户ID" prop="userId" width="100" />
        <el-table-column align="center" label="用户昵称" prop="userNickname" width="120" />
        <el-table-column align="center" label="总信用分" width="100">
          <template #default="scope">
            <span :class="getCreditScoreClass(scope.row.totalScore)">
              {{ scope.row.totalScore }}
            </span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="信用等级" width="100">
          <template #default="scope">
            <el-tag :type="getCreditLevelType(scope.row.totalScore)">
              {{ getCreditLevel(scope.row.totalScore) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="捐赠次数" prop="donateCount" width="90" />
        <el-table-column align="center" label="借用次数" prop="borrowCount" width="90" />
        <el-table-column align="center" label="按时归还" prop="returnOnTimeCount" width="90" />
        <el-table-column align="center" label="逾期次数" prop="overdueCount" width="90" />
        <el-table-column align="center" label="损坏次数" prop="damageCount" width="90" />
        <el-table-column align="center" label="违规次数" prop="violationCount" width="90" />
        <el-table-column align="center" label="最近变动" prop="scoreChangeReason" min-width="150" />
        <el-table-column align="center" fixed="right" label="操作" width="150">
          <template #default="scope">
            <el-button link type="primary" @click="openAdjustDialog(scope.row)">调整</el-button>
            <el-button link type="primary" @click="viewUserLogs(scope.row.userId)">记录</el-button>
          </template>
        </el-table-column>
      </el-table>
      <Pagination
        v-model:limit="scoreQueryParams.pageSize"
        v-model:page="scoreQueryParams.pageNo"
        :total="scoreTotal"
        @pagination="getScoreList"
      />
    </template>

    <!-- 变动记录列表 -->
    <template v-if="activeTab === 'log'">
      <el-form
        ref="logQueryFormRef"
        :inline="true"
        :model="logQueryParams"
        class="-mb-15px"
        label-width="80px"
      >
        <el-form-item label="用户ID" prop="userId">
          <el-input
            v-model="logQueryParams.userId"
            class="!w-200px"
            clearable
            placeholder="请输入用户ID"
            @keyup.enter="handleLogQuery"
          />
        </el-form-item>
        <el-form-item label="变动类型" prop="changeType">
          <el-select v-model="logQueryParams.changeType" class="!w-200px" clearable placeholder="全部">
            <el-option label="出借" :value="1" />
            <el-option label="归还" :value="2" />
            <el-option label="好评" :value="3" />
            <el-option label="差评" :value="4" />
            <el-option label="违约" :value="5" />
            <el-option label="充值" :value="6" />
            <el-option label="注册奖励" :value="7" />
            <el-option label="管理员调整" :value="10" />
          </el-select>
        </el-form-item>
        <el-form-item label="变动时间" prop="createTime">
          <el-date-picker
            v-model="logQueryParams.createTime"
            :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
            class="!w-240px"
            end-placeholder="结束日期"
            start-placeholder="开始日期"
            type="daterange"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleLogQuery">
            <Icon class="mr-5px" icon="ep:search" />
            搜索
          </el-button>
          <el-button @click="resetLogQuery">
            <Icon class="mr-5px" icon="ep:refresh" />
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="logLoading" :data="logList" :stripe="true" class="mt-16px">
        <el-table-column align="center" label="记录ID" prop="id" width="100" />
        <el-table-column align="center" label="用户ID" prop="userId" width="100" />
        <el-table-column align="center" label="用户昵称" prop="userNickname" width="120" />
        <el-table-column align="center" label="变动类型" width="100">
          <template #default="scope">
            <el-tag :type="getChangeTypeType(scope.row.changeType)">
              {{ getChangeTypeLabel(scope.row.changeType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="变动分数" width="100">
          <template #default="scope">
            <span :class="scope.row.changeScore > 0 ? 'text-green-500' : 'text-red-500'">
              {{ scope.row.changeScore > 0 ? '+' : '' }}{{ scope.row.changeScore }}
            </span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="变动前" prop="beforeScore" width="80" />
        <el-table-column align="center" label="变动后" prop="afterScore" width="80" />
        <el-table-column align="center" label="变动原因" prop="reason" min-width="200" />
        <el-table-column align="center" label="关联订单" prop="relatedOrderId" width="100" />
        <el-table-column
          :formatter="dateFormatter"
          align="center"
          label="变动时间"
          prop="createTime"
          width="180"
        />
      </el-table>
      <Pagination
        v-model:limit="logQueryParams.pageSize"
        v-model:page="logQueryParams.pageNo"
        :total="logTotal"
        @pagination="getLogList"
      />
    </template>
  </ContentWrap>

  <!-- 调整信用分弹窗 -->
  <Dialog v-model="adjustDialogVisible" title="调整信用分" width="500px">
    <el-form :model="adjustForm" label-width="100px" :rules="adjustRules" ref="adjustFormRef">
      <el-form-item label="用户">
        {{ adjustForm.userNickname }} (ID: {{ adjustForm.userId }})
      </el-form-item>
      <el-form-item label="当前信用分">
        <span class="font-bold text-lg">{{ adjustForm.currentScore }}</span>
      </el-form-item>
      <el-form-item label="调整类型" prop="changeType">
        <el-radio-group v-model="adjustForm.changeType">
          <el-radio :value="1">增加</el-radio>
          <el-radio :value="2">扣减</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="调整分数" prop="changeScore">
        <el-input-number
          v-model="adjustForm.changeScore"
          :min="1"
          :max="100"
          placeholder="请输入分数"
        />
      </el-form-item>
      <el-form-item label="调整原因" prop="reason">
        <el-input
          v-model="adjustForm.reason"
          type="textarea"
          :rows="3"
          placeholder="请输入调整原因"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="adjustDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitAdjust">确定</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import * as CreditApi from '@/api/mall/trade/credit'

defineOptions({ name: 'MemberCredit' })

const message = useMessage()

const activeTab = ref('score')

// 信用分列表
const scoreLoading = ref(false)
const scoreTotal = ref(0)
const scoreList = ref([])
const scoreQueryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  minScore: undefined,
  maxScore: undefined
})
const scoreQueryFormRef = ref()

// 变动记录列表
const logLoading = ref(false)
const logTotal = ref(0)
const logList = ref([])
const logQueryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  changeType: undefined,
  createTime: []
})
const logQueryFormRef = ref()

// 调整弹窗
const adjustDialogVisible = ref(false)
const adjustFormRef = ref()
const adjustForm = reactive({
  userId: 0,
  userNickname: '',
  currentScore: 0,
  changeType: 1, // 1增加 2扣减
  changeScore: 1,
  reason: ''
})
const adjustRules = {
  changeType: [{ required: true, message: '请选择调整类型', trigger: 'change' }],
  changeScore: [{ required: true, message: '请输入调整分数', trigger: 'blur' }],
  reason: [{ required: true, message: '请输入调整原因', trigger: 'blur' }]
}

/** Tab切换 */
const handleTabChange = () => {
  if (activeTab.value === 'score') {
    getScoreList()
  } else {
    getLogList()
  }
}

/** 获取信用分列表 */
const getScoreList = async () => {
  scoreLoading.value = true
  try {
    const data = await CreditApi.getCreditScorePage(scoreQueryParams)
    scoreList.value = data.list
    scoreTotal.value = data.total
  } finally {
    scoreLoading.value = false
  }
}

/** 获取变动记录列表 */
const getLogList = async () => {
  logLoading.value = true
  try {
    const data = await CreditApi.getCreditLogPage(logQueryParams)
    logList.value = data.list
    logTotal.value = data.total
  } finally {
    logLoading.value = false
  }
}

/** 搜索 */
const handleScoreQuery = () => {
  scoreQueryParams.pageNo = 1
  getScoreList()
}

const handleLogQuery = () => {
  logQueryParams.pageNo = 1
  getLogList()
}

/** 重置 */
const resetScoreQuery = () => {
  scoreQueryFormRef.value?.resetFields()
  handleScoreQuery()
}

const resetLogQuery = () => {
  logQueryFormRef.value?.resetFields()
  handleLogQuery()
}

/** 打开调整弹窗 */
const openAdjustDialog = (row: any) => {
  adjustForm.userId = row.userId
  adjustForm.userNickname = row.userNickname
  adjustForm.currentScore = row.totalScore
  adjustForm.changeType = 1
  adjustForm.changeScore = 1
  adjustForm.reason = ''
  adjustDialogVisible.value = true
}

/** 提交调整 */
const submitAdjust = async () => {
  await adjustFormRef.value?.validate()
  
  const score = adjustForm.changeType === 1 ? adjustForm.changeScore : -adjustForm.changeScore
  await CreditApi.adjustCreditScore({
    userId: adjustForm.userId,
    changeType: 10, // 管理员调整
    changeScore: score,
    reason: adjustForm.reason
  })
  
  message.success('调整成功')
  adjustDialogVisible.value = false
  getScoreList()
}

/** 查看用户记录 */
const viewUserLogs = (userId: number) => {
  activeTab.value = 'log'
  logQueryParams.userId = userId
  handleLogQuery()
}

/** 信用等级相关方法 */
const getCreditLevel = (score: number) => {
  if (score >= 90) return '优秀'
  if (score >= 80) return '良好'
  if (score >= 60) return '一般'
  if (score >= 40) return '较差'
  return '很差'
}

const getCreditLevelType = (score: number) => {
  if (score >= 90) return 'success'
  if (score >= 80) return 'primary'
  if (score >= 60) return 'warning'
  return 'danger'
}

const getCreditScoreClass = (score: number) => {
  if (score >= 90) return 'text-green-500 font-bold'
  if (score >= 80) return 'text-blue-500 font-bold'
  if (score >= 60) return 'text-yellow-500 font-bold'
  return 'text-red-500 font-bold'
}

/** 变动类型相关方法 */
const getChangeTypeLabel = (type: number) => {
  const map: Record<number, string> = {
    1: '出借', 2: '归还', 3: '好评', 4: '差评',
    5: '违约', 6: '充值', 7: '注册奖励', 10: '管理员调整'
  }
  return map[type] || '未知'
}

const getChangeTypeType = (type: number) => {
  const map: Record<number, string> = {
    1: 'success', 2: 'success', 3: 'success', 4: 'danger',
    5: 'danger', 6: 'primary', 7: 'primary', 10: 'warning'
  }
  return map[type] || 'info'
}

/** 初始化 */
onMounted(() => {
  getScoreList()
})
</script>

