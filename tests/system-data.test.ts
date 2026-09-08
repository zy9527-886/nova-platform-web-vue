import assert from 'node:assert/strict'
import test from 'node:test'

import {
  buildMenuTree,
  collectDescendantIds,
  pageAfterDelete,
  toUserRoleList,
} from '../src/views/system/shared/data.ts'

test('buildMenuTree nests backend menu rows and keeps orphan rows visible', () => {
  const tree = buildMenuTree([
    { menuId: '2', menuNm: 'child', prentId: '1', sort: 20, typ: '1', isDsp: 1 },
    { menuId: '1', menuNm: 'root', prentId: '0', sort: 10, typ: '1', isDsp: 1 },
    { menuId: '3', menuNm: 'orphan', prentId: 'missing', sort: 30, typ: '1', isDsp: 1 },
  ])

  assert.deepEqual(tree.map((item) => item.menuId), ['1', '3'])
  assert.equal(tree[0].children?.[0].menuId, '2')
})

test('collectDescendantIds excludes the edited menu and every descendant', () => {
  const tree = buildMenuTree([
    { menuId: '1', menuNm: 'root', prentId: '0', sort: 1, typ: '1', isDsp: 1 },
    { menuId: '2', menuNm: 'child', prentId: '1', sort: 2, typ: '1', isDsp: 1 },
    { menuId: '3', menuNm: 'leaf', prentId: '2', sort: 3, typ: '0', isDsp: 0 },
  ])

  assert.deepEqual([...collectDescendantIds(tree, '1')].sort(), ['1', '2', '3'])
})

test('pageAfterDelete moves back only when the current page becomes empty', () => {
  assert.equal(pageAfterDelete(3, 2, 2), 2)
  assert.equal(pageAfterDelete(3, 3, 2), 3)
  assert.equal(pageAfterDelete(1, 1, 1), 1)
})

test('toUserRoleList preserves snowflake ids as strings and removes duplicates', () => {
  assert.deepEqual(toUserRoleList(['9007199254740993', '22', '22']), [
    { rolId: '9007199254740993' },
    { rolId: '22' },
  ])
})
