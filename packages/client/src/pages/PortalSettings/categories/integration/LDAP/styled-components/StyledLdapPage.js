import styled from "styled-components";
import { UnavailableStyles } from "../../../../utils/commonSettingsStyles";

const StyledLdapPage = styled.div`
  box-sizing: border-box;
  outline: none;
  max-width: 700px;
  padding-top: 5px;

  .intro-text {
    margin-bottom: 18px;
    max-width: 700px;
    color: ${(props) => props.theme.client.settings.common.descriptionColor};
  }

  ${(props) => !props.isSettingPaid && UnavailableStyles}i
`;

export default StyledLdapPage;
