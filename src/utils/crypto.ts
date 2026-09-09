import smCrypto from 'sm-crypto'

const defaultSm2PublicKey =
  '046d96396327a558afddde5ab9e6562025923bd6491958a14f451bb5d8a986b5c10ed36ee2891ee969cef686aefe8b925975bf2cfcd6c398618a8b02ca454daf56'
const sm2PublicKey =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_SM2_PUBLIC_KEY ||
  defaultSm2PublicKey

export const hashLoginPassword = (password: string) => smCrypto.sm3(password)

export const encryptLoginPassword = (password: string) =>
  `04${smCrypto.sm2.doEncrypt(hashLoginPassword(password), sm2PublicKey, 1)}`
