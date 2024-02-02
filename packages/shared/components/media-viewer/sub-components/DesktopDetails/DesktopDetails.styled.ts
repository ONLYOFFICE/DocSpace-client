import styled from "styled-components";

export const DesktopDetailsContainer = styled.div`
  padding-top: 21px;
  height: 64px;
  width: 100%;
  background: linear-gradient(
    0deg,
    rgba(0, 0, 0, 0) 0%,
    rgba(0, 0, 0, 0.8) 100%
  );

  position: fixed;
  top: 0;
  left: 0;
  z-index: 307;

  .title {
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    font-size: 20px;
    font-weight: 600;
    text-overflow: ellipsis;
    width: calc(100% - 50px);

    ${({ theme }) =>
      theme.interfaceDirection === "rtl"
        ? `padding-right: 16px;`
        : `padding-left: 16px;`}
    box-sizing: border-box;
    color: ${(props) => props.theme.mediaViewer.titleColor};
  }
`;
