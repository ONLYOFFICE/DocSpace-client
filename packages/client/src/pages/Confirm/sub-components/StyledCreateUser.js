import styled from "styled-components";
import { Box } from "@docspace/shared/components/box";
import { mobile, tablet } from "@docspace/shared/utils";

const DESKTOP_WIDTH = 384;
const TABLET_WIDTH = 480;

// export const ButtonsWrapper = styled.div`
//   display: flex;
//   flex-direction: row;
//   width: 100%;

//   gap: 8px;
//   .buttonWrapper {
//     margin-bottom: 8px;
//     width: 100%;
//   }
// `;

export const ConfirmContainer = styled(Box)`
  width: 100%;
  margin: 56px auto;

  display: flex;
  flex: 1fr;
  flex-direction: column;
  align-items: center;
  gap: 32px;

  @media ${mobile} {
    margin-top: 0;
  }
`;

export const GreetingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: left;
  height: 100%;
  width: ${DESKTOP_WIDTH}px;

  @media ${tablet} {
    width: 100%;
    max-width: ${TABLET_WIDTH}px;
  }

  .tooltip {
    p {
      text-align: center;
    }

    @media ${mobile} {
      padding: 0 25px;
    }
  }

  .docspace-logo {
    width: 100%;
    padding-bottom: 16px;
    height: 26.56px;
    display: flex;
    align-items: center;
    justify-content: center;

    .injected-svg {
      height: 26.56px;
    }
  }
`;

export const RegisterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  width: 100%;

  .or-label {
    text-transform: uppercase;
    margin: 0 8px;
  }

  .more-label {
    padding-top: 18px;
  }

  .line {
    display: flex;
    width: 100%;
    align-items: center;
    color: ${(props) => props.theme.invitePage.borderColor};;
    padding-top: 35px;
    margin-bottom: 32px;
  }

  .line:before,
  .line:after {
    content: "";
    flex-grow: 1;
    background: ${(props) => props.theme.invitePage.borderColor};
    height: 1px;
    font-size: 0px;
    line-height: 0px;
    margin: 0px;
  }

  .auth-form-container {
    width: 100%;

    .password-field{
        margin-bottom: 24px;
    }

    @media ${tablet} {
      width: 100%;
    }
    @media ${mobile} {
      width: 100%;
    }
  }

  .password-field-wrapper {
    width: 100%;
  }

  .signin-container {
    width: 100%;
    margin-top: 24px;
    text-align: center;
  }
}`;
