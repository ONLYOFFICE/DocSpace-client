import React, { useState, useRef } from "react";

import PlusReactSvgUrl from "PUBLIC_DIR/images/icons/17/plus.svg?url";

import { IconButton } from "../../icon-button";
import { ContextMenu, TContextMenuRef } from "../../context-menu";
import { IPlusButtonProps } from "../Navigation.types";

const PlusButton = ({
  className,
  getData,
  withMenu = true,
  onPlusClick,
  isFrame,
  id,
  ...rest
}: IPlusButtonProps) => {
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
    else onPlusClick?.();
  };

  const onHide = () => {
    setIsOpen(false);
  };

  const model = getData();

  return (
    <div ref={ref} className={className} {...rest}>
      <IconButton
        onClick={onClick}
        iconName={PlusReactSvgUrl}
        id={id}
        size={17}
        isFill
      />
      <ContextMenu
        model={model}
        containerRef={ref}
        ref={menuRef}
        onHide={onHide}
        scaled={false}
        // directionX="right"
        leftOffset={isFrame ? 190 : 150}
      />
    </div>
  );
};

export default PlusButton;
