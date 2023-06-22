import type { Current, File, Folder } from "../types";

export interface IDashboard {
  files: File[];
  folders: Folder[];
  current: Current;
  pathParts: number[];
  startIndex: number;
  count: number;
  total: number;
  new: number;
}
