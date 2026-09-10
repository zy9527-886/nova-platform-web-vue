import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'
import { compileStyle, parse } from '@vue/compiler-sfc'
import { buildUserQuery } from '../src/views/system/shared/data.ts'
import zhCN from '../src/locales/messages/zh-CN.ts'
import zhTW from '../src/locales/messages/zh-TW.ts'
import en from '../src/locales/messages/en.ts'
import sw from '../src/locales/messages/sw.ts'
import { hasPermission } from '../src/utils/permission.ts'

const readView = (name: 'role' | 'menu') =>
  readFileSync(new URL(`../src/views/system/${name}/index.vue`, import.meta.url), 'utf8')

test('system list pages use the shared column display control', () => {
  const component = readFileSync(
    new URL('../src/components/TableColumnSetting/index.vue', import.meta.url),
    'utf8',
  )

  assert.match(component, /SettingOutlined/)
  assert.match(component, /<a-checkbox/)
  assert.doesNotMatch(component, /lockedKeys/)

  for (const path of [
    '../src/views/system/user/index.vue',
    '../src/views/system/role/index.vue',
    '../src/views/system/menu/index.vue',
    '../src/views/system/org/index.vue',
  ]) {
    const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    assert.match(source, /<TableColumnSetting/)
    assert.match(source, /:columns="visibleColumns"/)
    assert.doesNotMatch(source, /locked-keys/)
  }
})

test('user and organization filters share a wider global label style', () => {
  const orgSource = readFileSync(
    new URL('../src/views/system/org/index.vue', import.meta.url),
    'utf8',
  )
  const userSource = readFileSync(
    new URL('../src/views/system/user/index.vue', import.meta.url),
    'utf8',
  )
  const globalStyles = readFileSync(
    new URL('../src/styles/index.scss', import.meta.url),
    'utf8',
  )

  assert.match(userSource, /<a-form class="system-search-form"/)
  assert.match(orgSource, /<a-form class="system-search-form"/)
  assert.equal((orgSource.match(/class="search-field"/g) ?? []).length, 3)
  assert.equal((orgSource.match(/class="filter-control"/g) ?? []).length, 3)
  assert.match(orgSource, /grid-template-columns: repeat\(2, var\(--system-search-field-width\)\)/)
  assert.match(orgSource, /\.search-field:nth-child\(3\)\s*{\s*grid-area: 2 \/ 1/)
  assert.match(orgSource, /grid-area: 2 \/ 3/)
  assert.match(globalStyles, /--system-search-label-width: 96px/)
  assert.match(globalStyles, /--system-search-control-width: 180px/)
  assert.match(globalStyles, /--system-search-field-width: 284px/)
  assert.match(globalStyles, /\.system-search-form \.filter-item \.ant-form-item-label/)
})

test('user query uses an organization-code input and multiple role filters', () => {
  const userView = readFileSync(
    new URL('../src/views/system/user/index.vue', import.meta.url),
    'utf8',
  )
  const userDao = readFileSync(
    new URL('../../nova-platform-cloud/nova-common/nova-common-database/src/main/java/org/nova/platform/system/dao/SysUserDao.java', import.meta.url),
    'utf8',
  )
  const query = buildUserQuery({
    userNm: '',
    orgCd: 'org-a',
    idNo: '',
    realNm: '',
    tel: '',
    roleIds: ['role-a', 'role-b'],
  } as any)

  assert.match(userView, /v-model:value="searchForm\.orgCd"/)
  assert.doesNotMatch(userView, /<a-tree-select/)
  assert.match(userDao, /ORG_CD\.likeRight\(query\.getOrgCd\(\), SysUserDao::hasText\)/)
  assert.doesNotMatch(userDao, /getOrgCds/)
  assert.equal(query.orgCd, 'org-a')
  assert.deepEqual(query.userRolList, [{ rolId: 'role-a' }, { rolId: 'role-b' }])
})

test('user management reuses its form modal for read-only details', () => {
  const source = readFileSync(
    new URL('../src/views/system/user/index.vue', import.meta.url),
    'utf8',
  )
  const modal = readFileSync(
    new URL('../src/views/system/user/components/UserModal.vue', import.meta.url),
    'utf8',
  )

  assert.match(source, /<EyeTwoTone/)
  assert.match(source, /handleDetail/)
  assert.match(source, /:readonly="detailMode"/)
  assert.match(modal, /readonly\?: boolean/)
  assert.match(modal, /:readonly="readonly"/)
  assert.match(modal, /:disabled="readonly"/)
  assert.match(modal, /<a-tree-select/)
  assert.match(modal, /v-model:value="formData\.orgCd"/)
  assert.match(modal, /getOrganizationTree/)
  assert.doesNotMatch(modal, /tree-checkable/)
})

test('role management follows the user-management icon toolbar pattern', () => {
  const source = readView('role')

  assert.match(source, /class="table-toolbar"/)
  assert.doesNotMatch(source, /<template #extra>/)
  assert.match(source, /<PlusCircleTwoTone/)
  assert.match(source, /<MinusCircleTwoTone/)
  assert.match(source, /<EditTwoTone/)
  assert.match(source, /<SafetyCertificateTwoTone/)
  assert.match(source, /<DeleteTwoTone/)
  assert.match(source, /key: 'action', width: 120/)
})

test('menu management uses a left icon toolbar and compact icon actions', () => {
  const source = readView('menu')

  assert.match(source, /class="table-toolbar"/)
  assert.doesNotMatch(source, /<template #extra>/)
  assert.match(source, /<PlusCircleTwoTone/)
  assert.match(source, /<PlusSquareTwoTone/)
  assert.match(source, /<MinusSquareTwoTone/)
  assert.match(source, /<EditTwoTone/)
  assert.match(source, /<DeleteTwoTone/)
  assert.match(source, /key: 'action', width: 120/)
})

test('task management provides the user-style query and delete-only list', () => {
  const taskView = new URL('../src/views/system/task/index.vue', import.meta.url)
  const taskApi = new URL('../src/api/system/task.ts', import.meta.url)

  assert.ok(existsSync(taskView))
  assert.ok(existsSync(taskApi))
})

test('task management uses translations for its UI and route title in every supported locale', () => {
  const taskView = readFileSync(new URL('../src/views/system/task/index.vue', import.meta.url), 'utf8')
  const router = readFileSync(new URL('../src/router/index.ts', import.meta.url), 'utf8')

  for (const locale of [zhCN, zhTW, en, sw]) {
    assert.ok(locale.task)
    assert.equal(typeof locale.route.task, 'string')
    for (const key of ['type', 'name', 'date', 'status', 'table', 'createdAt', 'actions', 'running', 'succeeded', 'failed', 'loadFailed', 'confirmDelete', 'confirmBatchDelete']) {
      assert.equal(typeof locale.task[key], 'string')
    }
  }

  assert.match(taskView, /const \{ t \} = useI18n\(\)/)
  for (const key of ['type', 'name', 'date', 'status', 'table', 'createdAt', 'actions', 'running', 'succeeded', 'failed', 'loadFailed', 'confirmDelete', 'confirmBatchDelete']) {
    assert.match(taskView, new RegExp(`t\\('task\\.${key}'`))
  }
  assert.match(router, /path: 'task',[\s\S]*titleKey: 'route\.task'/)
})

test('system action buttons are gated by resource permission codes', () => {
  assert.equal(hasPermission({ codes: [{ permCd: 'system:user:save' }] }, 'system:user:save'), true)
  assert.equal(hasPermission({ codes: [{ permCd: 'system:user:save' }] }, 'system:user:delete'), false)
  assert.equal(hasPermission(undefined, 'system:user:save'), false)

  for (const [view, codes] of Object.entries({
    user: ['system:user:page', 'system:user:detail', 'system:user:save', 'system:user:delete', 'system:user:deleteBatch'],
    role: ['system:role:save', 'system:role:bindMenus', 'system:role:delete', 'system:role:deleteBatch'],
    menu: ['system:menu:save', 'system:menu:detail', 'system:menu:delete'],
    org: ['system:org:page', 'system:org:detail', 'system:org:save', 'system:org:delete', 'system:org:deleteBatch'],
    task: ['system:task:page', 'system:task:delete', 'system:task:deleteBatch'],
  })) {
    const source = readFileSync(new URL(`../src/views/system/${view}/index.vue`, import.meta.url), 'utf8')
    assert.match(source, /usePermission/)
    for (const code of codes) assert.match(source, new RegExp(`hasPermission\\('${code}'\\)`))
  }
})

test('dark style setting applies to the full application surface', () => {
  const app = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')
  const styles = readFileSync(new URL('../src/styles/index.scss', import.meta.url), 'utf8')
  const tabs = readFileSync(new URL('../src/layouts/components/TabsView.vue', import.meta.url), 'utf8')

  assert.match(app, /appStore\.theme === 'dark' \? antdTheme\.darkAlgorithm : antdTheme\.defaultAlgorithm/)
  assert.match(styles, /&\.theme-dark\s*{[\s\S]*\.layout-content\s*{\s*background: #141414 !important/)
  assert.match(styles, /\.ant-card\s*{\s*background: #1f1f1f !important/)
  const descriptor = parse(tabs, { filename: 'TabsView.vue' }).descriptor
  const style = descriptor.styles.at(-1)
  assert.ok(style)

  const compiled = compileStyle({
    source: style.content,
    filename: 'TabsView.vue',
    id: 'data-v-tabs-test',
    scoped: style.scoped,
    preprocessLang: style.lang,
  })

  assert.equal(compiled.errors.length, 0)
  assert.match(
    compiled.code,
    /body\.theme-dark\s+\.tabs-view\s*\{[^}]*background:\s*#1f1f1f/,
  )
})
