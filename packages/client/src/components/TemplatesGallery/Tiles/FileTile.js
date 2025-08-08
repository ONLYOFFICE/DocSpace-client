// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import styled, { css } from "styled-components";

const Styled = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid blue;

  .thumbnail-container {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid #dfe2e3;
    margin: 10px 10px 0 10px;

    ${(props) =>
      props.smallPreview &&
      css`
        align-items: flex-start;
      `}
  }

  .thumbnail-image {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;

    ${(props) =>
      props.smallPreview &&
      css`
        width: 100%;
        height: auto;
        object-fit: cover;
        object-position: top;
      `}
  }

  .name {
    height: 38px;
    width: 100%;
    box-sizing: border-box;
    padding: 8px 10px 10px 10px;
  }

  .name-text {
    font-weight: 600;
    font-size: 13px;
    line-height: 20px;
    color: #555f65;
  }
`;

const FileTile = ({ item, smallPreview }) => {
  const previewSrc = item?.attributes.card_prewiew.data?.attributes.url;

  return (
    <Styled smallPreview={smallPreview}>
      <div className="thumbnail-container">
        <img
          src={previewSrc}
          className="thumbnail-image"
          alt="Thumbnail-img"
          data-testid="template-thumbnail"
        />
      </div>
      <div className="name">
        <div className="name-text" title={item.attributes.name_form}>
          {item.attributes.name_form}
        </div>
      </div>
    </Styled>
  );
};

export default FileTile;
