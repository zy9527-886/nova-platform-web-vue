declare module 'sm-crypto' {
  const smCrypto: {
    sm2: {
    doEncrypt(message: string, publicKey: string, cipherMode?: 0 | 1): string
    }
    sm3: (message: string) => string
  }
  export default smCrypto
}
