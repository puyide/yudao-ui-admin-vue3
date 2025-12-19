import request from '@/config/axios'

// ==================== 类型定义 ====================

export interface CommunityTopicVO {
  tid: number
  title: string
  content?: string
  cid: number
  categoryName?: string
  tags?: string[]
  author?: AuthorInfo
  postCount?: number
  viewCount?: number
  likeCount?: number
  auditStatus?: number
  auditRemark?: string
  auditBy?: string
  auditTime?: Date
  pinned?: boolean
  locked?: boolean
  deleted?: boolean
  createTime?: Date
}

export interface CommunityPostVO {
  pid: number
  tid: number
  topicTitle?: string
  index?: number
  content: string
  author?: AuthorInfo
  likeCount?: number
  auditStatus?: number
  auditRemark?: string
  auditBy?: string
  auditTime?: Date
  deleted?: boolean
  createTime?: Date
}

export interface AuthorInfo {
  userId?: number
  nodebbUid?: number
  nickname?: string
  avatar?: string
  mobile?: string
  anonymous?: boolean
}

export interface TopicPageReqVO {
  pageNo: number
  pageSize: number
  tid?: number
  title?: string
  cid?: number
  auditStatus?: number
  userId?: number
  createTime?: Date[]
}

export interface AuditReqVO {
  id: number
  auditStatus: number
  auditRemark?: string
}

export interface TopicUpdateReqVO {
  tid: number
  pinned?: boolean
  locked?: boolean
}

export interface PendingCountVO {
  topicCount: number
  postCount: number
}

// ==================== 帖子管理 API ====================

// 获取帖子分页列表
export const getTopicPage = async (params: TopicPageReqVO) => {
  return await request.get({ url: `/member/community-admin/topic/page`, params })
}

// 获取帖子详情
export const getTopicDetail = async (tid: number) => {
  return await request.get({ url: `/member/community-admin/topic/get?tid=${tid}` })
}

// 审核帖子
export const auditTopic = async (data: AuditReqVO) => {
  return await request.put({ url: `/member/community-admin/topic/audit`, data })
}

// 更新帖子状态
export const updateTopicStatus = async (data: TopicUpdateReqVO) => {
  return await request.put({ url: `/member/community-admin/topic/update-status`, data })
}

// 删除帖子
export const deleteTopic = async (tid: number) => {
  return await request.delete({ url: `/member/community-admin/topic/delete?tid=${tid}` })
}

// ==================== 回帖管理 API ====================

// 获取回帖分页列表
export const getPostPage = async (params: TopicPageReqVO) => {
  return await request.get({ url: `/member/community-admin/post/page`, params })
}

// 审核回帖
export const auditPost = async (data: AuditReqVO) => {
  return await request.put({ url: `/member/community-admin/post/audit`, data })
}

// 删除回帖
export const deletePost = async (pid: number) => {
  return await request.delete({ url: `/member/community-admin/post/delete?pid=${pid}` })
}

// ==================== 统计 API ====================

// 获取待审核数量
export const getPendingCount = async (): Promise<PendingCountVO> => {
  return await request.get({ url: `/member/community-admin/statistics/pending-count` })
}

