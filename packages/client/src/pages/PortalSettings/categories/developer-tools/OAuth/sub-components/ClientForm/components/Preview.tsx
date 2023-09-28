import React from "react";

//@ts-ignore
import Loaders from "@docspace/common/components/Loaders";

//@ts-ignore
import Box from "@docspace/components/box";
//@ts-ignore
import Textarea from "@docspace/components/textarea";
//@ts-ignore
import TabContainer from "@docspace/components/tabs-container";
//@ts-ignore
import SocialButton from "@docspace/components/social-button";

import ImagesLogoSvgUrl from "PUBLIC_DIR/images/logo/leftmenu.svg?url";

import { PreviewProps } from "../ClientForm.types";
import { Frame, CategorySubHeader } from "../ClientForm.styled";

const Preview = ({ clientId, redirectURI, scopes }: PreviewProps) => {
  const getAuthLink = () => {
    const origin = window.location.origin;
    const path = "/oauth2/authorize";

    const params: { [key: string]: string } = {
      response_type: "code",
      client_id: clientId,
      redirect_uri: redirectURI,
      scope: scopes[0],
      code_challenge_method: "S256",
      code_challenge: "ZX8YUY6qL0EweJXhjDug0S2XuKI8beOWb1LGujmgfuQ",
    };

    const paramsString = [];

    for (let key in params) {
      const str = `${key}=${params[key]}`;

      paramsString.push(str);
    }

    const link = `${origin}${path}?${paramsString.join("&")}`;

    return link;
  };

  const onDocSpaceLogin = () => {
    const url = getAuthLink();

    window.open(
      url,
      "login",
      "width=800,height=500,status=no,toolbar=no,menubar=no,resizable=yes,scrollbars=no"
    );
  };

  const preview = (
    <Frame>
      <SocialButton
        iconName={ImagesLogoSvgUrl}
        label={"Sign in with DocSpace"}
        onClick={onDocSpaceLogin}
      />
    </Frame>
  );

  const codeBlock = "123";

  const code = (
    <>
      <CategorySubHeader className="copy-window-code">
        {"Copy window code"}
      </CategorySubHeader>
      <Textarea value={codeBlock} />
    </>
  );

  const dataTabs = [
    {
      key: "preview",
      title: "Preview",
      content: preview,
    },
    {
      key: "code",
      title: "Code",
      content: code,
    },
  ];

  return (
    <div className="preview-container">
      <TabContainer elements={dataTabs} />
    </div>
  );
};

export default Preview;
