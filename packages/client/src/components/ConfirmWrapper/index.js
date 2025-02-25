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
import { isIOS, isFirefox } from "react-device-detect";
import { inject, observer } from "mobx-react";
import { getBgPattern } from "@docspace/shared/utils/common";
import { mobile } from "@docspace/shared/utils";
import { Scrollbar } from "@docspace/shared/components/scrollbar";

const StyledWrapper = styled.div`
  height: ${(props) =>
    props.height
      ? props.height
      : isIOS && !isFirefox
        ? "calc(var(--vh, 1vh) * 100)"
        : "100vh"};
  width: 100vw;
  z-index: 0;
  display: flex;
  flex-direction: row;
  box-sizing: border-box;

  @media ${mobile} {
    height: auto;
    min-height: 100%;
    width: 100%;
    min-width: 100%;
  }
`;

const BgBlock = styled.div`
  background-image: ${(props) => props.bgPattern};
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: -1;

  @media ${mobile} {
    background-image: none;
  }
`;

const ConfirmWrapper = (props) => {
  const { children, currentColorScheme, height } = props;
  const bgPattern = getBgPattern(currentColorScheme?.id);
  const content = (
    <>
      <BgBlock bgPattern={bgPattern} />
      {children}
    </>
  );

  return (
    <StyledWrapper height={height}>
      {height ? content : <Scrollbar>{content}</Scrollbar>}
    </StyledWrapper>
  );
};

export default inject(({ settingsStore }) => {
  const { currentColorScheme } = settingsStore;

  return {
    currentColorScheme,
  };
})(observer(ConfirmWrapper));
