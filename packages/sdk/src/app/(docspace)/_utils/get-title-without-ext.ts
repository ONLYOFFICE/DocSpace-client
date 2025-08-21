export default function getTitleWithoutExt(title: string, fileExst: string) {
  return title.replace(fileExst, "");
}
