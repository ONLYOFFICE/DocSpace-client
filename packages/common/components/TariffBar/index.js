import styled from "styled-components";
import { useNavigate } from "react-router-dom";

import { combineUrl } from "@docspace/common/utils";
import Text from "@docspace/components/text";

const StyledWrapper = styled.div`
  cursor: pointer;
`;

const PROXY_BASE_URL = combineUrl(
  window.DocSpaceConfig?.proxy?.url,
  "/portal-settings"
);

const TariffBar = () => {
  const navigate = useNavigate();

  const onClick = () => {
    const paymentPageUrl = combineUrl(
      PROXY_BASE_URL,
      "/payments/portal-payments"
    );
    navigate(paymentPageUrl);
  };

  return (
    <StyledWrapper>
      <Text
        fontSize="12px"
        fontWeight={600}
        lineHeight="16px"
        color="#ED7309"
        onClick={onClick}
      >
        Try Business
      </Text>
    </StyledWrapper>
  );
};

export default TariffBar;
