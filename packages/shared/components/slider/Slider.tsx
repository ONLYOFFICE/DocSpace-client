import React, { useState, useEffect, useContext } from "react";
import { ThemeContext } from "styled-components";

import { SliderProps } from "./Slider.types";
import { StyledSliderTheme } from "./Slider.styled";

const Slider = (props: SliderProps) => {
  const {
    id,

    className,
    onChange,
    min,
    max,
    step,
    value,
    withPouring,
    style,
    isDisabled = false,
    thumbBorderWidth,
    thumbHeight,
    thumbWidth,
    runnableTrackHeight,
  } = props;
  const defaultTheme = useContext(ThemeContext);

  const currentColorScheme = defaultTheme?.currentColorScheme;

  const [size, setSize] = useState("0%");

  useEffect(() => {
    setSize(`${((value - min) * 100) / (max - min)}%`);
  }, [max, min, value]);

  const onChangeAction = (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange?.(e);

  return (
    <StyledSliderTheme
      {...props}
      isDisabled={isDisabled}
      disabled={isDisabled}
      style={style}
      id={id}
      className={className}
      min={min}
      max={max}
      step={step}
      value={value}
      sizeProp={!!value && withPouring ? size : "0%"}
      withPouring={withPouring}
      onChange={onChangeAction}
      thumbBorderWidth={thumbBorderWidth}
      thumbHeight={thumbHeight}
      thumbWidth={thumbWidth}
      runnableTrackHeight={runnableTrackHeight}
      $currentColorScheme={currentColorScheme}
      data-testid="slider"
    />
  );
};

export { Slider };
