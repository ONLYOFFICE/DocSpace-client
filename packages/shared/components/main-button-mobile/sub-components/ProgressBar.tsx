import { useContext } from "react";
import { ThemeContext } from "styled-components";

import { IconButton } from "../../icon-button";
import { Text } from "../../text";

import {
  StyledMobileProgressBar,
  StyledProgressBarContainer,
  StyledProgressBarTheme,
} from "../MainButtonMobile.styled";
import { ProgressBarMobileProps } from "../MainButtonMobile.types";

const ProgressBarMobile = ({
  label,
  status,
  percent,
  open,
  onCancel,
  icon,
  onClickAction,
  hideButton,
  error,
}: ProgressBarMobileProps) => {
  const uploadPercent = percent > 100 ? 100 : percent;

  const onClickHeaderAction = () => {
    onClickAction?.();
    hideButton?.();
  };

  const defaultTheme = useContext(ThemeContext);

  const currentColorScheme = defaultTheme?.currentColorScheme;

  return (
    <StyledProgressBarContainer isUploading={open}>
      <div className="progress-container">
        <Text
          className="progress-header"
          fontSize="14px"
          // color="#657077"
          onClick={onClickHeaderAction}
          truncate
        >
          {label}
        </Text>
        <div className="progress_info-container">
          <Text className="progress_count" fontSize="13px" truncate>
            {status}
          </Text>
          <IconButton
            className="progress_icon"
            onClick={onCancel}
            iconName={icon}
            size={14}
          />
        </div>
      </div>

      <StyledMobileProgressBar>
        <StyledProgressBarTheme
          $currentColorScheme={currentColorScheme}
          uploadPercent={uploadPercent}
          error={error}
        />
      </StyledMobileProgressBar>
    </StyledProgressBarContainer>
  );
};

export { ProgressBarMobile };
