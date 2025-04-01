import React, { useState, useLayoutEffect } from "react";
import { inject, observer } from "mobx-react";
// import { useTheme } from "styled-components";

// import { getCookie } from "@docspace/shared/utils";
import { DeviceType } from "@docspace/shared/enums";
import Chat from "@docspace/shared/components/chat";

// // import CrossReactSvgUrl from "PUBLIC_DIR/images/icons/17/cross.react.svg?url";
// import SendIconReactSvgUrl from "PUBLIC_DIR/images/send-message.svg?url";
// import ProviderIconImageUrl from "PUBLIC_DIR/images/icons/32/ai.bot32.svg?url";
// import UserIconImageUrl from "PUBLIC_DIR/images/avatar.base.react.svg?url";
// import ProviderImageUrl from "PUBLIC_DIR/images/ai.bot.svg?url";

import { ChatTypes } from "./Chat.types";

const ChatView = ({ currentDeviceType }: ChatTypes) => {
  const [height, setHeight] = useState(0);
  // const [isLoading, setIsLoading] = useState(false);

  useLayoutEffect(() => {
    let curHeight = window.innerHeight - 24;

    if (currentDeviceType === DeviceType.desktop) {
      curHeight -= 121;

      setHeight(curHeight);

      return;
    }

    if (currentDeviceType === DeviceType.mobile) {
      curHeight -= 170;
      setHeight(curHeight);

      return;
    }

    if (currentDeviceType === DeviceType.tablet) {
      curHeight -= 106;
      setHeight(curHeight);
    }
  }, [currentDeviceType]);

  // const { interfaceDirection, isBase } = useTheme();

  // const currentFolder = items[0]?.folderId || "";

  // const chat = createElement("langflow-chat-widget", {
  //   // api_key: "string",
  //   // output_type: "string",
  //   // input_type: "string",
  //   // output_component: "string",
  //   // host_url: "string",
  //   // flow_id: "string",
  //   // tweaks: "json",
  //   // output_type: "string",
  //   // input_type: "string",
  //   // output_component: "string",
  //   // tweaks: tweaks || undefined,
  //   host_url: window.location.origin,
  //   bearer_token: getCookie("access_token_lf"),
  //   // additional_headers={undefined}
  //   session_id: "",
  //   api_key: getCookie("chat_api_key") || undefined,
  //   flow_id: getCookie("docspace_ai_chat") || undefined,
  //   list_files: JSON.stringify(items),
  //   provider_image: ProviderImageUrl,
  //   user_icon_image: UserIconImageUrl,
  //   provider_icon_image: ProviderIconImageUrl,
  //   send_icon_image: SendIconReactSvgUrl,
  //   interface_theme: isBase ? "light" : "dark",
  //   interface_direction: interfaceDirection,
  //   header_text: "DocSpace AI chat", // TODO: AI tranlstion
  //   empty_screen_text: "How can I help you today?", // TODO: AI tranlstion
  //   placeholder_text: "Message ...", // TODO: AI tranlstion
  //   chat_user_name: "Me", // TODO: AI tranlstion
  //   chat_provider_name: "AI", // TODO: AI tranlstion
  //   current_folder: currentFolder,
  //   set_loading: setIsLoading,
  // });

  return (
    <div style={{ height: `${height}px` }}>
      <Chat />
    </div>
  );
};

export default inject(
  ({
    flowStore,
    settingsStore,
  }: {
    flowStore: unknown;
    settingsStore: unknown;
  }) => {
    const { vectorizedFiles } = flowStore as { vectorizedFiles: unknown };
    const { currentDeviceType } = settingsStore as {
      currentDeviceType: unknown;
    };

    return { items: vectorizedFiles, currentDeviceType };
  },
)(observer(ChatView));
