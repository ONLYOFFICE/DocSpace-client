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

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeMathjax from "rehype-mathjax";

import AIChatImage from "../images/ai.bot32.svg";
import { ChatMessageType } from "../types/chatWidget";

type AIChatMessageProps = {
  message: ChatMessageType;
  userData: { displayName: string; avatarImg: string };
};

const ChatMessage = ({ message, userData }: AIChatMessageProps) => {
  return (
    <div className="chat-message-container">
      {message.isSend ? (
        <>
          <div className="chat-message-user">
            <div className="chat-message-user-avatar-wrapper">
              <img src={userData.avatarImg} alt="" />
            </div>

            <p className="chat-message-user-name">{userData.displayName}</p>
          </div>

          <p className="chat-message-user-message">{message.message}</p>
        </>
      ) : (
        <>
          <div className="chat-message-user">
            <img className="no-thumbnail-img" src={AIChatImage} alt="No item" />
            <p className="chat-message-user-name">ChatGPT</p>
          </div>

          <div className="chat-message-user-message">
            <Markdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeMathjax]}
            >
              {message.message}
            </Markdown>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatMessage;
