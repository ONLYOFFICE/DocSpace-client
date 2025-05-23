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

import React from "react";

import Members from "../views/Members";
import History from "../views/History";
import Details from "../views/Details";
import Gallery from "../views/Gallery";
import Users from "../views/Users";
import NoItem from "../views/NoItem";
import SeveralItems from "../views/SeveralItems";
import Share from "../views/Share";
import Plugin from "../views/Plugin";
import Groups from "../views/Groups";

class ViewHelper {
  constructor(props) {
    this.defaultProps = props.defaultProps;
    this.membersProps = props.membersProps;
    this.historyProps = props.historyProps;
    this.detailsProps = props.detailsProps;
    this.usersProps = props.usersProps;
    this.groupsProps = props.groupsProps;
    this.galleryProps = props.galleryProps;
    this.pluginProps = props.pluginProps;
  }

  MembersView = () => {
    return <Members {...this.defaultProps} {...this.membersProps} />;
  };

  HistoryView = () => {
    return <History {...this.defaultProps} {...this.historyProps} />;
  };

  DetailsView = () => {
    return <Details {...this.defaultProps} {...this.detailsProps} />;
  };

  ShareView = () => {
    return <Share {...this.defaultProps} />;
  };

  UsersView = () => {
    return <Users {...this.defaultProps} {...this.usersProps} />;
  };

  GroupsView = () => {
    return <Groups {...this.defaultProps} {...this.groupsProps} />;
  };

  GalleryView = () => {
    return <Gallery {...this.defaultProps} {...this.galleryProps} />;
  };

  NoItemView = () => {
    return <NoItem {...this.defaultProps} />;
  };

  SeveralItemsView = () => {
    return <SeveralItems {...this.defaultProps} />;
  };

  PluginView = () => {
    return <Plugin {...this.pluginProps} />;
  };
}

export default ViewHelper;
