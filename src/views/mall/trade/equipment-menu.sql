-- =============================================
-- 康复训练器材共享平台 - 管理后台菜单配置
-- 位置：商城系统模块
-- 
-- 注意：完整版SQL请查看 ruoyi-vue-pro/sql/postgresql/equipment_menu.sql
-- =============================================

-- =============================================
-- 手动配置指南（推荐）
-- =============================================
-- 
-- 在管理后台 -> 系统管理 -> 菜单管理 中添加以下菜单：
-- 
-- ┌─────────────────────────────────────────────────────────────┐
-- │                     商城系统（已存在）                        │
-- │  ├── 交易中心（已存在）                                      │
-- │  │   ├── 器材预约 ⭐ 新增                                    │
-- │  │   │   路由: reservation                                  │
-- │  │   │   组件: mall/trade/reservation/index                 │
-- │  │   │   组件名: EquipmentReservation                       │
-- │  │   │   权限: product:reservation:query                    │
-- │  │   │   图标: ep:calendar                                  │
-- │  │   │                                                      │
-- │  │   ├── 交接会话 ⭐ 新增                                    │
-- │  │   │   路由: handover                                     │
-- │  │   │   组件: mall/trade/handover/index                    │
-- │  │   │   组件名: EquipmentHandover                          │
-- │  │   │   权限: trade:handover:query                         │
-- │  │   │   图标: ep:chat-line-round                           │
-- │  │   │                                                      │
-- │  │   └── 交接详情 ⭐ 新增（隐藏菜单）                         │
-- │  │       路由: handover/detail/:id                          │
-- │  │       组件: mall/trade/handover/detail/index             │
-- │  │       组件名: EquipmentHandoverDetail                    │
-- │  │       显示: 否                                           │
-- │  │                                                          │
-- │  ├── 会员中心（已存在）                                      │
-- │  │   └── 信用分管理 ⭐ 新增                                  │
-- │  │       路由: credit                                       │
-- │  │       组件: mall/trade/credit/index                      │
-- │  │       组件名: MemberCredit                               │
-- │  │       权限: member:credit:query                          │
-- │  │       图标: ep:medal                                     │
-- └─────────────────────────────────────────────────────────────┘

-- =============================================
-- PostgreSQL SQL 脚本
-- =============================================

-- 步骤1：查询父级菜单ID
SELECT id, name FROM system_menu 
WHERE name IN ('交易中心', '会员中心') 
AND deleted = FALSE;

-- 步骤2：替换下面的 parent_id 后执行

-- 器材预约（parent_id 改为交易中心的ID）
INSERT INTO system_menu (
    name, permission, type, sort, parent_id, path, icon, 
    component, component_name, status, visible, keep_alive, 
    always_show, creator, create_time, updater, update_time, deleted
) VALUES (
    '器材预约', 'product:reservation:query', 2, 20, 
    2015, -- 请替换为实际的交易中心菜单ID
    'reservation', 'ep:calendar', 
    'mall/trade/reservation/index', 'EquipmentReservation', 
    0, TRUE, TRUE, TRUE, 
    'admin', NOW(), 'admin', NOW(), FALSE
) ON CONFLICT DO NOTHING;

-- 交接会话
INSERT INTO system_menu (
    name, permission, type, sort, parent_id, path, icon, 
    component, component_name, status, visible, keep_alive, 
    always_show, creator, create_time, updater, update_time, deleted
) VALUES (
    '交接会话', 'trade:handover:query', 2, 21, 
    2015, -- 请替换为实际的交易中心菜单ID
    'handover', 'ep:chat-line-round', 
    'mall/trade/handover/index', 'EquipmentHandover', 
    0, TRUE, TRUE, TRUE, 
    'admin', NOW(), 'admin', NOW(), FALSE
) ON CONFLICT DO NOTHING;

-- 交接详情（隐藏）
INSERT INTO system_menu (
    name, permission, type, sort, parent_id, path, icon, 
    component, component_name, status, visible, keep_alive, 
    always_show, creator, create_time, updater, update_time, deleted
) VALUES (
    '交接详情', 'trade:handover:query', 2, 22, 
    2015, -- 请替换为实际的交易中心菜单ID
    'handover/detail/:id', '', 
    'mall/trade/handover/detail/index', 'EquipmentHandoverDetail', 
    0, FALSE, TRUE, TRUE, 
    'admin', NOW(), 'admin', NOW(), FALSE
) ON CONFLICT DO NOTHING;

-- 信用分管理（parent_id 改为会员中心的ID）
INSERT INTO system_menu (
    name, permission, type, sort, parent_id, path, icon, 
    component, component_name, status, visible, keep_alive, 
    always_show, creator, create_time, updater, update_time, deleted
) VALUES (
    '信用分管理', 'member:credit:query', 2, 10, 
    2010, -- 请替换为实际的会员中心菜单ID
    'credit', 'ep:medal', 
    'mall/trade/credit/index', 'MemberCredit', 
    0, TRUE, TRUE, TRUE, 
    'admin', NOW(), 'admin', NOW(), FALSE
) ON CONFLICT DO NOTHING;
