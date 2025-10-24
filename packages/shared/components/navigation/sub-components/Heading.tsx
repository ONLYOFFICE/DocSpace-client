import React from "react";
import { HeadingWithTooltip as BaseHeading } from "../../heading";
import styles from "../Navigation.module.scss";

type HeadingProps = {
  title?: string;
  truncate?: boolean;
  isRootFolderTitle?: boolean;
  children?: React.ReactNode;
};

const Heading = ({
  title,
  truncate,
  isRootFolderTitle,
  children,
}: HeadingProps) => {
  return (
    <BaseHeading
      className={`${styles.heading} ${isRootFolderTitle ? styles.rootFolderTitle : ""}`}
      title={title}
      truncate={truncate}
    >
      {children}
    </BaseHeading>
  );
};

export default Heading;
