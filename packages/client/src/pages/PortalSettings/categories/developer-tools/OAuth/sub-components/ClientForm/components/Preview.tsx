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

  const htmlBlock = `<button id="docspace-button" class="docspace-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none" class="injected-svg logo-svg"
            data-src="http://192.168.0.15/static/js/../../static/images/logo/leftmenu.svg?hash=c31b569ea8c6322337cd"
            xmlns:xlink="http://www.w3.org/1999/xlink">
            <path fill-rule="evenodd" clip-rule="evenodd"
            d="M12.411 25.7059L1.68526 20.7649C0.771581 20.3335 0.771581 19.6669 1.68526 19.2748L5.4194 17.5493L12.3713 20.7649C13.285 21.1963 14.7548 21.1963 15.6287 20.7649L22.5806 17.5493L26.3147 19.2748C27.2284 19.7061 27.2284 20.3728 26.3147 20.7649L15.589 25.7059C14.7548 26.0981 13.285 26.0981 12.411 25.7059Z"
            fill="#FF6F3D"></path>
            <path fill-rule="evenodd" clip-rule="evenodd"
            d="M12.3762 19.5917L1.68317 14.6449C0.772277 14.213 0.772277 13.5456 1.68317 13.153L5.32673 11.4648L12.3762 14.7234C13.2871 15.1553 14.7525 15.1553 15.6238 14.7234L22.6733 11.4648L26.3168 13.153C27.2277 13.5849 27.2277 14.2523 26.3168 14.6449L15.6238 19.5917C14.7129 20.0235 13.2475 20.0235 12.3762 19.5917Z"
            fill="#95C038"></path>
            <path fill-rule="evenodd" clip-rule="evenodd"
            d="M12.3762 13.5408L1.68317 8.66521C0.772277 8.23956 0.772277 7.58175 1.68317 7.1948L12.3762 2.31923C13.2871 1.89359 14.7525 1.89359 15.6238 2.31923L26.3168 7.1948C27.2277 7.62044 27.2277 8.27826 26.3168 8.66521L15.6238 13.5408C14.7129 13.9277 13.2475 13.9277 12.3762 13.5408Z"
            fill="#5DC0E8"></path>
        </svg>
        Sign in with DocSpace
    </button>`;

  const styleBlock = `.docspace-button {
        width: auto;
        padding: 0 20px;

        display: flex;
        flex-direction: row;
        align-items: center;
        text-decoration: none;
        border-radius: 2px;

        height: 40px;

        border: none;
        stroke: none;
        background: #ffffff;
        box-shadow: rgba(0, 0, 0, 0.24) 0px 1px 1px, rgba(0, 0, 0, 0.12) 0px 0px 1px;

        color: rgb(163, 169, 174);

        font-weight: 600;
        font-size: 14px;
        line-height: 14px;
        user-select: none;

        font-family: Roboto, "Open Sans", sans-serif, Arial;
    }

    .docspace-button:hover {
        box-shadow: rgba(0, 0, 0, 0.24) 0px 1px 1px, rgba(0, 0, 0, 0.12) 0px 0px 1px;
        cursor: pointer;
        color: #333333;
    }

    .logo-svg {
        width: 18px;
        min-width: 18px;
        height: 18px;
        min-height: 18px;

        margin: 11px 16px;
    }
`;

  const url = getAuthLink();

  const scriptCode = `const button = document.getElementById('docspace-button')

    function openOAuthPage() {
        window.open(
            "${url}",
            "login",
            "width=800,height=500,status=no,toolbar=no,menubar=no,resizable=yes,scrollbars=no"
        );
    }

  button.addEventListener('click', openOAuthPage)`;

  const code = (
    <>
      <CategorySubHeader className="copy-window-code">
        {"Copy HTML code"}
      </CategorySubHeader>
      <Textarea value={htmlBlock} />
      <CategorySubHeader className="copy-window-code">
        {"Copy CSS code"}
      </CategorySubHeader>
      <Textarea value={styleBlock} />
      <CategorySubHeader className="copy-window-code">
        {"Copy JS code"}
      </CategorySubHeader>
      <Textarea value={scriptCode} />
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
