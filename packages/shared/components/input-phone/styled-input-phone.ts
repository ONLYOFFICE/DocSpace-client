// import Box from "../box";
// import styled, { css } from "styled-components";
// import Base from "../themes/base";

// export const StyledBox = styled(Box)`
//   position: relative;
//   width: ${(props) => (props.scaled ? "100%" : props.theme.inputPhone.width)};
//   border: 1px solid
//     ${(props) =>
//       props.hasError
//         ? props.theme.inputPhone.errorBorderColor
//         : props.theme.inputPhone.inactiveBorderColor};
//   border-radius: 3px;
//   :focus-within {
//     border-color: ${(props) =>
//       props.hasError
//         ? props.theme.inputPhone.errorBorderColor
//         : props.theme.inputPhone.activeBorderColor};
//   }

//   .country-box {
//     width: 57px;
//     height: 44px;
//     padding: 0;
//     background: ${(props) => props.theme.inputPhone.backgroundColor};
//     border-radius: 3px;
//   }

//   .input-phone {
//     height: ${(props) => props.theme.inputPhone.height};
//     direction: ltr;
//     padding-left: 20px;
//     margin-left: -8px;
//     border-left: 1px solid
//       ${(props) => props.theme.inputPhone.inactiveBorderColor};

//     ${(props) =>
//       props.theme.interfaceDirection === "rtl" &&
//       css`
//         margin-left: 0;
//         padding-right: 20px;
//         border-left: 0;
//         border-top-right-radius: 0;
//         border-bottom-right-radius: 0;
//         border-right: 1px solid
//           ${(props) => props.theme.inputPhone.inactiveBorderColor};
//       `}
//     border-top-left-radius: 0;
//     border-bottom-left-radius: 0;
//     background: ${(props) => props.theme.inputPhone.backgroundColor};
//   }

//   .prefix {
//     position: relative;
//     top: 0;
//     left: 12px;

//     font-size: ${(props) => props.theme.getCorrectFontSize("14px")};
//     font-weight: 400;
//   }

//   .combo-button {
//     width: 100%;
//     height: 100%;
//     border-right: 0;
//     border-top-right-radius: 0;
//     border-bottom-right-radius: 0;
//     cursor: pointer;
//     padding-left: 0;

//     .invalid-flag {
//       width: 26px;
//       height: 20px;
//       margin-left: 6px;
//       ${(props) =>
//         props.theme.interfaceDirection === "rtl" &&
//         css`
//           margin-left: 0px;
//           margin-right: 6px;
//         `}
//       margin-top: 9px;
//     }

//     .forceColor {
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       margin-right: 0;
//       width: 100%;
//       height: 100%;
//       svg {
//         path:last-child {
//           fill: none;
//         }
//       }
//     }
//   }

//   .combo-button_selected-icon {
//     height: 36px;
//     width: 36px;
//     margin-right: 6px;
//   }

//   .combo-buttons_arrow-icon {
//     cursor: pointer;
//     margin: 0;
//     position: absolute;
//     top: 20px;
//     right: 8px;
//     ${(props) =>
//       props.theme.interfaceDirection === "rtl" &&
//       css`
//         left: 8px;
//         right: auto;
//       `}
//     svg {
//       path {
//         fill: ${(props) => props.theme.inputPhone.placeholderColor};
//       }
//     }
//   }

//   .drop-down {
//     padding: 12px 16px;
//     box-sizing: border-box;
//     margin-top: 5px;
//     outline: 1px solid ${(props) => props.theme.inputPhone.inactiveBorderColor};
//     border-radius: 3px;
//     box-shadow: none;
//   }

//   .search-country_input {
//     .search-input-block {
//       font-weight: 400;
//       border-color: ${(props) => props.theme.inputPhone.inactiveBorderColor};
//       :focus-within {
//         border-color: ${(props) => props.theme.inputPhone.activeBorderColor};
//       }
//       ::placeholder {
//         color: ${(props) => props.theme.inputPhone.placeholderColor};
//       }
//     }
//   }

//   .country-name {
//     margin-left: 10px;
//     ${(props) =>
//       props.theme.interfaceDirection === "rtl" &&
//       css`
//         margin-left: 0px;
//         margin-right: 10px;
//       `}
//     color: ${(props) => props.theme.inputPhone.color};
//   }

//   .country-prefix {
//     margin-left: 5px;
//     ${(props) =>
//       props.theme.interfaceDirection === "rtl" &&
//       css`
//         margin-left: 0px;
//         margin-right: 5px;
//       `}
//     color: ${(props) => props.theme.inputPhone.dialCodeColor};
//   }

//   .country-dialcode {
//     color: ${(props) => props.theme.inputPhone.dialCodeColor};
//   }

//   .country-item {
//     display: flex;
//     align-items: center;

//     max-width: 100%;
//     padding: 0;
//     height: 36px;
//     svg {
//       width: 36px !important;
//       height: 36px !important;
//     }

//     .drop-down-icon > div {
//       height: 36px;
//     }

//     .drop-down-icon {
//       width: 36px;
//       height: 36px;
//       margin-right: 0;
//       svg {
//         path:last-child {
//           fill: none;
//         }
//       }
//     }
//   }

//   .phone-input_empty-text {
//     padding: 30px 0;
//     word-break: break-all;
//     color: ${(props) => props.theme.inputPhone.placeholderColor};
//   }

//   .nav-thumb-vertical {
//     background: ${(props) => props.theme.inputPhone.placeholderColor};
//     cursor: pointer;
//     :hover {
//       background: ${(props) => props.theme.inputPhone.scrollBackground};
//     }
//   }

//   .phone-input_error-text {
//     position: absolute;
//     word-break: break-all;
//     top: 48px;
//   }
// `;

// StyledBox.defaultProps = { theme: Base };
