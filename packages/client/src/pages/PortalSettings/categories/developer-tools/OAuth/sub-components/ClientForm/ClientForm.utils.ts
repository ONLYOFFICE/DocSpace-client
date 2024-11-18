export function isValidUrl(url: string, withoutParams?: boolean) {
  try {
    const newUrl = new URL(url);
    if (withoutParams && (newUrl.search || newUrl.hash)) return false;
    if (newUrl) return true;
    return false;
  } catch (err: unknown) {
    return false;
  }
}
