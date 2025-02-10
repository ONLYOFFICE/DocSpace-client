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

import styled from "styled-components";
import { RectangleSkeleton } from "@docspace/shared/skeletons";
import { tablet } from "@docspace/shared/utils";
import StyledSettingsSeparator from "SRC_DIR/pages/PortalSettings/StyledSettingsSeparator";

const StyledLoader = styled.div`
  .submenu {
    width: 296px;
    height: 29px;
    margin-bottom: 14px;

    @media ${tablet} {
      width: 184px;
      height: 37px;
    }
  }

  .header {
    display: flex;
    margin-bottom: 22px;

    .header-item {
      width: 72px;
      margin-inline-end: 20px;
    }
  }

  .description {
    width: 591px;
    margin-bottom: 20px;

    @media ${tablet} {
      width: 100%;
    }
  }

  .buttons {
    width: 192px;
    height: 32px;

    @media ${tablet} {
      height: 40px;
    }
  }

  .password-settings {
    .header {
      width: 132px;
      margin-bottom: 16px;
    }

    .subheader {
      width: 171px;
      margin-bottom: 16px;
    }

    .slider {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 16px;
    }

    .checkboxs {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 24px;
    }
  }

  .tfa-settings {
    .header {
      width: 227px;
      margin-bottom: 16px;
    }

    .radio-buttons {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 24px;
    }
  }

  .domain-settings {
    .header {
      width: 132px;
      margin-bottom: 16px;
    }

    .radio-buttons {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 11px;
    }

    .inputs {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;

      .input {
        display: flex;
        gap: 8px;
        align-items: center;
      }
    }

    .button {
      width: 85px;
    }
  }
`;

const SecurityLoader = () => {
  return (
    <StyledLoader>
      <RectangleSkeleton className="submenu" height="100%" />
      <div className="header">
        <RectangleSkeleton className="header-item" height="28px" />
        <RectangleSkeleton className="header-item" height="28px" />
        <RectangleSkeleton className="header-item" height="28px" />
        <RectangleSkeleton className="header-item" height="28px" />
      </div>
      <RectangleSkeleton className="description" height="20px" />

      <div className="password-settings">
        <RectangleSkeleton className="header" height="22px" />
        <RectangleSkeleton className="subheader" height="16px" />
        <div className="slider">
          <RectangleSkeleton height="24px" width="160px" />
          <RectangleSkeleton height="20px" width="75px" />
        </div>
        <div className="checkboxs">
          <RectangleSkeleton height="20px" width="133px" />
          <RectangleSkeleton height="20px" width="83px" />
          <RectangleSkeleton height="20px" width="159px" />
        </div>
        <RectangleSkeleton className="buttons" height="100%" />
      </div>

      <StyledSettingsSeparator />

      <div className="tfa-settings">
        <RectangleSkeleton className="header" height="22px" />
        <div className="radio-buttons">
          <RectangleSkeleton height="20px" width="69px" />
          <RectangleSkeleton height="20px" width="69px" />
          <RectangleSkeleton height="20px" width="152px" />
        </div>
        <RectangleSkeleton className="buttons" height="100%" />
      </div>

      <StyledSettingsSeparator />

      <div className="domain-settings">
        <RectangleSkeleton className="header" height="22px" />
        <div className="radio-buttons">
          <RectangleSkeleton height="20px" width="77px" />
          <RectangleSkeleton height="20px" width="103px" />
          <RectangleSkeleton height="20px" width="127px" />
        </div>
        <div className="inputs">
          <div className="input">
            <RectangleSkeleton height="32px" width="350px" />
            <RectangleSkeleton height="16px" width="16px" />
          </div>
          <div className="input">
            <RectangleSkeleton height="32px" width="350px" />
            <RectangleSkeleton height="16px" width="16px" />
          </div>
          <div className="input">
            <RectangleSkeleton height="32px" width="350px" />
            <RectangleSkeleton height="16px" width="16px" />
          </div>
          <RectangleSkeleton className="button" height="20px" />
        </div>
      </div>
    </StyledLoader>
  );
};

export default SecurityLoader;
