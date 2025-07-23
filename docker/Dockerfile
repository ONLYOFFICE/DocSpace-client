# (c) Copyright Ascensio System SIA 2009-2025
# 
# This program is a free software product.
# You can redistribute it and/or modify it under the terms
# of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
# Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
# to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
# any third-party rights.
# 
# This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
# of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
# the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
# 
# You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
# 
# The  interactive user interfaces in modified source and object code versions of the Program must
# display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
# 
# Pursuant to Section 7(b) of the License you must retain the original Product logo when
# distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
# trademark law for use of our trademarks.
# 
# All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
# content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
# International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

FROM node:20-alpine

# Install required dependencies
RUN apk add --no-cache python3 make g++

# Enable Corepack for Yarn 4 support
RUN corepack enable

# Set Yarn version to 4.3.0
RUN corepack prepare yarn@4.3.0 --activate

WORKDIR /app

# Copy yarn-related files
COPY ../.yarn/ ./.yarn/
COPY ../package.json ../yarn.lock ../.yarnrc.yml ./

# Copy the source code with correct directory structure
COPY ../common/ ./common/
COPY ../packages/ ./packages/
COPY ../public/ ./public/

# ENV NODE_OPTIONS="--max-old-space-size=8192"

# Install dependencies
RUN yarn install

# Run before-build script (packages/runtime.json)
RUN yarn ./common/scripts/before-build.js

# Run build webpack apps
RUN yarn workspace @docspace/client build --env lint=false 
RUN yarn workspace @docspace/management build --env lint=false

# Run build next apps
RUN TS_ERRORS_IGNORE=true yarn workspace @docspace/login build 
RUN TS_ERRORS_IGNORE=true yarn workspace @docspace/doceditor build
RUN TS_ERRORS_IGNORE=true yarn workspace @docspace/sdk build

EXPOSE 5001 5011 5013 5015 5099

CMD [ "yarn", "start-prod" ]
