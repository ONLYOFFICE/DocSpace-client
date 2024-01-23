export async function dataUrlToFile(
  url: string,
  filename: string,
  mimeType: string,
) {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  return new File([buf], filename, { type: mimeType });
}
