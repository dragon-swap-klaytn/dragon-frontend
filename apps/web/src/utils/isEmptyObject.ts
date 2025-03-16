export default function isEmptyObject(obj: any) {
  return typeof obj === 'object' && !Array.isArray(obj) && Object.keys(obj).length === 0
}
