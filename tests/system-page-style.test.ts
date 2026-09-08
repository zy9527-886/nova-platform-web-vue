import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const readView = (name: 'role' | 'menu') =>
  readFileSync(new URL(`../src/views/system/${name}/index.vue`, import.meta.url), 'utf8')

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
