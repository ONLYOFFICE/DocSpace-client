export function isValidUrl(url: string) {
  try {
    const newUrl = new URL(url);
    if (newUrl) return true;
    return false;
  } catch (err) {
    return false;
  }
}
