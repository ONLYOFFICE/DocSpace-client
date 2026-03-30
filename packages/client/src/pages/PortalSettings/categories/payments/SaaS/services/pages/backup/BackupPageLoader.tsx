import React from "react";
import { RectangleSkeleton } from "@docspace/ui-kit/components/rectangle";

import styles from "./BackupPageLoader.module.scss";

const BackupPageLoader: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.toggleSection}>
        <RectangleSkeleton width="100%" height="64px" borderRadius="3px" />
      </div>

      <div className={styles.balanceGroup}>
        <RectangleSkeleton width="174px" height="16px" borderRadius="3px" />
        <RectangleSkeleton width="320px" height="16px" borderRadius="3px" />
      </div>

      <div className={styles.cardGroup}>
        <RectangleSkeleton width="174px" height="16px" borderRadius="3px" />
        <RectangleSkeleton width="320px" height="38px" borderRadius="3px" />
      </div>

      <div className={styles.lastTopUpRow}>
        <RectangleSkeleton width="156px" height="22px" borderRadius="3px" />
      </div>

      <div className={styles.filterRow}>
        <RectangleSkeleton width="151px" height="32px" borderRadius="3px" />
        <RectangleSkeleton width="151px" height="32px" borderRadius="3px" />
        <RectangleSkeleton width="151px" height="32px" borderRadius="3px" />
      </div>

      <div className={styles.tableHeaderRow}>
        <RectangleSkeleton width="40px" height="12px" borderRadius="3px" />
        <RectangleSkeleton width="40px" height="12px" borderRadius="3px" />
        <RectangleSkeleton width="40px" height="12px" borderRadius="3px" />
        <RectangleSkeleton width="40px" height="12px" borderRadius="3px" />
      </div>

      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className={styles.tableRow}>
          <RectangleSkeleton width="100%" height="20px" borderRadius="3px" />
        </div>
      ))}
    </div>
  );
};

export default BackupPageLoader;
