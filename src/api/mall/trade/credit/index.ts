import request from '@/config/axios'

// 信用分VO
export interface CreditScoreVO {
  id: number
  userId: number
  userNickname?: string
  totalScore: number
  donateCount: number
  borrowCount: number
  returnOnTimeCount: number
  overdueCount: number
  damageCount: number
  violationCount: number
  scoreChangeReason?: string
  lastScoreChangeDate?: Date
  createTime: Date
}

// 信用分变动记录VO
export interface CreditLogVO {
  id: number
  userId: number
  userNickname?: string
  changeType: number
  changeScore: number
  beforeScore: number
  afterScore: number
  reason?: string
  relatedOrderId?: number
  createTime: Date
}

// 查询信用分分页
export const getCreditScorePage = async (params: any) => {
  return await request.get({ url: `/member/credit/admin/score/page`, params })
}

// 查询信用分变动记录分页
export const getCreditLogPage = async (params: any) => {
  return await request.get({ url: `/member/credit/admin/log/page`, params })
}

// 查询用户信用分
export const getUserCreditScore = async (userId: number) => {
  return await request.get({ url: `/member/credit/admin/score/get?userId=` + userId })
}

// 手动调整用户信用分
export const adjustCreditScore = async (data: { 
  userId: number
  changeType: number
  changeScore: number
  reason: string 
}) => {
  return await request.post({ url: `/member/credit/admin/score/adjust`, data })
}

