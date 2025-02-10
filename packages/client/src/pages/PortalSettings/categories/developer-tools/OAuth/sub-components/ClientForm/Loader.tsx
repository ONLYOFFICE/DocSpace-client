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

import { RectangleSkeleton } from "@docspace/shared/skeletons/rectangle";
import { DeviceType } from "@docspace/shared/enums";

import {
  StyledBlock,
  StyledButtonContainer,
  StyledCheckboxGroup,
  StyledContainer,
  StyledHeaderRow,
  StyledInputBlock,
  StyledInputGroup,
  StyledInputRow,
  StyledScopesCheckbox,
  StyledScopesContainer,
  StyledScopesName,
} from "./ClientForm.styled";

const HelpButtonSkeleton = () => {
  return <RectangleSkeleton width="12px" height="12px" />;
};

const CheckboxSkeleton = ({ className }: { className?: string }) => {
  return <RectangleSkeleton className={className} width="16px" height="16px" />;
};

const ClientFormLoader = ({
  currentDeviceType,
  isEdit,
}: {
  currentDeviceType?: DeviceType;
  isEdit: boolean;
}) => {
  const buttonHeight = currentDeviceType !== "desktop" ? "40px" : "32px";

  return (
    <StyledContainer>
      <StyledBlock>
        <StyledHeaderRow>
          <RectangleSkeleton width="78px" height="22px" />
        </StyledHeaderRow>
        <StyledInputBlock>
          <StyledInputGroup>
            <StyledHeaderRow>
              <RectangleSkeleton width="65px" height="20px" />
            </StyledHeaderRow>
            <StyledInputRow>
              <RectangleSkeleton width="100%" height="32px" />
            </StyledInputRow>
          </StyledInputGroup>
          <StyledInputGroup>
            <StyledHeaderRow>
              <RectangleSkeleton width="80px" height="20px" />
            </StyledHeaderRow>
            <StyledInputRow>
              <RectangleSkeleton width="100%" height="32px" />
            </StyledInputRow>
          </StyledInputGroup>
          <StyledInputGroup>
            <div className="label">
              <RectangleSkeleton width="60px" height="20px" />
            </div>
            <div className="select">
              <RectangleSkeleton width="32px" height="32px" />
              <RectangleSkeleton width="32px" height="32px" />
              <RectangleSkeleton width="109px" height="20px" />
            </div>
            <RectangleSkeleton width="130px" height="16px" />
          </StyledInputGroup>
          <StyledInputGroup>
            <StyledHeaderRow>
              <RectangleSkeleton width="75px" height="20px" />
            </StyledHeaderRow>
            <StyledInputRow>
              <RectangleSkeleton width="100%" height="60px" />
            </StyledInputRow>
          </StyledInputGroup>
          <StyledInputGroup>
            <StyledHeaderRow>
              <RectangleSkeleton width="75px" height="20px" />
            </StyledHeaderRow>
            <StyledCheckboxGroup>
              <CheckboxSkeleton />
              <RectangleSkeleton width="151px" height="18px" />
              <HelpButtonSkeleton />
            </StyledCheckboxGroup>
          </StyledInputGroup>
        </StyledInputBlock>
      </StyledBlock>
      {isEdit ? (
        <StyledBlock>
          <StyledHeaderRow>
            <RectangleSkeleton width="47px" height="22px" />
            <HelpButtonSkeleton />
          </StyledHeaderRow>
          <StyledInputBlock>
            <StyledInputGroup>
              <StyledHeaderRow>
                <RectangleSkeleton width="96px" height="20px" />
              </StyledHeaderRow>
              <StyledInputRow>
                <RectangleSkeleton width="100%" height="32px" />
              </StyledInputRow>
            </StyledInputGroup>
            <StyledInputGroup>
              <StyledHeaderRow>
                <RectangleSkeleton width="60px" height="20px" />
              </StyledHeaderRow>
              <StyledInputRow>
                <RectangleSkeleton
                  className="loader"
                  width="calc(100% - 91px)"
                  height="32px"
                />
                <RectangleSkeleton width="91px" height="32px" />
              </StyledInputRow>
            </StyledInputGroup>
          </StyledInputBlock>
        </StyledBlock>
      ) : null}
      <StyledBlock>
        <StyledHeaderRow>
          <RectangleSkeleton width="96px" height="22px" />
        </StyledHeaderRow>
        <StyledInputBlock>
          <StyledInputGroup>
            <StyledHeaderRow>
              <RectangleSkeleton width="87px" height="20px" />
              <HelpButtonSkeleton />
            </StyledHeaderRow>
            <StyledInputRow>
              <RectangleSkeleton
                className="loader"
                width="calc(100% - 40px)"
                height="32px"
              />
              <RectangleSkeleton width="32px" height="32px" />
            </StyledInputRow>
          </StyledInputGroup>
          <StyledInputGroup>
            <StyledHeaderRow>
              <RectangleSkeleton width="96px" height="20px" />
              <HelpButtonSkeleton />
            </StyledHeaderRow>
            <StyledInputRow>
              <RectangleSkeleton
                className="loader"
                width="calc(100% - 40px)"
                height="32px"
              />
              <RectangleSkeleton width="32px" height="32px" />
            </StyledInputRow>
          </StyledInputGroup>
        </StyledInputBlock>
      </StyledBlock>
      <StyledScopesContainer>
        <StyledHeaderRow className="header">
          <RectangleSkeleton width="111px" height="22px" />
          <HelpButtonSkeleton />
        </StyledHeaderRow>
        <RectangleSkeleton className="header" width="34px" height="22px" />
        <RectangleSkeleton
          className="header header-last"
          width="37px"
          height="22px"
        />
        <StyledScopesName>
          <RectangleSkeleton
            className="scope-name-loader"
            width="98px"
            height="16px"
          />
          <RectangleSkeleton
            className="scope-desc-loader"
            width="200px"
            height="17px"
          />
          <RectangleSkeleton
            className="scope-desc-loader"
            width="230px"
            height="17px"
          />
        </StyledScopesName>
        <StyledScopesCheckbox>
          <CheckboxSkeleton className="checkbox-read" />
        </StyledScopesCheckbox>
        <StyledScopesCheckbox>
          <CheckboxSkeleton />
        </StyledScopesCheckbox>
        <StyledScopesName>
          <RectangleSkeleton
            className="scope-name-loader"
            width="98px"
            height="16px"
          />
          <RectangleSkeleton
            className="scope-desc-loader"
            width="200px"
            height="17px"
          />
          <RectangleSkeleton
            className="scope-desc-loader"
            width="230px"
            height="17px"
          />
        </StyledScopesName>
        <StyledScopesCheckbox>
          <CheckboxSkeleton className="checkbox-read" />
        </StyledScopesCheckbox>
        <StyledScopesCheckbox>
          <CheckboxSkeleton />
        </StyledScopesCheckbox>
        <StyledScopesName>
          <RectangleSkeleton
            className="scope-name-loader"
            width="98px"
            height="16px"
          />
          <RectangleSkeleton
            className="scope-desc-loader"
            width="200px"
            height="17px"
          />
          <RectangleSkeleton
            className="scope-desc-loader"
            width="230px"
            height="17px"
          />
        </StyledScopesName>
        <StyledScopesCheckbox>
          <CheckboxSkeleton className="checkbox-read" />
        </StyledScopesCheckbox>
        <StyledScopesCheckbox>
          <CheckboxSkeleton />
        </StyledScopesCheckbox>
        <StyledScopesName>
          <RectangleSkeleton
            className="scope-name-loader"
            width="98px"
            height="16px"
          />
          <RectangleSkeleton
            className="scope-desc-loader"
            width="200px"
            height="17px"
          />
          <RectangleSkeleton
            className="scope-desc-loader"
            width="230px"
            height="17px"
          />
        </StyledScopesName>
        <StyledScopesCheckbox>
          <CheckboxSkeleton className="checkbox-read" />
        </StyledScopesCheckbox>
        <StyledScopesCheckbox>
          <CheckboxSkeleton />
        </StyledScopesCheckbox>{" "}
        <StyledScopesName>
          <RectangleSkeleton
            className="scope-name-loader"
            width="98px"
            height="16px"
          />
          <RectangleSkeleton
            className="scope-desc-loader"
            width="200px"
            height="17px"
          />
        </StyledScopesName>
        <StyledScopesCheckbox>
          <CheckboxSkeleton className="checkbox-read" />
        </StyledScopesCheckbox>
      </StyledScopesContainer>
      <StyledBlock>
        <StyledHeaderRow>
          <RectangleSkeleton width="162px" height="22px" />
        </StyledHeaderRow>
        <StyledInputBlock>
          <StyledInputGroup>
            <StyledHeaderRow>
              <RectangleSkeleton width="114px" height="20px" />
              <HelpButtonSkeleton />
            </StyledHeaderRow>
            <StyledInputRow>
              <RectangleSkeleton width="100%" height="32px" />
            </StyledInputRow>
          </StyledInputGroup>
          <StyledInputGroup>
            <StyledHeaderRow>
              <RectangleSkeleton width="96px" height="20px" />
              <HelpButtonSkeleton />
            </StyledHeaderRow>
            <StyledInputRow>
              <RectangleSkeleton width="100%" height="32px" />
            </StyledInputRow>
          </StyledInputGroup>
        </StyledInputBlock>
      </StyledBlock>
      <StyledButtonContainer>
        <RectangleSkeleton
          width={currentDeviceType === "desktop" ? "86px" : "100%"}
          height={buttonHeight}
        />
        <RectangleSkeleton
          width={currentDeviceType === "desktop" ? "86px" : "100%"}
          height={buttonHeight}
        />
      </StyledButtonContainer>
    </StyledContainer>
  );
};

export default ClientFormLoader;
