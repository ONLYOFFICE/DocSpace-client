import React from "react";
import { observer } from "mobx-react";

import { RectangleSkeleton } from "../../../../skeletons";

import { Scrollbar } from "../../../scrollbar";

import { useFilesStore } from "../../store/filesStore";

import styles from "./FilePreview.module.scss";

const FilePreview = () => {
  const { files } = useFilesStore();

  if (!files.length) return null;

  return (
    <Scrollbar style={{ height: "78px" }}>
      <div className={styles.filePreviewContainer}>
        {files.map((file) => {
          if (file.loading)
            return (
              <RectangleSkeleton
                key={file.id}
                width="128px"
                height="78px"
                borderRadius="6px"
              />
            );

          return (
            <img
              className={styles.filePreviewItem}
              key={file.id}
              src={URL.createObjectURL(file.file)}
              alt={file.id}
            />
          );
        })}
      </div>
    </Scrollbar>
  );
};

export default observer(FilePreview);
