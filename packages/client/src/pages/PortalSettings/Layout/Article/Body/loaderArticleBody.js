// (c) Copyright Ascensio System SIA 2010-2024
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

import { useEffect, useState } from "react";
import styled from "styled-components";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

import { isDesktop, desktop } from "@docspace/shared/utils";

const StyledLoader = styled.div`
  .loader {
    padding-bottom: 12px;
  }

  .section-name-container {
    padding: 1px 3px 29px;
    display: flex;
    justify-content: flex-start;
  }

  .section-name {
    width: 20px;
    height: 1px;
    line-height: 1px;
    background: #d0d5da;
    margin: 0px;
  }

  @media ${desktop} {
    padding-top: 7px;
    display: flex;
    flex-direction: column;

    .section-name-loader {
      margin-bottom: 12px;
    }

    .loader {
      padding-bottom: 16px;
    }
  }
`;

const LoaderArticleBody = () => {
  const [isTabletView, setIsTabletView] = useState(false);

  const checkInnerWidth = () => {
    const isTabletView = !isDesktop();

    if (isTabletView) {
      setIsTabletView(true);
    } else {
      setIsTabletView(false);
    }
  };

  useEffect(() => {
    checkInnerWidth();
    window.addEventListener("resize", checkInnerWidth);

    return () => window.removeEventListener("resize", checkInnerWidth);
  });

  const height = isTabletView ? "28px" : "20px";
  const width = isTabletView ? "28px" : "210px";

  return (
    <StyledLoader>
      <RectangleSkeleton width={width} height={height} className="loader" />
      <RectangleSkeleton width={width} height={height} className="loader" />
      <RectangleSkeleton width={width} height={height} className="loader" />
      <RectangleSkeleton width={width} height={height} className="loader" />
      <RectangleSkeleton width={width} height={height} className="loader" />
      <RectangleSkeleton width={width} height={height} className="loader" />
      <RectangleSkeleton width={width} height={height} className="loader" />
    </StyledLoader>
  );
};

export default LoaderArticleBody;
