import request from '@/config/axios'

// 交接会话VO
export interface HandoverVO {
  id: number
  reservationId?: number
  equipmentId: number
  equipmentName?: string
  equipmentPicUrl?: string
  lenderUserId: number
  lenderNickname?: string
  borrowerUserId: number
  borrowerNickname?: string
  handoverStatus: number
  handoverMode: number
  handoverAddress?: string
  handoverTime?: Date
  actualHandoverTime?: Date
  equipmentCondition?: string
  equipmentPhotos?: string[]
  expressNo?: string
  expressCompany?: string
  expressStatus?: number
  returnCondition?: string
  returnPhotos?: string[]
  returnTime?: Date
  lenderVerifyResult?: number
  borrowerVerifyResult?: number
  lastMessageTime?: Date
  createTime: Date
}

// 交接消息VO
export interface HandoverMessageVO {
  id: number
  handoverId: number
  senderUserId: number
  senderNickname?: string
  messageType: number
  content?: string
  mediaUrls?: string[]
  locationInfo?: string
  isRead: boolean
  isSensitive: boolean
  createTime: Date
}

// 反馈评价VO
export interface FeedbackVO {
  id: number
  handoverId: number
  feedbackType: number
  fromUserId: number
  fromUserNickname?: string
  toUserId: number
  toUserNickname?: string
  rating?: number
  content?: string
  tags?: string[]
  isAnonymous: boolean
  createTime: Date
}

// 查询交接会话分页
export const getHandoverPage = async (params: any) => {
  return await request.get({ url: `/trade/handover/admin/page`, params })
}

// 查询交接会话详情
export const getHandover = async (id: number) => {
  return await request.get({ url: `/trade/handover/admin/get?id=` + id })
}

// 查询交接会话消息列表
export const getHandoverMessageList = async (handoverId: number) => {
  return await request.get({ url: `/trade/handover/admin/message/list?handoverId=` + handoverId })
}

// 查询交接会话反馈列表
export const getHandoverFeedbackList = async (handoverId: number) => {
  return await request.get({ url: `/trade/handover/admin/feedback/list?handoverId=` + handoverId })
}

// 更新交接状态（管理员操作）
export const updateHandoverStatus = async (id: number, status: number) => {
  return await request.put({ url: `/trade/handover/admin/update-status`, params: { id, status } })
}

// 介入处理（管理员发送系统消息）
export const sendAdminMessage = async (handoverId: number, content: string) => {
  return await request.post({ 
    url: `/trade/handover/admin/message/send`, 
    data: { handoverId, content } 
  })
}

