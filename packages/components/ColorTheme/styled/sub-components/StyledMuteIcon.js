import styled from "styled-components";
import commonIconsStyles from "SRC_DIR/utils/common-icons-style";
import IconButton from "SRC_DIR/icon-button";

const StyledMuteIcon = styled(IconButton)`
  ${commonIconsStyles}

  svg {
    path:first-child {
      stroke: ${(props) => props.theme.filesSection.rowView.pinColor};
    }
    path {
      fill: ${(props) => props.theme.filesSection.rowView.pinColor};
    }
  }
`;

export default StyledMuteIcon;
