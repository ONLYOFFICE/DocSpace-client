import React from "react";
import { observer } from "mobx-react";

import CloseCircleReactSvgUrl from "PUBLIC_DIR/images/icons/16/close.circle.react.svg?url";

import { Text } from "../../../../text";
import { IconButton } from "../../../../icon-button";

import { useFilesStore } from "../../../store/filesStore";

import styles from "../ChatInput.module.scss";

const FilePreview = ({
  getIcon,
  displayFileExtension,
}: {
  getIcon: (size: number, fileExst: string) => string;
  displayFileExtension: boolean;
}) => {
  const { file, setFile } = useFilesStore();

  if (!file) return null;

  const icon = getIcon(24, file.fileExst!);

  return (
    <div className={styles.filePreview}>
      <div className={styles.imageWrapper}>
        <img src={icon} alt={file.title} />
      </div>
      <Text fontSize="12px" lineHeight="16px" fontWeight={600}>
        {file.title}
      </Text>
      {displayFileExtension ? (
        <Text
          fontSize="12px"
          lineHeight="16px"
          fontWeight={600}
          color="#A3A9AE"
        >
          {file.fileExst}
        </Text>
      ) : null}
      <IconButton
        className={styles.removeButton}
        iconName={CloseCircleReactSvgUrl}
        isClickable
        size={16}
        onClick={() => setFile()}
      />
    </div>
  );
};

export default observer(FilePreview);
