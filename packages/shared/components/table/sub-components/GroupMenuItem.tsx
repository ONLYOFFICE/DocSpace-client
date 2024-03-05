import React from "react";
import { isChrome, browserVersion } from "react-device-detect";
import { ReactSVG } from "react-svg";
import styled from "styled-components";

import { mobile, tablet } from "../../../utils";
import { Base } from "../../../themes";

import { Button, ButtonSize } from "../../button";
import { DropDown } from "../../drop-down";
import { DropDownItem } from "../../drop-down-item";
import { TGroupMenuItem } from "../Table.types";

const StyledButton = styled(Button)`
  border: none;
  padding: 0 12px;
  height: 100%;
  min-width: fit-content;

  background-color: ${(props) => props.theme.button.backgroundColor.base};

  .combo-button_selected-icon {
    display: flex;
    align-items: center;
  }

  :hover {
    background-color: ${(props) =>
      props.theme.button.backgroundColor.baseHover};
  }
  :active {
    background-color: ${(props) =>
      props.theme.button.backgroundColor.baseActive};
  }

  svg {
    path[fill] {
      fill: ${(props) => props.theme.button.color.base};
    }

    path[stroke] {
      stroke: ${(props) => props.theme.button.color.base};
    }
  }

  :hover,
  :active {
    border: none;
    background-color: unset;
  }

  :hover {
    svg {
      path[fill] {
        fill: ${(props) => props.theme.button.color.baseHover};
      }

      path[stroke] {
        stroke: ${(props) => props.theme.button.color.baseHover};
      }
    }
  }

  :active {
    svg {
      path[fill] {
        fill: ${(props) => props.theme.button.color.baseActive};
      }

      path[stroke] {
        stroke: ${(props) => props.theme.button.color.baseActive};
      }
    }
  }

  .btnIcon {
    padding-right: 8px;
  }

  .button-content {
    @media ${tablet} {
      flex-direction: column;
      gap: 4px;
    }

    @media ${mobile} {
      margin-top: 4px;
    }

    ${isChrome &&
    +browserVersion <= 85 &&
    `
    /* TODO: remove if editors core version 85+ */
      > div {
        margin-right: 8px;

        @media ${tablet} {
          margin-right: 0px;
        }
      }
    `}
  }

  @media ${tablet} {
    display: flex;
    justify-content: center;
    flex-direction: column;
    padding: 0px 12px;
    .btnIcon {
      padding: 0;
      margin: 0 auto;
    }
  }

  @media ${mobile} {
    padding: 0 16px;
    font-size: 0;
    line-height: 0;
  }
`;

StyledButton.defaultProps = { theme: Base };

const GroupMenuItem = ({
  item,
  isBlocked,
}: {
  item: TGroupMenuItem;
  isBlocked?: boolean;
}) => {
  const buttonRef = React.useRef(null);

  const [open, setOpen] = React.useState(false);

  const {
    label,
    disabled,
    onClick,
    iconUrl,
    title,
    withDropDown,
    options,
    id,
  } = item;

  const onClickOutside = () => {
    setOpen(false);
  };

  const onClickAction = (e: React.MouseEvent) => {
    if (isBlocked) return;

    onClick?.(e);

    if (withDropDown) {
      setOpen(true);
    }
  };

  return disabled ? null : (
    <>
      <StyledButton
        id={id}
        label={label}
        title={title || label}
        isDisabled={isBlocked}
        onClick={onClickAction}
        icon={<ReactSVG src={iconUrl} className="combo-button_selected-icon" />}
        ref={buttonRef}
        size={ButtonSize.extraSmall}
      />
      {withDropDown && (
        <DropDown
          open={open}
          clickOutsideAction={onClickOutside}
          forwardedRef={buttonRef}
          zIndex={250}
        >
          {options.map((option) => (
            <DropDownItem {...option} key={option.key} />
          ))}
        </DropDown>
      )}
    </>
  );
};

export { GroupMenuItem };
