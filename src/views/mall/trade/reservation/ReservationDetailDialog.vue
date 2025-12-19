<template>
  <Dialog v-model="dialogVisible" title="预约详情" width="700px">
    <el-descriptions v-if="detail" :column="2" border>
      <el-descriptions-item label="预约编号">{{ detail.id }}</el-descriptions-item>
      <el-descriptions-item label="预约状态">
        <el-tag :type="getStatusType(detail.reservationStatus)">
          {{ getStatusLabel(detail.reservationStatus) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="器材名称">{{ detail.equipmentName || '-' }}</el-descriptions-item>
      <el-descriptions-item label="器材ID">{{ detail.equipmentId }}</el-descriptions-item>
      <el-descriptions-item label="预约用户">{{ detail.userNickname || '-' }}</el-descriptions-item>
      <el-descriptions-item label="用户ID">{{ detail.userId }}</el-descriptions-item>
      <el-descriptions-item label="器材所有者">{{ detail.ownerNickname || '-' }}</el-descriptions-item>
      <el-descriptions-item label="所有者ID">{{ detail.ownerUserId }}</el-descriptions-item>
      <el-descriptions-item label="计划借用日期">
        {{ formatDate(detail.planBorrowDate, 'YYYY-MM-DD') }}
      </el-descriptions-item>
      <el-descriptions-item label="计划借用天数">{{ detail.planBorrowDays }} 天</el-descriptions-item>
      <el-descriptions-item label="实际借用时间">
        {{ detail.actualBorrowDate ? formatDate(detail.actualBorrowDate, 'YYYY-MM-DD HH:mm:ss') : '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="实际归还时间">
        {{ detail.actualReturnDate ? formatDate(detail.actualReturnDate, 'YYYY-MM-DD HH:mm:ss') : '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="押金金额">
        ¥{{ (detail.depositAmount / 100).toFixed(2) }}
      </el-descriptions-item>
      <el-descriptions-item label="押金状态">
        <el-tag :type="getDepositStatusType(detail.depositStatus)">
          {{ getDepositStatusLabel(detail.depositStatus) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="预约备注" :span="2">{{ detail.remark || '-' }}</el-descriptions-item>
      <el-descriptions-item v-if="detail.cancelReason" label="取消原因" :span="2">
        {{ detail.cancelReason }}
      </el-descriptions-item>
      <el-descriptions-item label="关联交接会话">
        <el-button v-if="detail.handoverId" link type="primary" @click="goHandover">
          {{ detail.handoverId }}
        </el-button>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="预约时间">
        {{ formatDate(detail.createTime, 'YYYY-MM-DD HH:mm:ss') }}
      </el-descriptions-item>
    </el-descriptions>
  </Dialog>
</template>

<script lang="ts" setup>
import { formatDate } from '@/utils/formatTime'
import * as ReservationApi from '@/api/mall/trade/reservation'

const { push } = useRouter()

const dialogVisible = ref(false)
const detail = ref<any>(null)

/** 打开弹窗 */
const open = async (id: number) => {
  dialogVisible.value = true
  detail.value = await ReservationApi.getReservation(id)
}

/** 跳转到交接会话 */
const goHandover = () => {
  dialogVisible.value = false
  push({ name: 'EquipmentHandoverDetail', params: { id: detail.value.handoverId } })
}

/** 获取状态相关方法 */
const getStatusLabel = (status: number) => {
  const map: Record<number, string> = { 0: '待确认', 1: '已确认', 2: '已取消', 3: '已完成' }
  return map[status] || '未知'
}
const getStatusType = (status: number) => {
  const map: Record<number, string> = { 0: 'warning', 1: 'primary', 2: 'info', 3: 'success' }
  return map[status] || 'info'
}
const getDepositStatusLabel = (status: number) => {
  const map: Record<number, string> = { 0: '待支付', 1: '已支付', 2: '已退还', 3: '已扣除' }
  return map[status] || '未知'
}
const getDepositStatusType = (status: number) => {
  const map: Record<number, string> = { 0: 'warning', 1: 'success', 2: 'info', 3: 'danger' }
  return map[status] || 'info'
}

defineExpose({ open })
</script>

