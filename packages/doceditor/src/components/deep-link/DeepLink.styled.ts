import styled from "styled-components";
import { mobile } from "@docspace/shared/utils";
import { Base } from "@docspace/shared/themes";

export const StyledSimpleNav = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  background-color: ${(props) => props.theme?.deepLink?.navBackground};
  margin-bottom: 32px;
`;

StyledSimpleNav.defaultProps = { theme: Base };

export const StyledDeepLink = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  z-index: 1;

  @media ${mobile} {
    width: calc(100% - 32px);
  }
`;

export const StyledBodyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;

  .title {
    font-size: 16px;
    font-weight: 600;
    line-height: 22px;

    @media ${mobile} {
      font-size: 23px;
      font-weight: 700;
      line-height: 28px;
    }
  }
`;

export const StyledFileTile = styled.div`
  display: flex;
  gap: 16px;
  padding: 8px 16px;
  background-color: ${(props) => props.theme?.deepLink?.fileTileBackground};
  border-radius: 3px;
  align-items: center;
`;

StyledFileTile.defaultProps = { theme: Base };

export const StyledActionsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  .stay-link {
    text-align: center;
  }
`;

export const BgBlock = styled.div<{ bgPattern: string }>`
  background-image: ${(props) => props.bgPattern};
  background-repeat: no-repeat;
  background-attachment: fixed;
  background-size: cover;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 0;

  @media ${mobile} {
    background-image: none;
  }
`;

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 56px auto;
  max-width: 960px;
  width: 100vw;

  @media ${mobile} {
    margin: 0 auto;
  }
`;

export const LogoWrapper = styled.div`
  width: 386px;
  height: 44px;
  margin-top: auto;
  margin-bottom: 64px;

  @media ${mobile} {
    display: none;
  }
`;
