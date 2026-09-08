import assert from 'node:assert/strict'
import test from 'node:test'

import { DEFAULT_LOCALE, SUPPORTED_LOCALES, getDayjsLocale, normalizeLocale } from '../src/locales/types.ts'
import zhCN from '../src/locales/messages/zh-CN.ts'
import zhTW from '../src/locales/messages/zh-TW.ts'
import en from '../src/locales/messages/en.ts'
import sw from '../src/locales/messages/sw.ts'
import { resolveTitleKey } from '../src/router/title.ts'

const messageKeys = (value: Record<string, unknown>, prefix = ''): string[] =>
  Object.entries(value).flatMap(([key, child]) => {
    const path = prefix ? `${prefix}.${key}` : key
    return child && typeof child === 'object'
      ? messageKeys(child as Record<string, unknown>, path)
      : [path]
  }).sort()

test('supports the four requested locales and normalizes browser locale values', () => {
  assert.deepEqual(SUPPORTED_LOCALES, ['zh-CN', 'zh-TW', 'en', 'sw'])
  assert.equal(DEFAULT_LOCALE, 'zh-CN')
  assert.equal(normalizeLocale('zh-TW-HK'), 'zh-TW')
  assert.equal(normalizeLocale('en-KE'), 'en')
  assert.equal(normalizeLocale('sw-KE'), 'sw')
  assert.equal(normalizeLocale('fr-FR'), 'zh-CN')
})

test('all locale catalogs expose the same message keys', () => {
  const expected = messageKeys(zhCN)
  assert.deepEqual(messageKeys(zhTW), expected)
  assert.deepEqual(messageKeys(en), expected)
  assert.deepEqual(messageKeys(sw), expected)
})

test('maps application locales to Ant Design and Day.js locales', () => {
  assert.equal(getDayjsLocale('zh-CN'), 'zh-cn')
  assert.equal(getDayjsLocale('zh-TW'), 'zh-tw')
  assert.equal(getDayjsLocale('en'), 'en')
  assert.equal(getDayjsLocale('sw'), 'sw')
})

test('route titles prefer translation keys and preserve legacy fallback', () => {
  assert.equal(resolveTitleKey({ titleKey: 'route.user', title: '用户管理' }), 'route.user')
  assert.equal(resolveTitleKey({ title: '旧页签' }), undefined)
})
