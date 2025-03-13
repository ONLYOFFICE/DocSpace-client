declare namespace JSX {
  interface IntrinsicElements {
    "langflow-chat-widget": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        host_url?: string;
        flow_id?: string;
        list_files?: string;
        provider_image?: string;
        user_icon_image?: string;
        provider_icon_image?: string;
        send_icon_image?: string;
        interface_theme?: string;
        interface_direction?: string;
        header_text?: string;
        empty_screen_text?: string;
        placeholder_text?: string;
        chat_user_name?: string;
        chat_provider_name?: string;
        bearer_token?: string;
        additional_headers?: object;
        session_id?: string;
        tweaks?: string;
        // Add any other props that the component accepts
      },
      HTMLElement
    >;
  }
}
