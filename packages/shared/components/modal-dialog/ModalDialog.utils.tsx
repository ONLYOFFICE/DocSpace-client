import React, { ReactElement } from "react";

import { isMobile, isTablet, isTouchDevice } from "../../utils";
import { ModalDialogType } from "./ModalDialog.enums";
import { ModalDialogTypeDetailed } from "./ModalDialog.types";

let y1: null | number = null;

export const handleTouchStart = (e: TouchEvent) => {
  if (!(isTouchDevice && isMobile())) {
    y1 = null;
    return false;
  }

  const firstTouch = e.touches[0];

  const target = firstTouch.target as HTMLElement;

  if (target.id !== "modal-header-swipe") {
    y1 = null;
    return false;
  }

  y1 = firstTouch.clientY;
};

export const handleTouchMove = (e: TouchEvent, onClose?: () => void) => {
  if (!y1) return 0;

  let y2 = e.touches[0].clientY;
  if (y2 - y1 > 120) onClose?.();

  return y1 - y2;
};

const getCurrentSizeName = () => {
  if (isMobile()) return "mobile";

  if (isTablet()) return "tablet";

  return "desktop";
};

export const getCurrentDisplayType = (
  propsDisplayType: ModalDialogType,
  propsDisplayTypeDetailed?: ModalDialogTypeDetailed,
) => {
  if (!propsDisplayTypeDetailed) return propsDisplayType;

  const detailedDisplayType = propsDisplayTypeDetailed[getCurrentSizeName()];

  if (detailedDisplayType) return detailedDisplayType;
  return propsDisplayType;
};

export const parseChildren = (
  children: React.ReactElement[] | React.ReactElement,
  headerDisplayName: string,
  bodyDisplayName: string,
  footerDisplayName: string,
  containerDisplayName: string,
) => {
  let header = null;
  let body = null;
  let footer = null;
  let container = null;

  if (children) {
    React.Children.map(children, (child: React.ReactElement) => {
      const type:
        | React.JSXElementConstructor<{
            name?: string;
            displayName?: string;
          }>
        | string = child.type;

      const childType =
        child &&
        type &&
        typeof type !== "string" &&
        // @ts-expect-error display name can be exist
        (type.displayName || type.name);

      switch (childType) {
        case headerDisplayName:
          header = child;
          break;
        case bodyDisplayName:
          body = child;
          break;
        case footerDisplayName:
          footer = child;
          break;
        case containerDisplayName:
          container = child;
          break;
        default:
          break;
      }
    });
  }

  return [header, body, footer, container];
};
