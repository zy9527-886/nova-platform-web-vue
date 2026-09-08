export default {
  common: {
    search: '查询', reset: '重置', add: '新增', edit: '编辑', delete: '删除', batchDelete: '批量删除',
    save: '保存', cancel: '取消', confirm: '确认', back: '返回', refresh: '刷新当前页',
    success: '操作成功', saveSuccess: '保存成功', deleteSuccess: '删除成功', loading: '加载中',
    yes: '是', no: '否', enabled: '启用', disabled: '禁用', show: '显示', hide: '隐藏',
    total: '共 {total} 条', input: '请输入{label}', select: '请选择{label}', noData: '暂无数据',
    requestFailed: '请求失败', networkError: '网络连接异常', unauthorized: '未授权，请重新登录',
    forbidden: '拒绝访问', notFound: '请求错误，未找到该资源', serverError: '服务器错误', connectionError: '连接错误 {status}',
  },
  layout: {
    styleSettings: '整体风格设置', sidebarStyle: '整体风格设置（侧边栏）', sidebarStyleDesc: '仅影响左侧菜单区域：亮色 / 暗色',
    light: '亮色', dark: '暗色', language: '界面语言', languageDesc: '切换后立即应用并自动保存',
    fullscreen: '全屏', exitFullscreen: '退出全屏', personalSettings: '个人设置', logout: '退出登录',
    closeOthers: '关闭其他', closeLeft: '关闭到左侧', closeRight: '关闭到右侧',
  },
  locale: { zhCN: '简体中文', zhTW: '繁體中文', en: 'English', sw: 'Kiswahili' },
  route: {
    login: '登录', home: '首页', dashboard: '工作台', system: '系统管理', user: '用户管理',
    role: '角色管理', menu: '菜单管理', settings: '个人设置', redirect: '重定向', notFound: '404',
  },
  dashboard: {
    kicker: '工作空间概览', greeting: '早安，{name}，祝你开心每一天！',
    description: '今日概览 · 保持专注与高效，系统状态稳定，任务进展顺利',
    users: '用户数', roles: '角色数', menus: '菜单数', messages: '消息数', trend: '较昨日稳步增长',
    quickActions: '快捷操作', userAction: '维护用户账号、状态与信息',
    roleAction: '配置角色与对应权限范围', menuAction: '管理菜单结构与路由展示',
  },
  login: {
    title: 'Nova 管理平台', subtitle: '欢迎回来，请登录您的账户', username: '用户名', password: '密码',
    usernameRequired: '请输入用户名', passwordRequired: '请输入密码', submit: '登录', submitting: '登录中...',
    success: '登录成功', failed: '登录失败', remember: '记住我',
  },
}
