export default {
  common: {
    search: '查詢', reset: '重設', add: '新增', edit: '編輯', delete: '刪除', batchDelete: '批次刪除',
    save: '儲存', cancel: '取消', confirm: '確認', back: '返回', refresh: '重新整理目前頁面',
    success: '操作成功', saveSuccess: '儲存成功', deleteSuccess: '刪除成功', loading: '載入中',
    yes: '是', no: '否', enabled: '啟用', disabled: '停用', show: '顯示', hide: '隱藏',
    total: '共 {total} 筆', input: '請輸入{label}', select: '請選擇{label}', noData: '暫無資料',
    requestFailed: '請求失敗', networkError: '網路連線異常', unauthorized: '未授權，請重新登入',
    forbidden: '拒絕存取', notFound: '找不到請求的資源', serverError: '伺服器錯誤', connectionError: '連線錯誤 {status}',
  },
  layout: {
    styleSettings: '整體風格設定', sidebarStyle: '整體風格設定（側邊欄）', sidebarStyleDesc: '僅影響左側選單區域：亮色 / 暗色',
    light: '亮色', dark: '暗色', language: '介面語言', languageDesc: '切換後立即套用並自動儲存',
    fullscreen: '全螢幕', exitFullscreen: '退出全螢幕', personalSettings: '個人設定', logout: '登出',
    closeOthers: '關閉其他', closeLeft: '關閉左側', closeRight: '關閉右側',
  },
  locale: { zhCN: '简体中文', zhTW: '繁體中文', en: 'English', sw: 'Kiswahili' },
  route: {
    login: '登入', home: '首頁', dashboard: '工作台', system: '系統管理', user: '使用者管理',
    role: '角色管理', menu: '選單管理', settings: '個人設定', redirect: '重新導向', notFound: '404',
  },
  dashboard: {
    kicker: '工作空間概覽', greeting: '早安，{name}，祝你開心每一天！',
    description: '今日概覽 · 保持專注與高效，系統狀態穩定，任務進展順利',
    users: '使用者數', roles: '角色數', menus: '選單數', messages: '訊息數', trend: '較昨日穩步成長',
    quickActions: '快速操作', userAction: '維護使用者帳號、狀態與資訊',
    roleAction: '設定角色與對應權限範圍', menuAction: '管理選單結構與路由顯示',
  },
  login: {
    title: 'Nova 管理平台', subtitle: '歡迎回來，請登入您的帳戶', username: '使用者名稱', password: '密碼',
    usernameRequired: '請輸入使用者名稱', passwordRequired: '請輸入密碼', submit: '登入', submitting: '登入中...',
    success: '登入成功', failed: '登入失敗', remember: '記住我',
  },
}
