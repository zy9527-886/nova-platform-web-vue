import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  DEFAULT_PRIMARY_COLOR,
  PRIMARY_COLORS,
  normalizePrimaryColor,
} from '../src/theme/colors.ts'

test('provides the eight Ant Design Pro preset theme colors', () => {
  assert.deepEqual(
    PRIMARY_COLORS.map(item => item.value),
    ['#1677ff', '#f5222d', '#fa541c', '#faad14', '#13c2c2', '#52c41a', '#2f54eb', '#722ed1'],
  )
})

test('normalizes persisted theme colors to a supported preset', () => {
  assert.equal(normalizePrimaryColor('#722ED1'), '#722ed1')
  assert.equal(normalizePrimaryColor('invalid'), DEFAULT_PRIMARY_COLOR)
  assert.equal(normalizePrimaryColor(undefined), DEFAULT_PRIMARY_COLOR)
})

test('binds the selected theme color to the drawer and Ant Design provider', () => {
  const drawer = readFileSync(
    new URL('../src/layouts/components/ThemeDrawer.vue', import.meta.url),
    'utf8',
  )
  const app = readFileSync(new URL('../src/App.vue', import.meta.url), 'utf8')

  assert.match(drawer, /class="color-options"/)
  assert.match(drawer, /appStore\.setPrimaryColor/)
  assert.match(app, /colorPrimary: appStore\.primaryColor/)
})
