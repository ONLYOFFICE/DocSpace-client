import styled from "styled-components";
import commonIconsStyles from "SRC_DIR/utils/common-icons-style";
import IconButton from "SRC_DIR/icon-button";

const StyledPinIcon = styled(IconButton)`
  ${commonIconsStyles}

  svg {
    path {
      fill: ${(props) => props.theme.filesSection.rowView.pinColor};
    }
  }

  :hover {
    svg {
      path {
        fill: ${(props) => props.theme.filesSection.rowView.pinColor};
      }
    }
  }
`;

export default StyledPinIcon;
