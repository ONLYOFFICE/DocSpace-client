import React from "react";
import { ContextMenu } from "@docspace/shared/components/context-menu";
import isEqual from "lodash/isEqual";
import { SectionContextMenuProps } from "../Section.types";

const areEqual = (
  prevProps: SectionContextMenuProps,
  nextProps: SectionContextMenuProps,
) => {
  if (!isEqual(prevProps, nextProps)) return true;
  return false;
};

const SectionContextMenu = React.memo(
  ({ getContextModel }: SectionContextMenuProps) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const cmRef = React.useRef<null | {
      show: (e: React.MouseEvent | MouseEvent) => void;
      hide: (e: React.MouseEvent | MouseEvent) => void;
      toggle: (e: React.MouseEvent | MouseEvent) => boolean;
      getVisible: () => boolean;
    }>(null);

    const onHide = () => {
      setIsOpen(false);
    };

    const onContextMenu = React.useCallback(
      (e: MouseEvent | React.MouseEvent<Element, MouseEvent>) => {
        const bodyElem = document.getElementsByClassName(
          "section-body",
        )[0] as HTMLDivElement;

        const target = e.target as Node;

        if (
          !getContextModel ||
          !getContextModel() ||
          !bodyElem ||
          !bodyElem.contains(target)
        )
          return;

        e.stopPropagation();
        e.preventDefault();

        // if (cmRef.current) cmRef.current.toggle(e);
        if (cmRef.current) {
          if (!isOpen) cmRef?.current?.show(e);
          else cmRef?.current?.hide(e);
          setIsOpen(!isOpen);
        }
      },
      [getContextModel, isOpen],
    );

    React.useEffect(() => {
      document.addEventListener("contextmenu", onContextMenu);

      return () => {
        document.removeEventListener("contextmenu", onContextMenu);
      };
    }, [onContextMenu]);

    return (
      <ContextMenu
        ref={cmRef}
        onHide={onHide}
        getContextModel={getContextModel}
        withBackdrop
        model={[]}
      />
    );
  },
  areEqual,
);
SectionContextMenu.displayName = "SectionContextMenu";

export default SectionContextMenu;
