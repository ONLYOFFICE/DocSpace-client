// Copyright 2024 alexeysafronov
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["jest-expect-message"],
  verbose: true,
  reporters: [
    "default",
    [
      "./node_modules/jest-html-reporter",
      {
        pageTitle: "DocSpace Frontend tests report",
        outputPath: "<rootDir>/reports/tests-results.html",
        includeFailureMsg: true,
        includeConsoleLog: true,
        includeStackTrace: false,
        useCssFile: true,
        sort: "titleAsc",
        append: false,
        // styleOverridePath: "styles/defaultTheme.css",
        logo: "../../../public/images/logo/lightsmall.svg",
      },
    ],
  ],
};
