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

import { Box } from "../../components/box";
import { RectangleSkeleton } from "../rectangle";

const UserSessionsPanelLoader = () => {
  return (
    <Box>
      <Box
        className="last-session-block"
        marginProp="0 0 20px"
        paddingProp="20px 0 0"
      >
        <Box
          displayProp="flex"
          alignItems="center"
          gapProp="16px"
          marginProp="0 0 20px"
        >
          <RectangleSkeleton width="80px" height="80px" borderRadius="50%" />

          <Box displayProp="flex" flexDirection="column" gapProp="5px">
            <RectangleSkeleton width="140px" height="16px" borderRadius="3px" />
            <RectangleSkeleton width="73px" height="13px" borderRadius="3px" />
          </Box>
        </Box>

        <Box marginProp="0 0 12px">
          <RectangleSkeleton width="80px" height="16px" borderRadius="3px" />
        </Box>

        <Box displayProp="flex" flexDirection="column">
          {Array.from({ length: 6 }).map((_, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <Box key={i} displayProp="flex" gapProp="24px" heightProp="28px">
              <RectangleSkeleton
                width="72px"
                height="13px"
                borderRadius="3px"
              />
              <RectangleSkeleton
                width="74px"
                height="13px"
                borderRadius="3px"
              />
            </Box>
          ))}
        </Box>
      </Box>
      <Box className="all-sessions-block">
        <Box marginProp="0 0 12px">
          <RectangleSkeleton width="80px" height="16px" borderRadius="3px" />
        </Box>
        <Box
          marginProp="0 0 20px"
          displayProp="flex"
          flexDirection="column"
          justifyContent="center"
          gapProp="5px"
          heightProp="40px"
        >
          <RectangleSkeleton width="100%" height="13px" borderRadius="3px" />
          <RectangleSkeleton width="100%" height="13px" borderRadius="3px" />
        </Box>
        <Box marginProp="0 0 12px">
          <RectangleSkeleton width="100%" height="32px" borderRadius="3px" />
        </Box>
      </Box>

      <Box widthProp="100%">
        {Array.from({ length: 4 }).map((_, i) => {
          return (
            <Box
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              heightProp="58px"
              displayProp="flex"
              alignItems="center"
            >
              <Box
                displayProp="flex"
                flexDirection="column"
                gapProp="5px"
                flexProp="1 0 0"
              >
                <RectangleSkeleton
                  width="300px"
                  height="14px"
                  borderRadius="3px"
                />
                <RectangleSkeleton
                  width="300px"
                  height="14px"
                  borderRadius="3px"
                />
              </Box>
              <RectangleSkeleton
                width="20px"
                height="20px"
                borderRadius="50%"
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default UserSessionsPanelLoader;
