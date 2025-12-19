import request from '@/config/axios'

// 器材预约VO
export interface ReservationVO {
  id: number
  equipmentId: number
  equipmentName?: string
  equipmentPicUrl?: string
  userId: number
  userNickname?: string
  ownerUserId: number
  ownerNickname?: string
  reservationStatus: number
  reservationDate: Date
  planBorrowDate: Date
  planBorrowDays: number
  actualBorrowDate?: Date
  actualReturnDate?: Date
  depositAmount: number
  depositStatus: number
  remark?: string
  cancelReason?: string
  handoverId?: number
  createTime: Date
}

// 查询器材预约分页
export const getReservationPage = async (params: any) => {
  return await request.get({ url: `/product/reservation/page`, params })
}

// 查询器材预约详情
export const getReservation = async (id: number) => {
  return await request.get({ url: `/product/reservation/get?id=` + id })
}

// 取消预约
export const cancelReservation = async (id: number, reason: string) => {
  return await request.put({ url: `/product/reservation/cancel`, params: { id, reason } })
}

// 确认预约（管理员操作）
export const confirmReservation = async (id: number) => {
  return await request.put({ url: `/product/reservation/admin/confirm?id=` + id })
}

// 完成预约
export const completeReservation = async (id: number) => {
  return await request.put({ url: `/product/reservation/admin/complete?id=` + id })
}

