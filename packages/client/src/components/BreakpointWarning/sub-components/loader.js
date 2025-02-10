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

import { useState, useEffect } from "react";
import styled from "styled-components";
import { RectangleSkeleton } from "@docspace/shared/skeletons";

import { isMobile, mobileMore } from "@docspace/shared/utils";

const StyledLoader = styled.div`
  padding-top: 25px;

  padding-inline-start: 32px;
  display: flex;
  flex-direction: column;

  .img {
    padding-bottom: 32px;
  }

  .loader-description {
    display: flex;
    flex-direction: column;
  }

  .loader-text {
    padding-top: 8px;
  }

  .block {
    display: block;
  }

  @media ${mobileMore} {
    flex-direction: row;
    padding-block: 65px 0;
    padding-inline: 104px 0;

    .loader-description {
      padding-block: 0;
      padding-inline: 32px 0;
    }
  }
`;

const Loader = () => {
  const [viewMobile, setViewMobile] = useState(false);

  const onCheckView = () => {
    if (isMobile()) {
      setViewMobile(true);
    } else {
      setViewMobile(false);
    }
  };

  useEffect(() => {
    onCheckView();
    window.addEventListener("resize", onCheckView);

    return () => window.removeEventListener("resize", onCheckView);
  }, [onCheckView]);

  return (
    <StyledLoader>
      <RectangleSkeleton
        height={viewMobile ? "72px" : "100px"}
        width={viewMobile ? "72px" : "100px"}
        className="img block"
      />

      <div className="loader-description">
        <RectangleSkeleton
          height="44px"
          width={viewMobile ? "287px" : "332px"}
          className="block"
        />
        <RectangleSkeleton
          height={viewMobile ? "32px" : "16px"}
          width={viewMobile ? "287px" : "332px"}
          className="loader-text block"
        />
      </div>
    </StyledLoader>
  );
};

export default Loader;
