// (c) Copyright Ascensio System SIA 2009-2024
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

const excludeGeneralOptions = ["select", "show-info"];
const excludeRoomOptions = ["separator0", "room-info"];

class ContextHelper {
  constructor(props) {
    this.t = props.t;
    this.isUser = props.isUser;
    this.selection = props.selection;
    this.setBufferSelection = props.setBufferSelection;
    this.getUserContextOptions = props.getUserContextOptions;
    this.getContextOptionActions = props.getContextOptionActions;

    if (this.selection) this.fixItemContextOptions();
  }

  fixItemContextOptions = () => {
    if (this.isUser) {
      if (!this.selection?.options) return;
      const newOptions = this.selection.options.filter(
        (option) => option !== "details"
      );
      this.selection.options = newOptions;
      return;
    }

    const options = this.getContextOptions(this.selection, true);

    excludeGeneralOptions.forEach((excludeOption) => {
      const idx = options.findIndex((o) => o === excludeOption);
      if (idx !== -1) options.splice(idx, 1);
    });

    if (this.selection?.isRoom) {
      excludeRoomOptions.forEach((excludeOption) => {
        const idx = options.findIndex((o) => o === excludeOption);
        if (idx !== -1) options.splice(idx, 1);
      });



    const length = options.length;

    options.forEach((item, index) => {
      if (
        (index !== length - 1 &&
          item.includes("separator") &&
          options[index + 1].includes("separator")) ||
        (index === 0 && item.includes("separator")) ||
        (index === length - 1 && item.includes("separator"))
      ) {
        options.splice(index, 1);
      }
    });

    // const showInfoIndex = options.findIndex((i) => i === "show-info");
    // const lastIndex = options.length - 1;
    // const isLastIndex = showInfoIndex === lastIndex;

    // if (!showInfoIndex && options[1].includes("separator"))
    //   options = options.slice(2);
    // else if (isLastIndex && options[lastIndex - 1].includes("separator"))
    //   options = options.slice(0, -2);
    // else options = options.filter((i) => i !== "show-info");

    this.selection.contextOptions = options;
  };

  getItemContextOptions = () => {
    if (this.isUser) {
      return this.getUserContextOptions(
        this.t,
        this.selection.options || [],
        this.selection
      );
    }

    return this.getContextOptionActions(this.selection, this.t, true);
  };
}

export default ContextHelper;
