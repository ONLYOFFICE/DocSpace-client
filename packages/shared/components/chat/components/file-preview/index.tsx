import React from "react";
import { observer } from "mobx-react";

import CloseCircleReactSvgUrl from "PUBLIC_DIR/images/icons/16/close.circle.react.svg?url";

import { Text } from "../../../text";
import { IconButton } from "../../../icon-button";
import { TSelectorItem } from "../../../selector";

import { useFilesStore } from "../../store/filesStore";

import styles from "./FilePreview.module.scss";

const FilePreview = ({
  files,
  displayFileExtension,

  withRemoveFile,

  getIcon,
}: {
  files: TSelectorItem[];
  displayFileExtension: boolean;

  withRemoveFile?: boolean;

  getIcon: (size: number, fileExst: string) => string;
}) => {
  const { removeFile, setWrapperHeight } = useFilesStore();

  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!withRemoveFile) return;
    if (wrapperRef.current) {
      setWrapperHeight(wrapperRef.current.clientHeight);
    }
  }, [files.length, setWrapperHeight, withRemoveFile]);

  return (
    <div className={styles.filePreviewContainer} ref={wrapperRef}>
      {files.length === 0
        ? null
        : files.map((file) => {
            const icon = getIcon(24, file.fileExst!);

            return (
              <div key={file.id} className={styles.filePreview}>
                <div className={styles.imageWrapper}>
                  <img src={icon} alt={file.label} />
                </div>
                <Text
                  fontSize="12px"
                  lineHeight="16px"
                  fontWeight={600}
                  truncate
                >
                  {file.label}
                </Text>
                {displayFileExtension ? (
                  <Text
                    fontSize="12px"
                    lineHeight="16px"
                    fontWeight={600}
                    className={styles.fileExtension}
                  >
                    {file.fileExst}
                  </Text>
                ) : null}
                {withRemoveFile ? (
                  <IconButton
                    className={styles.removeButton}
                    iconName={CloseCircleReactSvgUrl}
                    isClickable
                    size={16}
                    onClick={() => removeFile(file)}
                  />
                ) : null}
              </div>
            );
          })}
    </div>
  );
};

export default observer(FilePreview);
