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
      <el-form-item label="预约状态" prop="reservationStatus">
        <el-select v-model="queryParams.reservationStatus" class="!w-200px" clearable placeholder="全部">
          <el-option label="待确认" :value="0" />
          <el-option label="已确认" :value="1" />
          <el-option label="已取消" :value="2" />
          <el-option label="已完成" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="押金状态" prop="depositStatus">
        <el-select v-model="queryParams.depositStatus" class="!w-200px" clearable placeholder="全部">
          <el-option label="待支付" :value="0" />
          <el-option label="已支付" :value="1" />
          <el-option label="已退还" :value="2" />
          <el-option label="已扣除" :value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="预约时间" prop="createTime">
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
      <el-table-column align="center" label="预约编号" prop="id" width="100" />
      <el-table-column align="center" label="器材信息" min-width="200">
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
      <el-table-column align="center" label="预约用户" prop="userNickname" width="120" />
      <el-table-column align="center" label="器材所有者" prop="ownerNickname" width="120" />
      <el-table-column align="center" label="预约状态" width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.reservationStatus)">
            {{ getStatusLabel(scope.row.reservationStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="借用日期" prop="planBorrowDate" width="120">
        <template #default="scope">
          {{ formatDate(scope.row.planBorrowDate, 'YYYY-MM-DD') }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="借用天数" prop="planBorrowDays" width="100" />
      <el-table-column align="center" label="押金金额" width="100">
        <template #default="scope">
          ¥{{ (scope.row.depositAmount / 100).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column align="center" label="押金状态" width="100">
        <template #default="scope">
          <el-tag :type="getDepositStatusType(scope.row.depositStatus)">
            {{ getDepositStatusLabel(scope.row.depositStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="预约时间"
        prop="createTime"
        width="180"
      />
      <el-table-column align="center" fixed="right" label="操作" width="150">
        <template #default="scope">
          <el-button link type="primary" @click="openDetail(scope.row)">详情</el-button>
          <el-button
            v-if="scope.row.reservationStatus === 0"
            link
            type="danger"
            @click="handleCancel(scope.row)"
          >
            取消
          </el-button>
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

  <!-- 详情弹窗 -->
  <ReservationDetailDialog ref="detailDialogRef" />
</template>

<script lang="ts" setup>
import { dateFormatter, formatDate } from '@/utils/formatTime'
import * as ReservationApi from '@/api/mall/trade/reservation'
import ReservationDetailDialog from './ReservationDetailDialog.vue'

defineOptions({ name: 'EquipmentReservation' })

const message = useMessage()

const loading = ref(true)
const total = ref(0)
const list = ref([])
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  reservationStatus: undefined,
  depositStatus: undefined,
  createTime: []
})
const queryFormRef = ref()
const detailDialogRef = ref()

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ReservationApi.getReservationPage(queryParams)
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
const openDetail = (row: any) => {
  detailDialogRef.value.open(row.id)
}

/** 取消预约 */
const handleCancel = async (row: any) => {
  try {
    await message.prompt('请输入取消原因', '取消预约')
      .then(async ({ value }) => {
        await ReservationApi.cancelReservation(row.id, value)
        message.success('取消成功')
        await getList()
      })
  } catch {}
}

/** 获取状态标签 */
const getStatusLabel = (status: number) => {
  const map: Record<number, string> = {
    0: '待确认',
    1: '已确认',
    2: '已取消',
    3: '已完成'
  }
  return map[status] || '未知'
}

/** 获取状态类型 */
const getStatusType = (status: number) => {
  const map: Record<number, string> = {
    0: 'warning',
    1: 'primary',
    2: 'info',
    3: 'success'
  }
  return map[status] || 'info'
}

/** 获取押金状态标签 */
const getDepositStatusLabel = (status: number) => {
  const map: Record<number, string> = {
    0: '待支付',
    1: '已支付',
    2: '已退还',
    3: '已扣除'
  }
  return map[status] || '未知'
}

/** 获取押金状态类型 */
const getDepositStatusType = (status: number) => {
  const map: Record<number, string> = {
    0: 'warning',
    1: 'success',
    2: 'info',
    3: 'danger'
  }
  return map[status] || 'info'
}

/** 初始化 */
onMounted(() => {
  getList()
})
</script>

