/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import type { Page, WebSocketRoute } from "@playwright/test";
import { ExportChatEventData, TOptSocket } from "@docspace/ui-kit/utils/socket";

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
