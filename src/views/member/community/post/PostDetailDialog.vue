<template>
  <Dialog v-model="dialogVisible" title="回帖详情" width="700px">
    <el-descriptions :column="2" border v-if="postData">
      <el-descriptions-item label="回帖ID">{{ postData.pid }}</el-descriptions-item>
      <el-descriptions-item label="楼层">第 {{ postData.index }} 楼</el-descriptions-item>
      <el-descriptions-item label="所属帖子" :span="2">
        <el-link type="primary" @click="goToTopic">
          {{ postData.topicTitle || `帖子#${postData.tid}` }}
        </el-link>
      </el-descriptions-item>
      <el-descriptions-item label="作者">
        <div class="flex items-center">
          <el-avatar :size="24" :src="postData.author?.avatar" class="mr-5px">
            {{ postData.author?.nickname?.charAt(0) }}
          </el-avatar>
          <span>{{ postData.author?.nickname || '匿名' }}</span>
          <span v-if="postData.author?.mobile" class="ml-10px text-gray-400">
            ({{ postData.author.mobile }})
          </span>
        </div>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ formatDate(postData.createTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="点赞数">{{ postData.likeCount }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag v-if="postData.deleted" type="danger" size="small">已删除</el-tag>
        <el-tag v-else type="success" size="small">正常</el-tag>
      </el-descriptions-item>
    </el-descriptions>

    <!-- 回帖内容 -->
    <div class="mt-20px">
      <div class="font-bold mb-10px">回复内容：</div>
      <div 
        class="p-15px bg-gray-50 rounded-lg max-h-300px overflow-auto"
        v-html="postData?.content"
      ></div>
    </div>

    <!-- 操作按钮 -->
    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
      <el-button type="danger" @click="handleDelete" v-hasPermi="['member:community:delete']">
        删除回帖
      </el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { formatDate } from '@/utils/formatTime'
import * as CommunityApi from '@/api/member/community'

defineOptions({ name: 'PostDetailDialog' })

const router = useRouter()
const message = useMessage()
const emit = defineEmits(['success'])

const dialogVisible = ref(false)
const postData = ref<CommunityApi.CommunityPostVO | null>(null)

/** 打开弹窗 */
const open = (row: CommunityApi.CommunityPostVO) => {
  dialogVisible.value = true
  postData.value = row
}

/** 跳转到帖子 */
const goToTopic = () => {
  if (!postData.value) return
  dialogVisible.value = false
  router.push({ path: '/member/community/topic', query: { tid: postData.value.tid } })
}

/** 删除 */
const handleDelete = async () => {
  if (!postData.value) return
  
  try {
    await message.delConfirm('确定要删除该回帖吗？')
    await CommunityApi.deletePost(postData.value.pid)
    message.success('删除成功')
    dialogVisible.value = false
    emit('success')
  } catch {}
}

defineExpose({ open })
</script>

