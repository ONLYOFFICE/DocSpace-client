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
import { ReactSVG } from "react-svg";

import ViewTilesReactSvg from "PUBLIC_DIR/images/view-tiles.react.svg?url";
import ViewChangeReactUrl from "PUBLIC_DIR/images/view-change.react.svg?url";

import { injectDefaultTheme, mobile, tablet } from "@docspace/shared/utils";
import { globalColors } from "@docspace/shared/themes";
import CategoryFilter from "./CategoryFilter";
import LanguageFilter from "./LanguageFilter";
import SearchFilter from "./SearchFilter";
import SortFilter from "./SortFilter";

export const StyledFilter = styled.div.attrs(injectDefaultTheme)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 0 0 8px 0;

  .form-only-filters {
    height: 32px;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;

    &:empty {
      display: none;
    }
  }

  .general-filters {
    height: 32px;
    width: 100%;
    max-width: 693px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: end;
    gap: 8px;
  }

  .form-only-filters:empty + .general-filters {
    justify-content: space-between;
    max-width: 100%;
  }

  .view-button {
    width: 32px;
    height: 32px;

    min-width: 32px;

    box-sizing: border-box;

    border: 1px solid ${globalColors.grayStrong};
    border-radius: 3px;
    display: flex;
    justify-content: center;
    align-items: center;

    .icon-view {
      width: 16px;
      height: 16px;
    }
  }

  @media ${tablet} {
    padding-bottom: 16px;
  }

  @media ${mobile} {
    flex-direction: ${({ theme }) =>
      theme.interfaceDirection === "rtl" ? `column` : `column-reverse`};

    .form-only-filters {
      width: 100%;
    }
    .general-filters {
      max-width: 100%;
    }

    padding-right: 16px;
  }
`;

const SectionFilterContent = (props) => {
  const { setShowOneTile, isShowOneTile, viewMobile } = props;

  const onClickViewChange = () => {
    setShowOneTile(!isShowOneTile);
  };

  return (
    <StyledFilter>
      <div className="form-only-filters">
        <CategoryFilter />
        <LanguageFilter />
      </div>
      <div className="general-filters">
        <SearchFilter />
        <SortFilter />
        {viewMobile ? (
          <div className="view-button" onClick={onClickViewChange}>
            <ReactSVG
              src={isShowOneTile ? ViewTilesReactSvg : ViewChangeReactUrl}
              className="icon-view"
            />
          </div>
        ) : null}
      </div>
    </StyledFilter>
  );
};

export default SectionFilterContent;
