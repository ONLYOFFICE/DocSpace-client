import styled, { css } from "styled-components";
import { Base } from "../themes";

const StyledSlider = styled.input.attrs((props) => ({
  type: "range",
  // @ts-expect-error TS(2551): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
  disabled: props.isDisabled,
}))`
  width: ${(props) => props.theme.avatarEditorBody.slider.width};
  margin: ${(props) => props.theme.avatarEditorBody.slider.margin};
  background: ${(props) =>
    props.theme.avatarEditorBody.slider.runnableTrack.focusBackground};

  border-radius: ${(props) =>
    props.theme.avatarEditorBody.slider.runnableTrack.borderRadius};

  -webkit-appearance: none;

  ${(props) =>
    // @ts-expect-error TS(2339): Property 'withPouring' does not exist on type 'The... Remove this comment to see the full error message
    props.withPouring &&
    css`
      // @ts-expect-error TS(2551): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
      background-image: ${props.isDisabled
        ? `linear-gradient(#A6DCF2, #A6DCF2)`
        : `linear-gradient(#2da7db, #2da7db)`};
    `}

  background-size: ${(props) => `${props.size} 100%`};
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
      // @ts-expect-error TS(2339): Property 'runnableTrackHeight' does not exist on t... Remove this comment to see the full error message
      props.runnableTrackHeight
        // @ts-expect-error TS(2339): Property 'runnableTrackHeight' does not exist on t... Remove this comment to see the full error message
        ? props.runnableTrackHeight
        : props.theme.avatarEditorBody.slider.runnableTrack.height};
    // @ts-expect-error TS(2551): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
    cursor: ${(props) => (props.isDisabled ? "default" : "pointer")};
  }

  &::-webkit-slider-thumb {
    margin-top: ${(props) =>
      props.theme.avatarEditorBody.slider.sliderThumb.marginTop};
    width: ${(props) =>
      // @ts-expect-error TS(2339): Property 'thumbWidth' does not exist on type 'Them... Remove this comment to see the full error message
      props.thumbWidth
        // @ts-expect-error TS(2339): Property 'thumbWidth' does not exist on type 'Them... Remove this comment to see the full error message
        ? props.thumbWidth
        : props.theme.avatarEditorBody.slider.sliderThumb.width};
    height: ${(props) =>
      // @ts-expect-error TS(2339): Property 'thumbHeight' does not exist on type 'The... Remove this comment to see the full error message
      props.thumbHeight
        // @ts-expect-error TS(2339): Property 'thumbHeight' does not exist on type 'The... Remove this comment to see the full error message
        ? props.thumbHeight
        : props.theme.avatarEditorBody.slider.sliderThumb.height};

    background: ${(props) =>
      // @ts-expect-error TS(2551): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
      props.isDisabled
        ? props.theme.avatarEditorBody.slider.sliderThumb.disabledBackground
        : props.theme.avatarEditorBody.slider.sliderThumb.background};

    border-width: ${(props) =>
      // @ts-expect-error TS(2339): Property 'thumbBorderWidth' does not exist on type... Remove this comment to see the full error message
      props.thumbBorderWidth
        // @ts-expect-error TS(2339): Property 'thumbBorderWidth' does not exist on type... Remove this comment to see the full error message
        ? props.thumbBorderWidth
        : props.theme.avatarEditorBody.slider.sliderThumb.borderWidth};

    border-style: ${(props) =>
      props.theme.avatarEditorBody.slider.sliderThumb.borderStyle};

    border-color: ${(props) =>
      props.theme.avatarEditorBody.slider.sliderThumb.borderColor};

    border-radius: ${(props) =>
      props.theme.avatarEditorBody.slider.sliderThumb.height};
    // @ts-expect-error TS(2551): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
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
      // @ts-expect-error TS(2551): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
      props.isDisabled
        ? props.theme.avatarEditorBody.slider.sliderThumb.disabledBackground
        : props.theme.avatarEditorBody.slider.sliderThumb.background};
    border: ${(props) => props.theme.avatarEditorBody.slider.rangeThumb.border};
    border-radius: ${(props) =>
      props.theme.avatarEditorBody.slider.rangeThumb.borderRadius};
    // @ts-expect-error TS(2551): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
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
    // @ts-expect-error TS(2551): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
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
    // @ts-expect-error TS(2551): Property 'isDisabled' does not exist on type 'Them... Remove this comment to see the full error message
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
StyledSlider.defaultProps = { theme: Base };

const StyledRangeSlider = styled.div`
  background: red;
`;

export { StyledSlider, StyledRangeSlider };
