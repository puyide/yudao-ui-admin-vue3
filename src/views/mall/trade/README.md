# 康复训练器材共享平台 - 前端管理后台

## 功能模块

本目录包含器材共享平台的管理后台页面，整合在商城系统模块下。

```
mall/trade/
├── credit/                    # 信用分管理
│   └── index.vue             # 信用分列表 + 变动记录
│
├── reservation/               # 器材预约管理
│   ├── index.vue             # 预约列表
│   └── ReservationDetailDialog.vue  # 预约详情弹窗
│
├── handover/                  # 交接会话管理
│   ├── index.vue             # 交接列表
│   └── detail/
│       └── index.vue         # 交接详情页
│
├── equipment-menu.sql         # 菜单配置SQL
└── README.md                  # 本文件
```

## 组件名称映射

| 页面 | 组件名称 | 路由路径 | API前缀 |
|-----|---------|---------|--------|
| 信用分管理 | `MemberCredit` | `/mall/trade/credit` | `/member/credit/admin/` |
| 器材预约 | `EquipmentReservation` | `/mall/trade/reservation` | `/product/reservation/` |
| 交接会话 | `EquipmentHandover` | `/mall/trade/handover` | `/trade/handover/admin/` |
| 交接详情 | `EquipmentHandoverDetail` | `/mall/trade/handover/detail/:id` | `/trade/handover/admin/` |

## API接口文件

```
src/api/mall/trade/
├── credit/index.ts      # 信用分API
├── reservation/index.ts # 器材预约API
└── handover/index.ts    # 交接会话API
```

## 菜单配置

### 方式一：通过管理后台配置（推荐）

1. 登录管理后台
2. 进入 **系统管理 → 菜单管理**
3. 按以下结构添加菜单：

**在「交易中心」下添加：**

| 菜单名称 | 路由地址 | 组件路径 | 权限标识 | 图标 |
|---------|---------|---------|---------|------|
| 器材预约 | reservation | mall/trade/reservation/index | product:reservation:query | ep:calendar |
| 交接会话 | handover | mall/trade/handover/index | trade:handover:query | ep:chat-line-round |
| 交接详情 | handover/detail/:id | mall/trade/handover/detail/index | trade:handover:query | （隐藏） |

**在「会员中心」下添加：**

| 菜单名称 | 路由地址 | 组件路径 | 权限标识 | 图标 |
|---------|---------|---------|---------|------|
| 信用分管理 | credit | mall/trade/credit/index | member:credit:query | ep:medal |

### 方式二：执行SQL脚本

```bash
# 查看并修改SQL中的parent_id后执行
cat equipment-menu.sql
```

## 权限说明

| 权限标识 | 说明 |
|---------|------|
| `product:reservation:query` | 查询器材预约 |
| `product:reservation:update` | 修改/取消预约 |
| `trade:handover:query` | 查询交接会话 |
| `trade:handover:update` | 管理员介入/更新状态 |
| `member:credit:query` | 查询信用分 |
| `member:credit:update` | 调整信用分 |

## 功能特性

### 信用分管理
- ✅ 信用分列表（分页、搜索）
- ✅ 信用分变动记录
- ✅ 管理员手动调整信用分
- ✅ 信用等级显示（优秀/良好/一般/较差/很差）

### 器材预约管理
- ✅ 预约列表（状态筛选、时间筛选）
- ✅ 预约详情查看
- ✅ 管理员取消预约
- ✅ 押金状态显示

### 交接会话管理
- ✅ 交接列表（状态筛选、方式筛选）
- ✅ 交接详情（基本信息、快递信息、验收状态）
- ✅ 消息记录查看
- ✅ 评价反馈查看
- ✅ 管理员介入（发送系统消息）

