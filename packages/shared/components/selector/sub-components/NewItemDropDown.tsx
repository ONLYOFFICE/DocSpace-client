// (c) Copyright Ascensio System SIA 2009-2025
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
import { classNames, isMobile as isMobileUtils } from "../../../utils";
import { Portal } from "../../portal";
import { Backdrop } from "../../backdrop";

import { Scrollbar } from "../../scrollbar";

import styles from "../Selector.module.scss";
import { NewItemDropDownProps } from "../Selector.types";
import { zIndex as z } from "../../../themes/zIndex";

export const DROPDOWN_CLASS_NAME = "selector-create-new-dropdown";

const DROPDOWN_CONTAINER_WITH_PADDING = 560;
const PADDING = 80;

const NewItemDropDown = ({
  dropDownItems,
  isEmpty,
  onCloseDropDown,
  listHeight,
}: NewItemDropDownProps) => {
  const [isMobile, setIsMobile] = React.useState(
    isMobileUtils(window.innerWidth),
  );

  React.useEffect(() => {
    window.addEventListener("mouseup", onCloseDropDown);

    return () => {
      window.removeEventListener("mouseup", onCloseDropDown);
    };
  }, [onCloseDropDown]);

  React.useEffect(() => {
    const onResize = () => {
      if (isMobileUtils(window.innerWidth)) return setIsMobile(true);

      setIsMobile(false);
    };

    onResize();

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const dropDown =
    dropDownItems.length > 0 ? (
      <div
        className={classNames(
          styles.createDropDown,
          { [styles.isEmpty]: isEmpty },
          DROPDOWN_CLASS_NAME,
        )}
      >
        {listHeight && listHeight < DROPDOWN_CONTAINER_WITH_PADDING ? (
          <Scrollbar style={{ height: listHeight - PADDING }}>
            {dropDownItems.map((item) => item)}
          </Scrollbar>
        ) : (
          dropDownItems.map((item) => item)
        )}
      </div>
    ) : null;

  const portal =
    dropDownItems.length > 0 ? (
      <Portal
        visible
        element={
          <>
            <Backdrop
              visible
              onClick={() => onCloseDropDown()}
              withBackground
              withoutBlur={false}
              isAside
              zIndex={z.backdrop}
            />
            <div
              className={classNames(
                styles.createDropDown,
                { [styles.isEmpty]: isEmpty },
                DROPDOWN_CLASS_NAME,
              )}
            >
              {dropDownItems.map((item) => item)}
            </div>
          </>
        }
      />
    ) : null;

  return isMobile ? portal : dropDown;
};

export default NewItemDropDown;
