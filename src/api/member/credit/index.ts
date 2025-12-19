import request from '@/config/axios'

// 信用分VO
export interface CreditScoreVO {
  id: number
  userId: number
  totalScore: number
  donateCount: number
  borrowCount: number
  returnOnTimeCount: number
  overdueCount: number
  damageCount: number
  violationCount: number
  scoreChangeReason: string
  lastScoreChangeDate: Date
  createTime: Date
}

// 信用分变动记录VO
export interface CreditLogVO {
  id: number
  userId: number
  changeType: number
  changeScore: number
  beforeScore: number
  afterScore: number
  reason: string
  relatedOrderId: number
  createTime: Date
}

// 信用分变动记录查询参数
export interface CreditLogPageReqVO {
  pageNo: number
  pageSize: number
  userId?: number
  changeType?: number
  createTime?: Date[]
}

// 查询信用分变动记录分页
export const getCreditLogPage = async (params: CreditLogPageReqVO) => {
  return await request.get({ url: `/member/credit/log/page`, params })
}

// 查询用户信用分
export const getUserCreditScore = async (userId: number) => {
  return await request.get({ url: `/member/credit/score/get?userId=` + userId })
}

// 手动调整用户信用分
export const updateCreditScore = async (data: { userId: number; score: number; reason: string }) => {
  return await request.put({ url: `/member/credit/score/update`, data })
}

