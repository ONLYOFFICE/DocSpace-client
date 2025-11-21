// (c) Copyright Ascensio System SIA 2009-2024
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import React from "react";
import isEqual from "lodash/isEqual";

import { ContextMenu, ContextMenuRefType } from "../../context-menu";
import { SectionContextMenuProps } from "../Section.types";

const areEqual = (
  prevProps: SectionContextMenuProps,
  nextProps: SectionContextMenuProps,
) => {
  return isEqual(prevProps, nextProps);
};

const SectionContextMenu = React.memo(
  ({ getContextModel }: SectionContextMenuProps) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const cmRef = React.useRef<ContextMenuRefType>(null);

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
