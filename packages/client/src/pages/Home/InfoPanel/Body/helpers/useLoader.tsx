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

export const useLoader = ({ isFirstLoading }: { isFirstLoading: boolean }) => {
  const [showLoading, setShowLoading] = React.useState(false);

  const loaderRefTimeout = React.useRef<NodeJS.Timeout>(null);
  const startShowLoader = React.useRef<Date | null>(new Date());

  React.useEffect(() => {
    if (isFirstLoading) {
      loaderRefTimeout.current = setTimeout(() => {
        setShowLoading(true);
        startShowLoader.current = new Date();
        loaderRefTimeout.current = null;
      }, 500);
    } else {
      const currentTimestamp = new Date().getTime();
      const startTime =
        startShowLoader.current?.getTime() || currentTimestamp - 500;

      if (loaderRefTimeout.current) {
        clearTimeout(loaderRefTimeout.current);
        loaderRefTimeout.current = null;
      }

      if (currentTimestamp - startTime >= 500) {
        setShowLoading(false);
        startShowLoader.current = null;
      } else {
        setTimeout(
          () => {
            setShowLoading(false);
            startShowLoader.current = null;
          },
          500 - (currentTimestamp - startTime),
        );
      }
    }
  }, [isFirstLoading]);

  return { showLoading };
};
