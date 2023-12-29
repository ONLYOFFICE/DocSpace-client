import React from "react";
//@ts-ignore

import { RectangleSkeleton } from "@docspace/shared/skeletons";

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
        <RectangleSkeleton width="50%" height="22px" />
        <RectangleSkeleton width="28px" height="16px" />
        <RectangleSkeleton
          className="external-links-loader__description"
          height="16px"
        />
      </ExternalLinksLoaderWrapper>
      <InviteInputLoaderWrapper>
        <InviteInputLoaderHeaderWrapper>
          <RectangleSkeleton width="115px" height="22px" />
          <RectangleSkeleton width="100px" height="19px" />
        </InviteInputLoaderHeaderWrapper>
        <RectangleSkeleton width="100%" height="32px" />
        <InviteInputLoaderFooterWrapper>
          <RectangleSkeleton height="32px" />
          <RectangleSkeleton width="90px" height="32px" />
        </InviteInputLoaderFooterWrapper>
      </InviteInputLoaderWrapper>
    </InvitePanelLoaderWrapper>
  );
}

export default InvitePanelLoader;
