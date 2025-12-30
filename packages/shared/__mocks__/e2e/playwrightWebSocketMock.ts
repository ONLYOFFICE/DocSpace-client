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

import type { Page, WebSocketRoute } from "@playwright/test";
import { ExportChatEventData, TOptSocket } from "../../utils/socket";

type ServerMessage =
  | string
  | [string, unknown?]
  | unknown[]
  | Record<string, unknown>;

type SocketEventData =
  | TOptSocket
  | ExportChatEventData
  | { roomParts: string | string[] }
  | { message: string };

export class PlaywrightWebSocketMock {
  private wsRoute: WebSocketRoute | null = null;
  private isConnected = false;

  constructor(private page: Page) {}

  async setupWebSocketMock(wsUrl: string = "**/socket.io/**"): Promise<void> {
    console.log("[WebSocket Mock] Setting up WebSocket route for:", wsUrl);

    await this.page.routeWebSocket(wsUrl, (ws) => {
      console.log("[WebSocket Mock] WebSocket route handler triggered");
      this.wsRoute = ws;
      this.isConnected = true;

      this.sendToClient(
        {
          sid: "1",
          upgrades: [],
          pingInterval: 25000,
          pingTimeout: 20000,
          maxPayload: 1000000,
        },
        "0",
      );
      this.sendToClient({ sid: "2" }, "40");
      this.sendToClient(["connection-init"], "42");

      ws.onMessage((message) => {
        console.log("[WebSocket Mock] Received from page:", message);
      });

      ws.onClose((code, reason) => {
        console.log("[WebSocket Mock] Connection closed:", code, reason);
        this.isConnected = false;
      });
    });
  }

  private sendToClient(message: ServerMessage, prefix: string = "42"): void {
    console.log(message, this.wsRoute, this.isConnected);
    if (this.wsRoute && this.isConnected) {
      const messageStr =
        typeof message === "string" ? message : JSON.stringify(message);
      this.wsRoute.send(prefix + messageStr);
    }
  }

  emitSocketEvent(event: string, data?: SocketEventData): void {
    const socketIOMessage = data ? [event, data] : [event];
    this.sendToClient(socketIOMessage);
  }

  emitModifyFolder(data: TOptSocket): void {
    this.emitSocketEvent("s:modify-folder", data);
  }

  emitExportChat(data: ExportChatEventData): void {
    this.emitSocketEvent("s:export-chat", data);
  }

  isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  closeConnection(code?: number, reason?: string): void {
    if (this.wsRoute) {
      try {
        this.wsRoute.close(code ? { code, reason } : undefined);
      } catch (error) {
        console.log("[WebSocket Mock] Error closing connection:", error);
      }
      this.isConnected = false;
      this.wsRoute = null;
    }
  }
}
