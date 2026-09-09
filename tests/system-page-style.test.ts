import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { buildUserQuery } from '../src/views/system/shared/data.ts'

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
