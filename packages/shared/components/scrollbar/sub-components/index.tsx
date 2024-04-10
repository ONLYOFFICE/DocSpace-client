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

/* eslint-disable react/prop-types */
import React from "react";
import { ScrollbarComponent } from "../Scrollbar";
import { CustomScrollbarsVirtualListProps } from "../Scrollbar.types";
import { Scrollbar } from "../custom-scrollbar";

const CustomScrollbars = ({
  onScroll,
  forwardedRef,
  style,
  children,
  className,
}: CustomScrollbarsVirtualListProps) => {
  const refSetter = (
    scrollbarsRef: React.RefObject<Scrollbar>,
    forwardedRefArg: unknown,
  ) => {
    // @ts-expect-error Don`t know how fix it
    const ref = scrollbarsRef?.contentElement ?? null;

    if (typeof forwardedRefArg === "function") {
      forwardedRefArg(ref);
    } else {
      forwardedRefArg = ref;
    }
  };
  return (
    <ScrollbarComponent
      // @ts-expect-error error from custom scrollbar
      ref={(scrollbarsRef: React.RefObject<Scrollbar>) =>
        refSetter(scrollbarsRef, forwardedRef)
      }
      style={{ ...style, overflow: "hidden" }}
      onScroll={onScroll}
      className={className}
    >
      {children}
      <div className="additional-scroll-height" />
    </ScrollbarComponent>
  );
};

const CustomScrollbarsVirtualList = React.forwardRef(
  (props: CustomScrollbarsVirtualListProps, ref) => (
    <CustomScrollbars {...props} forwardedRef={ref} />
  ),
);

export { CustomScrollbarsVirtualList };
