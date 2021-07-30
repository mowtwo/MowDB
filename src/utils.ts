export function fieldLikeRegValdate(reg) {
  const headValid = /^\%([^\%]+)$/
  const tailValid = /^([^\%]+)\%$/
  const midValid = /^\%([^\%]+)\%$/
  if (headValid.test(reg)) {
    const [, pattenText] = headValid.exec(reg)
    return (val: string) => {
      return val.indexOf(pattenText) == 0
    }
  }
  if (tailValid.test(reg)) {
    const [, pattenText] = tailValid.exec(reg)
    const subLen = pattenText.length
    return (val: string) => {
      return val.includes(pattenText, val.length - subLen)
    }
  }
  if (midValid.test(reg)) {
    const [, pattenText] = midValid.exec(reg)
    return (val: string) => {
      return val.indexOf(pattenText) >= 0
    }
  }

  return null
}