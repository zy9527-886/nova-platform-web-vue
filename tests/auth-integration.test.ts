import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { encryptLoginPassword, hashLoginPassword } from '../src/utils/crypto.ts'

test('hashes the login password with SM3 before SM2 encryption', () => {
  assert.equal(
    hashLoginPassword('abc'),
    '66c7f0f462eeedd9d1f2d46bdc10e4e24167c4875cf2f7a2297da02b8f4ba8e0',
  )

  const encrypted = encryptLoginPassword('Aa123456.')
  assert.match(encrypted, /^04[0-9a-f]+$/i)
  assert.notEqual(encrypted, 'Aa123456.')
})

test('uses the nova-auth login, resources, and logout endpoints', () => {
  const api = readFileSync(new URL('../src/api/auth.ts', import.meta.url), 'utf8')
  const request = readFileSync(new URL('../src/utils/request.ts', import.meta.url), 'utf8')
  const store = readFileSync(new URL('../src/stores/user.ts', import.meta.url), 'utf8')
  const menu = readFileSync(new URL('../src/layouts/components/Menu.vue', import.meta.url), 'utf8')

  assert.match(api, /VITE_AUTH_BASE_URL \|\| '\/auth'/)
  assert.match(api, /baseURL: authBaseUrl/)
  assert.match(request, /VITE_API_BASE_URL \|\| '\/api'/)
  assert.match(api, /url: '\/system\/login'/)
  assert.match(api, /url: '\/system\/resources'/)
  assert.match(api, /url: '\/system\/logout'/)
  assert.match(store, /getResources/)
  assert.match(store, /setAuthResources/)
  assert.match(menu, /userStore\.menus/)
})
