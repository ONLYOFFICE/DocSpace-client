import r2wc from "@r2wc/react-to-web-component";
import ChatWidget from "./chatWidget";

customElements.define(
  "langflow-chat-widget",
  r2wc(ChatWidget, {
    shadow: "closed",
    props: {
      api_key: "string",
      output_type: "string",
      input_type: "string",
      output_component: "string",
      host_url: "string",
      flow_id: "string",
      tweaks: "json",
      // online: "boolean",
      // window_title: "string",
      // placeholder: "string",
      // additional_headers: "json",
      session_id: "string",
      list_files: "json",
      provider_image: "string",
      send_icon_image: "string",
      user_icon_image: "string",
      provider_icon_image: "string",
      interface_theme: "string",
      interface_direction: "string",
      header_text: "string",
      empty_screen_text: "string",
      placeholder_text: "string",
      placeholder_sending: "string",
      chat_user_name: "string",
      chat_provider_name: "string",
      popup_view: "string",
    },
  })
);
