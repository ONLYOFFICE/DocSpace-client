import styled from "styled-components";
import commonIconsStyles from "@docspace/components/utils/common-icons-style";
import IconButton from "@docspace/components/icon-button";

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
