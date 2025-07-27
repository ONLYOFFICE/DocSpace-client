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

import styled from "styled-components";

const Styled = styled.div`
  width: 100%;
  height: 100%;
  margin-bottom: 16px;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid blue;

  .thumbnail-container {
    flex: 1; /* Take available space */
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  .thumbnail-image {
    max-width: 100%;
    max-height: 100%;
    width: auto;
    height: auto;
    object-fit: contain;
    vertical-align: middle;
  }

  .name {
    height: 38px;
    width: 100%;
    box-sizing: border-box;
    font-weight: 600;

    padding: 8px 10px 10px 10px;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    word-break: break-word;
  }
`;

const FileTile = ({ item }) => {
  const previewSrc = item?.attributes.card_prewiew.data?.attributes.url;

  return (
    <Styled>
      <div className="thumbnail-container">
        <img
          src={previewSrc}
          className="thumbnail-image"
          alt="Thumbnail-img"
          data-testid="template-thumbnail"
        />
      </div>

      <div className="name">{item.attributes.name_form}</div>
    </Styled>
  );

  // return (
  //   <div ref={selectableRef}>
  //     <Tile key={item.id} item={item}>
  //       <SimpleFilesTileContent>
  //         <Link
  //           className="item-file-name"
  //           containerWidth="100%"
  //           type="page"
  //           fontWeight="600"
  //           fontSize={isDesktop() ? "13px" : "14px"}
  //           target="_blank"
  //           isTextOverflow
  //         >
  //           {item.attributes.name_form}
  //         </Link>
  //       </SimpleFilesTileContent>
  //     </Tile>
  //   </div>
  // );
};

export default FileTile;
