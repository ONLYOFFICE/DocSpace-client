import React, { useState, useRef } from "react";

import VerticalDotsReactSvgUrl from "PUBLIC_DIR/images/icons/17/vertical-dots.react.svg?url";

import { IconButton } from "../../icon-button";
import { ContextMenu, TContextMenuRef } from "../../context-menu";

import { IContextButtonProps } from "../Navigation.types";

const ContextButton = ({
  className,
  getData,
  withMenu = true,
  isTrashFolder,
  isMobile,
  id,
  ...rest
}: IContextButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<TContextMenuRef | null>(null);

  const toggle = (e: React.MouseEvent<HTMLDivElement>, open: boolean) => {
    if (open) {
      menuRef.current?.show(e);
    } else {
      menuRef.current?.hide(e);
    }

    setIsOpen(open);
  };

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (withMenu) toggle(e, !isOpen);
  };

  const onHide = () => {
    setIsOpen(false);
  };

  const model = getData();

  return (
    <div ref={ref} className={className} {...rest}>
      <IconButton
        onClick={onClick}
        iconName={VerticalDotsReactSvgUrl}
        id={id}
        size={17}
        isFill
      />
      <ContextMenu
        model={model}
        // containerRef={ref}
        ref={menuRef}
        onHide={onHide}
        scaled={false}
        leftOffset={isTrashFolder ? 188 : isMobile ? 150 : 0}
      />
    </div>
  );
};

export default ContextButton;
