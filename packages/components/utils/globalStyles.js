import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`

html, body {
  margin: 0;
  background-color: ${(props) => props.theme.backgroundColor};
  color: ${(props) => props.theme.color};
  font-family: ${(props) => props.theme.fontFamily};
  font-size: ${(props) => props.theme.getCorrectFontSize(props.theme.fontSize)};
}

body {
  direction: ${(props) => props.theme.interfaceDirection};
}
`;

export default GlobalStyle;
