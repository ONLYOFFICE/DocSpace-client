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
import styled, { css } from "styled-components";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { desktop, mobileMore } from "@docspace/shared/utils";

const tabletStyles = css`
  .header {
    display: ${(props) => !props.dnsSettings && "block"};
    width: ${(props) =>
      props.lngTZSettings
        ? "283px"
        : props.welcomePage
          ? "201px"
          : props.portalRenaming
            ? "150px"
            : 0};
    padding-bottom: 16px;
  }

  .description {
    display: none;
  }

  .title {
    display: block;
    width: ${(props) =>
      props.lngTZSettings
        ? "61px"
        : props.welcomePage
          ? "28px"
          : props.portalRenaming
            ? "109px"
            : 0};
    padding-bottom: 4px;
  }

  .combo-box {
    display: block;
    width: 350px;
  }

  .field-container {
    display: block;
    width: 350px;
  }

  .save-cancel-buttons {
    display: block;
    position: static;
    width: ${(props) => (props.welcomePage ? "274px" : "197px")};
    padding: 8px 0 0;
  }

  .dns-description {
    width: 122px;
    padding-bottom: 12px;
  }

  .dns-field {
    width: 350px;
    padding-bottom: 12px;
  }
`;

const StyledLoader = styled.div`
  .header {
    display: none;
  }

  .description {
    width: 100%;
    padding-bottom: 12px;
  }

  .title {
    width: ${(props) => (props.portalRenaming ? "109px" : "61px")};
  }

  .title-long {
    display: block;
    width: 64px;
    padding-bottom: 4px;
  }

  .combo-box {
    display: block;
    width: 100%;
    padding-bottom: 16px;
  }

  .field-container {
    width: 100%;
    padding-bottom: 12px;
  }

  .save-cancel-buttons {
    display: block;
    position: absolute;
    bottom: 0;
    width: calc(100% - 32px);
    inset-inline-start: 0;
    padding-block: 0 16px;
    padding-inline: 16px 0;
  }

  .flex {
    display: flex;
    align-items: center;
    padding-bottom: 8px;
  }

  .dns-description {
    padding-bottom: 8px;
  }

  .padding-right {
    padding-inline-end: 8px;
  }

  .dns-field {
    height: 32px;
  }

  @media ${mobileMore} {
    ${tabletStyles}
  }

  @media ${desktop} {
    .save-cancel-buttons {
      width: ${(props) => (props.welcomePage ? "264px" : "192px")};
    }
  }
`;

const LoaderCustomization = ({
  lngTZSettings,
  portalRenaming,
  welcomePage,
  dnsSettings,
}) => {
  const [isMobileView, setIsMobileView] = useState(false);
  const [isDesktopView, setIsDesktopView] = useState(false);

  const checkInnerWidth = () => {
    if (window.innerWidth < 600) {
      setIsMobileView(true);
    } else {
      setIsMobileView(false);
    }

    if (window.innerWidth <= 1024) {
      setIsDesktopView(true);
    } else {
      setIsDesktopView(false);
    }
  };

  useEffect(() => {
    checkInnerWidth();
    window.addEventListener("resize", checkInnerWidth);

    return () => window.removeEventListener("resize", checkInnerWidth);
  });

  const heightSaveCancelButtons = isDesktopView ? "40px" : "32px";
  const heightDnsDescription = isMobileView ? "40px" : "22px";

  return (
    <StyledLoader
      lngTZSettings={lngTZSettings}
      portalRenaming={portalRenaming}
      welcomePage={welcomePage}
      dnsSettings={dnsSettings}
      className="category-item-wrapper"
    >
      <RectangleSkeleton height="22px" className="header" />

      {portalRenaming ? (
        <RectangleSkeleton height="80px" className="description" />
      ) : null}

      {dnsSettings ? (
        <>
          <RectangleSkeleton
            className="dns-description"
            height={heightDnsDescription}
          />
          <div className="flex">
            <RectangleSkeleton
              height="16px"
              width="16px"
              className="padding-right"
            />
            <RectangleSkeleton height="20px" width="135px" />
          </div>
          <RectangleSkeleton className="dns-field" />
        </>
      ) : (
        <>
          <RectangleSkeleton height="20px" className="title" />
          <RectangleSkeleton height="32px" className="combo-box" />
        </>
      )}

      {lngTZSettings ? (
        <>
          <RectangleSkeleton height="20px" className="title-long" />
          <RectangleSkeleton height="32px" className="combo-box" />
        </>
      ) : null}
      <RectangleSkeleton
        height={heightSaveCancelButtons}
        className="save-cancel-buttons"
      />
    </StyledLoader>
  );
};

export default LoaderCustomization;
