import { useRef, useState } from "react";
import { ChatMessageType, FileType } from "../types/chatWidget";
import ChatHeader from "./ChatHeader";
import ChatBody from "./ChatBody";
import ChatFooter from "./ChatFooter";
import { sendMessage } from "../controllers";
import { extractMessageFromOutput } from "./utils";
import { styles } from "./styles";

const { v4: uuidv4 } = require("uuid");

export default function ChatWidget({
  api_key,
  output_type = "chat",
  input_type = "chat",
  output_component,
  host_url,
  flow_id,
  tweaks,
  // online,
  // window_title,
  // placeholder,
  additional_headers,
  session_id,
  list_files,
  provider_image,
  send_icon_image,
  user_icon_image,
  provider_icon_image,
}: {
  api_key?: string;
  input_value: string;
  output_type: string;
  input_type: string;
  output_component?: string;
  // online?: boolean;
  // window_title?: string;
  // placeholder?: string;
  host_url: string;
  flow_id: string;
  tweaks?: { [key: string]: any };
  additional_headers?: { [key: string]: string };
  session_id?: string;
  list_files?: FileType[];
  provider_image?: string;
  send_icon_image?: string;
  user_icon_image?: string;
  provider_icon_image?: string;
}) {
  const sessionId = useRef(session_id ?? uuidv4());
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [footerHeight, setFooterHeight] = useState(62); // TODO: 62

  const addMessage = (message: ChatMessageType) => {
    setMessages((prev) => [...prev, message]);
  };

  const [sendingMessage, setSendingMessage] = useState(false);

  const updateLastMessage = (message: ChatMessageType) => {
    setMessages((prev) => {
      prev[prev.length - 1] = message;
      return [...prev];
    });
  };

  const sendMessageFn = (message: string) => {
    sendMessage(
      host_url,
      flow_id,
      message,
      input_type,
      output_type,
      sessionId,
      output_component,
      tweaks,
      api_key,
      additional_headers
    )
      .then((res) => {
        if (
          res.data &&
          res.data.outputs &&
          Object.keys(res.data.outputs).length > 0 &&
          res.data.outputs[0].outputs &&
          res.data.outputs[0].outputs.length > 0
        ) {
          const flowOutputs: Array<any> = res.data.outputs[0].outputs;
          if (
            output_component &&
            flowOutputs.map((e) => e.component_id).includes(output_component)
          ) {
            Object.values(
              flowOutputs.find((e) => e.component_id === output_component)
                .outputs
            ).forEach((output: any) => {
              addMessage({
                message: extractMessageFromOutput(output),
                isSend: false,
              });
            });
          } else if (flowOutputs.length === 1) {
            Object.values(flowOutputs[0].outputs).forEach((output: any) => {
              addMessage({
                message: extractMessageFromOutput(output),
                isSend: false,
              });
            });
          } else {
            flowOutputs
              .sort((a, b) => {
                // Get the earliest timestamp from each flowOutput's outputs
                const aTimestamp = Math.min(
                  ...Object.values(a.outputs).map((output: any) =>
                    Date.parse(output.message?.timestamp)
                  )
                );
                const bTimestamp = Math.min(
                  ...Object.values(b.outputs).map((output: any) =>
                    Date.parse(output.message?.timestamp)
                  )
                );
                return aTimestamp - bTimestamp; // Sort descending (newest first)
              })
              .forEach((flowOutput) => {
                Object.values(flowOutput.outputs).forEach((output: any) => {
                  addMessage({
                    message: extractMessageFromOutput(output),
                    isSend: false,
                  });
                });
              });
          }
        }
        if (res.data && res.data.session_id) {
          sessionId.current = res.data.session_id;
        }
        setSendingMessage(false);
      })
      .catch((err) => {
        const response = err.response;
        if (err.code === "ERR_NETWORK") {
          // updateLastMessage({
          //   message: "Network error",
          //   isSend: false,
          //   error: true,
          // });

          addMessage({
            message: "Network error",
            isSend: false,
          });
        } else if (
          response &&
          response.status === 500 &&
          response.data &&
          response.data.detail
        ) {
          updateLastMessage({
            message: response.data.detail,
            isSend: false,
            error: true,
          });
        }
        console.error(err);
        setSendingMessage(false);
      });
  };

  const bodyHeight = `calc(100vh - 48px - 54px - ${footerHeight}px)`; // 48 = 44(padding)22+22 + 2 border + 54 header

  return (
    <div>
      <style
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      ></style>
      <div className="chat-panel-wrapper">
        <div className="chat-panel">
          <ChatHeader />
          <div
            className="scrollbar"
            style={{
              position: "relative",
              width: "100%",
              minWidth: "100%",
              height: bodyHeight,
              minHeight: bodyHeight,
              maxHeight: bodyHeight,
            }}
          >
            <ChatBody
              messages={messages}
              providerImage={provider_image}
              providerIconImage={provider_icon_image}
              userIconImage={user_icon_image}
            />
            {sendingMessage && (
              <div className="chat-panel-loading-placeholder">
                <h1 className="chat-panel-loading-placeholder-ellipsis"> </h1>
              </div>
            )}
          </div>
          <ChatFooter
            setFooterHeight={setFooterHeight}
            addMessage={addMessage}
            sendMessage={sendMessageFn}
            filesList={list_files}
            sendIconImage={send_icon_image}
          />
        </div>
      </div>
    </div>
  );
}
