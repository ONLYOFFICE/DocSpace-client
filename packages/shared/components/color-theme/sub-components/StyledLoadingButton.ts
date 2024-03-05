import styled from "styled-components";
import { Base } from "../../../themes";

const StyledLoadingButton = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  text-align: center;
  line-height: 12px;
  background: ${(props) =>
    props.theme.filesPanels.upload.loadingButton.background};
  position: absolute;
  margin: 2px;
  font-size: ${(props) => props.theme.getCorrectFontSize("16px")};
  font-weight: bold;
  color: ${(props) => props.theme.filesPanels.upload.loadingButton.color};
`;

StyledLoadingButton.defaultProps = { theme: Base };

export default StyledLoadingButton;
