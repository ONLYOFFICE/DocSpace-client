// // (c) Copyright Ascensio System SIA 2009-2024
// //
// // This program is a free software product.
// // You can redistribute it and/or modify it under the terms
// // of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// // Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// // to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// // any third-party rights.
// //
// // This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// // of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// // the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
// //
// // You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
// //
// // The  interactive user interfaces in modified source and object code versions of the Program must
// // display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
// //
// // Pursuant to Section 7(b) of the License you must retain the original Product logo when
// // distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// // trademark law for use of our trademarks.
// //
// // All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// // content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// // International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

// import styled from "styled-components";
// import { injectDefaultTheme, mobile, tablet } from "../../utils";

// const InputWrapper = styled.div.attrs(injectDefaultTheme)`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   direction: ltr;
//   input {
//     height: 120px;
//     width: 100px;
//     display: block;
//     background: ${(props) => props.theme.codeInput.background};
//     border: ${(props) => props.theme.codeInput.border};
//     color: ${(props) => props.theme.codeInput.color};
//     box-sizing: border-box;
//     border-radius: 8px;
//     margin: 0 4px;
//     text-align: center;
//     font-size: 72px;

//     @media ${tablet} {
//       height: 76px;
//       width: 64px;
//       font-size: 48px;
//     }

//     @media ${mobile} {
//       height: 48px;
//       width: 40px;
//       font-size: 32px;
//     }

//     &:last-child {
//       margin: 0;
//     }
//   }

//   input:focus {
//     border: ${(props) => props.theme.codeInput.focusBorder};
//     outline: none;
//   }

//   input:disabled {
//     color: ${(props) => props.theme.codeInput.disabledColor};
//     background: ${(props) => props.theme.codeInput.disabledBackground};
//     border: ${(props) => props.theme.codeInput.disabledBorder};
//     outline: none;
//   }

//   hr {
//     width: 24px;
//     height: 1px;
//     background: ${(props) => props.theme.codeInput.lineColor};
//     border: none;
//     margin: 0 16px;

//     @media ${mobile} {
//       margin: 0 4px;
//     }
//   }
//   :placeholder-shown {
//     direction: ltr;
//   }
// `;

// export default InputWrapper;
