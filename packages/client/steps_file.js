// (c) Copyright Ascensio System SIA 2010-2024
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

const Endpoints = require("./tests/mocking/endpoints.js");
// in this file you can append custom step methods to 'I' object

module.exports = function () {
  return actor({
    // Define custom steps here, use 'this' to access default methods of I.
    // It is recommended to place a general 'login' function here.

    mockData: function () {
      this.mockEndpoint(Endpoints.self, "self");
      this.mockEndpoint(Endpoints.settings, "settings");
      this.mockEndpoint(Endpoints.build, "build");
      this.mockEndpoint(Endpoints.info, "info");
      this.mockEndpoint(Endpoints.common, "common");
      this.mockEndpoint(Endpoints.cultures, "cultures");
      this.mockEndpoint(Endpoints.fileSettings, "default");
      this.mockEndpoint(Endpoints.capabilities, "capabilities");
      this.mockEndpoint(Endpoints.thirdparty, "thirdparty");
      this.mockEndpoint(Endpoints.thumbnails, "thumbnails");
      this.mockEndpoint(Endpoints.getFolder(1), "1");
    },

    selectAuthor: function () {
      // open author selector
      this.click({ react: "SelectorAddButton" });

      // open "All users" in author selector
      this.forceClick({ name: "selector-row-option-1" });

      // select user with display name 'Administrator'
      this.forceClick({ name: "selector-row-option-1" });
    },

    openArticle: function () {
      this.seeElement({
        react: "styled.div",
        props: { className: "not-selectable", visible: true },
      });
      this.click({
        react: "styled.div",
        props: { className: "not-selectable", visible: true },
      });
    },

    openProfileMenu: function () {
      this.seeElement({
        react: "Avatar",
        props: { className: "icon-profile-menu" },
      });
      this.click({
        react: "Avatar",
        props: { className: "icon-profile-menu" },
      });
    },

    openContextMenu: function () {
      this.seeElement({
        react: "ContextMenuButton",
        props: { className: "expandButton" },
      });
      this.click({
        react: "ContextMenuButton",
        props: { className: "expandButton" },
      });
    },

    switchView: function (type) {
      this.click({
        react: "styled.div",
        key: type,
        props: { isChecked: false },
      });
      this.wait(2);
    },
  });
};
