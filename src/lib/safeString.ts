export function safeString(val: any, fallback = ''): string {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  if (typeof val === 'boolean') return String(val);
  if (typeof val === 'object') {
    const candidate =
      val.name ||
      val.fullName ||
      val.title ||
      val.company ||
      val.company_name ||
      val.customer_name ||
      val.department_name ||
      val.label ||
      val.text ||
      val.email;

    if (candidate) {
      return typeof candidate === 'string' ? candidate : safeString(candidate, fallback);
    }
    if (val.id !== undefined && val.id !== null) {
      return String(val.id);
    }
    return fallback;
  }
  return fallback;
}
