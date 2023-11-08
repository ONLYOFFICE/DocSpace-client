import React from "react";
//@ts-ignore

import Loaders from "@docspace/common/components/Loaders";

import {
  ExternalLinksLoaderWrapper,
  InviteInputLoaderFooterWrapper,
  InviteInputLoaderHeaderWrapper,
  InviteInputLoaderWrapper,
  InvitePanelLoaderWrapper,
} from "./InvitePanelLoader.styled";

function InvitePanelLoader() {
  return (
    <InvitePanelLoaderWrapper>
      <ExternalLinksLoaderWrapper>
        <Loaders.Rectangle width="50%" height="22px" />
        <Loaders.Rectangle width="28px" height="16px" />
        <Loaders.Rectangle
          className="external-links-loader__description"
          height="16px"
        />
      </ExternalLinksLoaderWrapper>
      <InviteInputLoaderWrapper>
        <InviteInputLoaderHeaderWrapper>
          <Loaders.Rectangle width="115px" height="22px" />
          <Loaders.Rectangle width="100px" height="19px" />
        </InviteInputLoaderHeaderWrapper>
        <Loaders.Rectangle width="100%" height="32px" />
        <InviteInputLoaderFooterWrapper>
          <Loaders.Rectangle height="32px" />
          <Loaders.Rectangle width="90px" height="32px" />
        </InviteInputLoaderFooterWrapper>
      </InviteInputLoaderWrapper>
    </InvitePanelLoaderWrapper>
  );
}

export default InvitePanelLoader;
