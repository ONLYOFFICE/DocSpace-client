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
import { isChrome, browserVersion } from "react-device-detect";
import { ReactSVG } from "react-svg";
import styled from "styled-components";

import { injectDefaultTheme, mobile, tablet } from "../../../utils";

import { Button, ButtonSize } from "../../button";
import { DropDown } from "../../drop-down";
import { DropDownItem } from "../../drop-down-item";
import { TGroupMenuItem } from "../Table.types";

const StyledButton = styled(Button).attrs(injectDefaultTheme)`
  && {
    border: none !important;
    padding: 0 12px;
    height: 100%;
    min-width: fit-content;

    background-color: ${(props) => props.theme.button.backgroundColor.base};

    .combo-button_selected-icon > div {
      display: flex;
      align-items: center;
    }

    svg {
      path[fill] {
        fill: ${(props) => props.theme.button.color.base};
      }

      path[stroke] {
        stroke: ${(props) => props.theme.button.color.base};
      }
    }

    &:hover,
    &:active {
      border: none !important;
      background-color: unset !important;
    }

    &:hover {
      svg {
        path[fill] {
          fill: ${(props) => props.theme.button.color.baseHover};
        }

        path[stroke] {
          stroke: ${(props) => props.theme.button.color.baseHover};
        }
      }
    }

    &:active {
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
      padding-inline-end: 8px;
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
  }
`;

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
      {withDropDown ? (
        <DropDown
          open={open}
          clickOutsideAction={onClickOutside}
          forwardedRef={buttonRef}
          zIndex={250}
        >
          {options?.map((option) => {
            const { key, ...rest } = option;

            return (
              <DropDownItem key={option.key} {...rest} setOpen={setOpen} />
            );
          })}
        </DropDown>
      ) : null}
    </>
  );
};

export { GroupMenuItem };
