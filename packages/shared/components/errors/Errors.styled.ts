import styled from "styled-components";
import { mobile } from "../../utils";

export const ErrorUnavailableWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 64px;
`;

export const Error520Wrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 16px;

  @media ${mobile} {
    justify-content: start;
  }

  .container {
    height: auto !important;
  }

  .logo {
    margin-bottom: 28px;
  }

  .link {
    margin-top: 24px;
  }

  #customized-text {
    max-width: 480px;
    text-align: center;
  }
`;

export const AccessRestrictedWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 64px;
`;
