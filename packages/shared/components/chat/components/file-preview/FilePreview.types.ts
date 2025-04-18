import { TSelectorItem } from "../../../selector";

export type TFilePreviewProps = {
  files: TSelectorItem[];
  displayFileExtension: boolean;

  withRemoveFile?: boolean;

  getIcon: (size: number, fileExst: string) => string;
};
