import React from "react";
import styled, { css } from "styled-components";

import { Base } from "@docspace/shared/themes";

import { Text } from "@docspace/shared/components/text";
import { Button } from "@docspace/shared/components/button";

import ArrowIcon from "PUBLIC_DIR/images/arrow-left.react.svg";

const TileContainer = styled.div`
  box-sizing: border-box;

  width: 100%;
  max-width: 342px;
  height: 354px;

  padding: 12px 16px;

  border-radius: 6px;
  border: 1px solid ${(props) => props.theme.sdkPresets.borderColor};

  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;

  .tileContent {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .navigationButton {
    border: none;

    .button-content {
      flex-direction: row-reverse;
    }

    .icon {
      transform: scale(-1, 1);
    }

    :hover {
      ${() =>
        css`
          border: ${(props) => props.theme.button.border.baseHover};
          box-sizing: ${(props) => props.theme.button.boxSizing};
        `}
    }
  }
`;

TileContainer.defaultProps = { theme: Base };

const PresetTile = (props) => {
  const { t, title, description, image, handleOnClick } = props;

  return (
    <TileContainer>
      <div className="tileContent">
        <Text fontSize="16px" lineHeight="22px" fontWeight={700}>
          {title}
        </Text>
        <img src={image} alt={title} />
        <Text lineHeight="20px">{description}</Text>
      </div>
      <Button
        className="navigationButton"
        label={t("SetUp")}
        icon={<ArrowIcon />}
        scale
        isClicked
        size="small"
        onClick={handleOnClick}
      />
    </TileContainer>
  );
};

export default PresetTile;
