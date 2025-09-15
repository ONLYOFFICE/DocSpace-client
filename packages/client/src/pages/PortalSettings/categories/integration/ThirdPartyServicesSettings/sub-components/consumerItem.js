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
import { ReactSVG } from "react-svg";
import PropTypes from "prop-types";
import styled, { css } from "styled-components";
import { Text } from "@docspace/shared/components/text";
import { globalColors } from "@docspace/shared/themes";
import { thirdpartiesLogo } from "@docspace/shared/utils/image-thirdparties";
import { injectDefaultTheme } from "@docspace/shared/utils";
import ConsumerToggle from "./consumerToggle";

const StyledItem = styled.div.attrs(injectDefaultTheme)`
  .consumer-description {
    ${(props) =>
      !props.isThirdPartyAvailable &&
      !props.isSet &&
      css`
        color: ${({ theme }) => theme.client.settings.integration.textColor};
      `}
  }

  .item-box {
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
`;

const StyledBox = styled.div.attrs(injectDefaultTheme)`
  box-sizing: border-box;

  .consumer-icon {
    ${({ theme, isLinkedIn, isWeixin }) =>
      !theme.isBase &&
      css`
        path {
          fill: ${globalColors.white};
          opacity: 1;
        }

        ${isLinkedIn &&
        css`
          path:nth-child(8),
          path:nth-child(9) {
            fill: ${globalColors.black};
            opacity: 1;
          }
        `}

        ${isWeixin &&
        css`
          path:nth-child(11),
          path:nth-child(12),
          path:nth-child(13),
          path:nth-child(14) {
            fill: ${globalColors.black};
            opacity: 1;
          }
        `}
      `}

    ${({ isThirdPartyAvailable, canSet }) =>
      !isThirdPartyAvailable &&
      canSet &&
      css`
        path {
          opacity: 0.5;
        }
      `}
  }
`;

const ConsumerItem = ({
  consumer,
  onModalOpen,
  setConsumer,
  updateConsumerProps,
  t,
  isThirdPartyAvailable,
}) => {
  const logo = thirdpartiesLogo?.get(`${consumer.name.toLowerCase()}.svg`);
  const isSet = !!(!consumer.canSet || consumer.props.find((p) => p.value));

  return (
    <StyledItem isThirdPartyAvailable={isThirdPartyAvailable} isSet={isSet}>
      <div className="item-box">
        <StyledBox
          canSet={consumer.canSet}
          isLinkedIn={consumer.name === "linkedin"}
          isWeixin={consumer.name === "weixin"}
          isThirdPartyAvailable={isThirdPartyAvailable}
        >
          {logo ? (
            <ReactSVG
              src={logo}
              className="consumer-icon"
              alt={consumer.name}
            />
          ) : null}
        </StyledBox>
        <div onClick={setConsumer} data-consumer={consumer.name}>
          <ConsumerToggle
            consumer={consumer}
            onModalOpen={onModalOpen}
            updateConsumerProps={updateConsumerProps}
            t={t}
            isDisabled={!isThirdPartyAvailable}
            dataTestId="consumer_toggle_button"
          />
        </div>
      </div>

      <Text className="consumer-description">{consumer.description}</Text>
    </StyledItem>
  );
};

ConsumerItem.propTypes = {
  consumer: PropTypes.shape({
    name: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string,
    instruction: PropTypes.string,
    canSet: PropTypes.bool,
    props: PropTypes.arrayOf(PropTypes.object),
  }).isRequired,
  onModalOpen: PropTypes.func.isRequired,
  setConsumer: PropTypes.func.isRequired,
  updateConsumerProps: PropTypes.func.isRequired,
};

export default ConsumerItem;
