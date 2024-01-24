import React from "react";

import Members from "../views/Members";
import History from "../views/History";
import Details from "../views/Details";
import Gallery from "../views/Gallery";
import Accounts from "../views/Accounts";
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
    this.accountsProps = props.accountsProps;
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

  AccountsView = () => {
    return <Accounts {...this.defaultProps} {...this.accountsProps} />;
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
