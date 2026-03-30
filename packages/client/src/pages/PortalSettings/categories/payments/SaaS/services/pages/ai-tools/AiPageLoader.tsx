import React from "react";
import { RectangleSkeleton } from "@docspace/ui-kit/components/rectangle";

import styles from "./AiPageLoader.module.scss";

const AiPageLoader: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.toggleSection}>
        <RectangleSkeleton width="100%" height="40px" borderRadius="3px" />
      </div>

      <div className={styles.balanceGroup}>
        <RectangleSkeleton width="120px" height="16px" borderRadius="3px" />
        <RectangleSkeleton width="200px" height="36px" borderRadius="3px" />
        <RectangleSkeleton width="200px" height="32px" borderRadius="3px" />
      </div>

      <div className={styles.lastTopUpRow}>
        <RectangleSkeleton width="180px" height="16px" borderRadius="3px" />
      </div>

      <div className={styles.tabsRow}>
        <RectangleSkeleton width="80px" height="32px" borderRadius="3px" />
        <RectangleSkeleton width="80px" height="32px" borderRadius="3px" />
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

export default AiPageLoader;
