import React from "react";
import ArrowIcon from "PUBLIC_DIR/images/icons/12/arrow.right.svg";

import { Text } from "../../text";
import { ContextMenu, ContextMenuRefType } from "../../context-menu";

import styles from "../EmptyView.module.scss";
import type { EmptyViewItemProps } from "../EmptyView.types";

export const EmptyViewItem = ({
  description,
  icon,
  title,
  onClick,
  disabled,
  model,
  id,
}: EmptyViewItemProps) => {
  const contextRef = React.useRef<ContextMenuRefType>(null);

  if (disabled) return;

  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!model) return onClick?.(event);

    contextRef.current?.show(event);
  };

  const elementProps = { className: styles.itemIcon };

  return (
    <div
      id={id}
      role="button"
      tabIndex={0}
      aria-label={title}
      onClick={handleClick}
      className={styles.itemWrapper}
    >
      <ContextMenu ref={contextRef} model={model ?? []} />
      {React.cloneElement(icon, elementProps)}
      <div className={styles.itemBody}>
        <Text
          as="h4"
          fontWeight="600"
          lineHeight="20px"
          className={styles.itemHeader}
          noSelect
        >
          {title}
        </Text>
        <Text as="p" fontSize="12px" className={styles.itemSubheading} noSelect>
          {description}
        </Text>
      </div>
      <ArrowIcon className={styles.arrowIcon} />
    </div>
  );
};
