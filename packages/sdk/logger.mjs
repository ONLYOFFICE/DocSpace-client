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

import { createLogger, format, transports } from "winston";
import WinstonCloudWatch from "winston-cloudwatch";
import "winston-daily-rotate-file";
import os from "os";
import { randomUUID } from "crypto";
import date from "date-and-time";
import config from "./config/index.mjs";

const getLogger = () => {
  const isDevMode = process.env.NODE_ENV === "development";
  const logLevel = isDevMode ? "debug" : "info";
  const logPath = config.get("logPath");

  const winstonTransports = [
    new transports.DailyRotateFile({
      filename: `${logPath}/web.sdk.%DATE%.log`,
      level: logLevel,
      datePattern: "MM-DD",
      handleExceptions: true,
      humanReadableUnhandledException: true,
      zippedArchive: true,
      maxSize: "50m",
      maxFiles: "30d",
      json: true,
    }),
    new transports.Console({
      level: logLevel,
      handleExceptions: true,
      json: false,
      colorize: true,
    }),
  ];

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
      .replace("${applicationContext}", "SDK")
      .replace("${guid}", randomUUID())
      .replace("${date}", new Date().toLocaleString());

    const cloudWatchOptions = {
      name: "aws",
      level: logLevel,
      logStreamName: streamName,
      logGroupName,
      awsRegion: region,
      jsonMessage: true,
      awsOptions: {
        credentials: { accessKeyId, secretAccessKey },
      },
    };

    transports.push(new WinstonCloudWatch(cloudWatchOptions));
  }

  const customFormat = format((info) => {
    const now = new Date();

    info.date = date.format(now, "YYYY-MM-DD HH:mm:ss");
    info.applicationContext = "SDK";
    info.level = info.level.toUpperCase();

    const hostname = os.hostname();

    info["instance-id"] = hostname;

    return info;
  })();

  const logger = createLogger({
    level: logLevel,
    format: format.combine(customFormat, format.json()),
    transports: winstonTransports,
    exitOnError: false,
  });

  return logger;
};

export const logger = getLogger();
