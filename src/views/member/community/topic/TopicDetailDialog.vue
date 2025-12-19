<template>
  <Dialog v-model="dialogVisible" title="帖子详情" width="800px">
    <el-descriptions :column="2" border v-if="topicData">
      <el-descriptions-item label="帖子ID">{{ topicData.tid }}</el-descriptions-item>
      <el-descriptions-item label="分类">{{ topicData.categoryName }}</el-descriptions-item>
      <el-descriptions-item label="标题" :span="2">{{ topicData.title }}</el-descriptions-item>
      <el-descriptions-item label="作者">
        <div class="flex items-center">
          <el-avatar :size="24" :src="topicData.author?.avatar" class="mr-5px">
            {{ topicData.author?.nickname?.charAt(0) }}
          </el-avatar>
          <span>{{ topicData.author?.nickname || '匿名' }}</span>
          <span v-if="topicData.author?.mobile" class="ml-10px text-gray-400">
            ({{ topicData.author.mobile }})
          </span>
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ formatDate(topicData.createTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="浏览量">{{ topicData.viewCount }}</el-descriptions-item>
      <el-descriptions-item label="回帖数">{{ topicData.postCount }}</el-descriptions-item>
      <el-descriptions-item label="点赞数">{{ topicData.likeCount }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag v-if="topicData.pinned" type="warning" size="small" class="mr-5px">置顶</el-tag>
        <el-tag v-if="topicData.locked" type="info" size="small" class="mr-5px">锁定</el-tag>
        <el-tag v-if="!topicData.pinned && !topicData.locked" type="success" size="small">正常</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="标签">
        <el-tag
          v-for="tag in topicData.tags"
          :key="tag"
          type="info"
          size="small"
          class="mr-5px"
        >
          {{ tag }}
        </el-tag>
        <span v-if="!topicData.tags?.length" class="text-gray-400">无</span>
      </el-descriptions-item>
    </el-descriptions>

    <!-- 帖子内容 -->
    <div class="mt-20px">
      <div class="font-bold mb-10px">帖子内容：</div>
      <div 
        class="p-15px bg-gray-50 rounded-lg max-h-300px overflow-auto"
        v-html="topicData?.content"
      ></div>
    </div>

    <!-- 操作按钮 -->
    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
      <el-button type="warning" @click="handleLock" v-hasPermi="['member:community:update']">
        {{ topicData?.locked ? '解锁' : '锁定' }}
      </el-button>
      <el-button type="danger" @click="handleDelete" v-hasPermi="['member:community:delete']">
        删除帖子
      </el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { formatDate } from '@/utils/formatTime'
import * as CommunityApi from '@/api/member/community'

defineOptions({ name: 'TopicDetailDialog' })

const message = useMessage()
const emit = defineEmits(['success'])

const dialogVisible = ref(false)
const topicData = ref<CommunityApi.CommunityTopicVO | null>(null)

/** 打开弹窗 */
const open = async (tid: number) => {
  dialogVisible.value = true
  topicData.value = null
  
  try {
    topicData.value = await CommunityApi.getTopicDetail(tid)
  } catch (error) {
    message.error('加载帖子详情失败')
  }
}

/** 锁定/解锁 */
const handleLock = async () => {
  if (!topicData.value) return
  
  try {
    await CommunityApi.updateTopicStatus({
      tid: topicData.value.tid,
      locked: !topicData.value.locked
    })
    message.success(topicData.value.locked ? '已解锁' : '已锁定')
    topicData.value.locked = !topicData.value.locked
    emit('success')
  } catch {}
}

/** 删除 */
const handleDelete = async () => {
  if (!topicData.value) return
  
  try {
    await message.delConfirm('确定要删除该帖子吗？')
    await CommunityApi.deleteTopic(topicData.value.tid)
    message.success('删除成功')
    dialogVisible.value = false
    emit('success')
  } catch {}
}

defineExpose({ open })
</script>

