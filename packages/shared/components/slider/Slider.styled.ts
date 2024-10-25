// (c) Copyright Ascensio System SIA 2009-2024
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

import styled, { css } from "styled-components";
import { Base, globalColors } from "../../themes";
import { SliderThemeProps } from "./Slider.types";
import { injectDefaultTheme } from "../../utils";

const StyledSlider = styled.input.attrs<SliderThemeProps>((props) => ({
  type: "range",
  disabled: props.isDisabled,
  theme: props.theme || Base,
}))<SliderThemeProps>`
  width: ${(props) => props.theme.avatarEditorBody.slider.width};
  margin: ${(props) => props.theme.avatarEditorBody.slider.margin};
  background: ${(props) =>
    props.theme.avatarEditorBody.slider.runnableTrack.focusBackground};

  border-radius: ${(props) =>
    props.theme.avatarEditorBody.slider.runnableTrack.borderRadius};

  -webkit-appearance: none;

  ${(props) =>
    props.withPouring &&
    css`
      background-image: ${props.isDisabled
        ? `linear-gradient(${globalColors.lightSecondMainDisabled}, ${globalColors.lightSecondMainDisabled})`
        : `linear-gradient(${globalColors.lightSecondMain}, ${globalColors.lightSecondMain})`};
    `}

  background-size: ${(props) => `${props.sizeProp} 100%`};
  ${({ theme }) =>
    theme.interfaceDirection === "rtl" && "background-position-x: right;"}

  background-repeat: no-repeat;

  &:focus {
    outline: none;
  }

  &::-webkit-slider-runnable-track {
    border: ${(props) =>
      props.theme.avatarEditorBody.slider.runnableTrack.border};
    border-radius: ${(props) =>
      props.theme.avatarEditorBody.slider.runnableTrack.borderRadius};
    width: ${(props) =>
      props.theme.avatarEditorBody.slider.runnableTrack.width};
    height: ${(props) =>
      props.runnableTrackHeight
        ? props.runnableTrackHeight
        : props.theme.avatarEditorBody.slider.runnableTrack.height};
    cursor: ${(props) => (props.isDisabled ? "default" : "pointer")};
  }

  &::-webkit-slider-thumb {
    margin-top: ${(props) =>
      props.theme.avatarEditorBody.slider.sliderThumb.marginTop};
    width: ${(props) =>
      props.thumbWidth
        ? props.thumbWidth
        : props.theme.avatarEditorBody.slider.sliderThumb.width};
    height: ${(props) =>
      props.thumbHeight
        ? props.thumbHeight
        : props.theme.avatarEditorBody.slider.sliderThumb.height};

    background: ${(props) =>
      props.isDisabled
        ? props.theme.avatarEditorBody.slider.sliderThumb.disabledBackground
        : props.theme.avatarEditorBody.slider.sliderThumb.background};

    border-width: ${(props) =>
      props.thumbBorderWidth
        ? props.thumbBorderWidth
        : props.theme.avatarEditorBody.slider.sliderThumb.borderWidth};

    border-style: ${(props) =>
      props.theme.avatarEditorBody.slider.sliderThumb.borderStyle};

    border-color: ${(props) =>
      props.theme.avatarEditorBody.slider.sliderThumb.borderColor};

    border-radius: ${(props) =>
      props.theme.avatarEditorBody.slider.sliderThumb.height};
    cursor: ${(props) => (props.isDisabled ? "default" : "pointer")};
    -webkit-appearance: none;
    -webkit-box-shadow: ${(props) =>
      props.theme.avatarEditorBody.slider.sliderThumb.boxShadow};
    box-shadow: ${(props) =>
      props.theme.avatarEditorBody.slider.sliderThumb.boxShadow};
  }

  &::-moz-range-thumb {
    width: ${(props) => props.theme.avatarEditorBody.slider.rangeThumb.width};
    height: ${(props) => props.theme.avatarEditorBody.slider.rangeThumb.height};
    background: ${(props) =>
      props.isDisabled
        ? props.theme.avatarEditorBody.slider.sliderThumb.disabledBackground
        : props.theme.avatarEditorBody.slider.sliderThumb.background};
    border: ${(props) => props.theme.avatarEditorBody.slider.rangeThumb.border};
    border-radius: ${(props) =>
      props.theme.avatarEditorBody.slider.rangeThumb.borderRadius};
    cursor: ${(props) => (props.isDisabled ? "default" : "pointer")};
    -moz-box-shadow: ${(props) =>
      props.theme.avatarEditorBody.slider.rangeThumb.boxShadow};
    box-shadow: ${(props) =>
      props.theme.avatarEditorBody.slider.rangeThumb.boxShadow};
  }

  &::-ms-track {
    background: ${(props) =>
      props.theme.avatarEditorBody.slider.track.background};
    border-color: ${(props) =>
      props.theme.avatarEditorBody.slider.track.borderColor};
    border-width: ${(props) =>
      props.theme.avatarEditorBody.slider.track.borderWidth};
    color: ${(props) => props.theme.avatarEditorBody.slider.track.color};
    width: ${(props) => props.theme.avatarEditorBody.slider.track.width};
    height: ${(props) => props.theme.avatarEditorBody.slider.track.height};
    cursor: ${(props) => (props.isDisabled ? "default" : "pointer")};
  }

  &::-ms-fill-lower {
    background: ${(props) =>
      props.theme.avatarEditorBody.slider.fillLower.background};
    border: ${(props) => props.theme.avatarEditorBody.slider.fillLower.border};
    border-radius: ${(props) =>
      props.theme.avatarEditorBody.slider.fillLower.borderRadius};
  }

  &::-ms-fill-upper {
    background: ${(props) =>
      props.theme.avatarEditorBody.slider.fillUpper.background};
    border: ${(props) => props.theme.avatarEditorBody.slider.fillUpper.border};
    border-radius: ${(props) =>
      props.theme.avatarEditorBody.slider.fillUpper.borderRadius};
  }

  &::-ms-thumb {
    width: ${(props) => props.theme.avatarEditorBody.slider.thumb.width};
    height: ${(props) => props.theme.avatarEditorBody.slider.thumb.height};
    background: ${(props) =>
      props.theme.avatarEditorBody.slider.thumb.background};
    border: ${(props) => props.theme.avatarEditorBody.slider.thumb.border};
    border-radius: ${(props) =>
      props.theme.avatarEditorBody.slider.thumb.borderRadius};
    cursor: ${(props) => (props.isDisabled ? "default" : "pointer")};
    margin-top: ${(props) =>
      props.theme.avatarEditorBody.slider.thumb.marginTop};
    /*Needed to keep the Edge thumb centred*/
    box-shadow: ${(props) =>
      props.theme.avatarEditorBody.slider.thumb.boxShadow};
  }

  &:focus::-ms-fill-lower {
    background: ${(props) =>
      props.theme.avatarEditorBody.slider.fillLower.focusBackground};
  }

  &:focus::-ms-fill-upper {
    background: ${(props) =>
      props.theme.avatarEditorBody.slider.fillUpper.focusBackground};
  }
`;

const StyledRangeSlider = styled.div`
  background: red;
`;

const StyledSliderTheme = styled(StyledSlider).attrs(
  injectDefaultTheme,
)<SliderThemeProps>`
  background-image: ${(props) =>
    props.withPouring &&
    ((props.theme.isBase &&
      `linear-gradient( ${props.$currentColorScheme?.main?.accent}, ${props.$currentColorScheme?.main?.accent})`) ||
      (!props.theme.isBase &&
        `linear-gradient(${globalColors.white}, ${globalColors.white})`))};

  &::-webkit-slider-thumb {
    background: ${(props) =>
      (props.theme.isBase && props.$currentColorScheme?.main?.accent) ||
      (!props.theme.isBase && globalColors.white)};
    box-shadow: ${(props) =>
      !props.theme.isBase && "0px 3px 12px rgba(0, 0, 0, 0.25); !important"};
  }

  &:hover {
    background-image: ${(props) =>
      props.withPouring &&
      ((props.theme.isBase &&
        `linear-gradient( ${props.$currentColorScheme?.main?.accent}, ${props.$currentColorScheme?.main?.accent})`) ||
        (!props.theme.isBase &&
          `linear-gradient(${globalColors.white}, ${globalColors.white})`))};
  }

  ${(props) =>
    props.isDisabled &&
    css`
      opacity: 0.32;
    `}
`;

export { StyledSlider, StyledRangeSlider, StyledSliderTheme };
