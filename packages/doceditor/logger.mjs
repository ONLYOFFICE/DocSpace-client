// (c) Copyright Ascensio System SIA 2009-2024
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

import pino from "pino";
import os from "os";
import { randomUUID } from "crypto";

import config from "./config/index.mjs";

const INTERVAL = 5000;
const MAX_FILE_COUNT = 30;

const formatters = {
  level(label) {
    return { level: label };
  },
};

const timestamp = () => `,"date":"${new Date(Date.now()).toISOString()}"`;

const getLogger = () => {
  if (process.env["NODE_ENV"] !== "development") {
    const aws = config.get("aws");

    if (aws?.cloudWatch.accessKeyId) {
      const {
        accessKeyId,
        secretAccessKey,
        region,
        logGroupName,
        logStreamName,
      } = aws?.cloudWatch;

      const streamName = logStreamName
        .replace("${hostname}", os.hostname())
        .replace("${applicationContext}", "Doceditor")
        .replace("${guid}", randomUUID())
        .replace("${date}", new Date().toLocaleString());

      return pino({
        level: "info",
        formatters,
        timestamp,
        transport: {
          target: "@serdnam/pino-cloudwatch-transport",
          options: {
            logGroupName,
            logStreamName: streamName,
            awsRegion: region,
            awsAccessKeyId: accessKeyId,
            awsSecretAccessKey: secretAccessKey,
            interval: INTERVAL, // this is the default
          },
        },
      });
    }

    const logPath = config.get("logPath");

    return pino({
      level: "info",
      formatters,
      base: undefined,
      timestamp,
      transport: {
        target: "pino-roll",
        options: {
          file: `${logPath}/web.doceditor`,
          frequency: "daily",
          limit: { count: MAX_FILE_COUNT },
          dateFormat: "yyyy-MM-dd",
          extension: ".log",
          mkdir: true,
        },
      },
    });
  }

  return pino({
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "UTC:yyyy-mm-dd HH:MM:ss",
        singleLine: true,
        messageKey: "message",
      },
    },
    level: "debug",
  });
};

export const logger = getLogger();
