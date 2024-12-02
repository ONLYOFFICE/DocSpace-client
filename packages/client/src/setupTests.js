import "@testing-library/jest-dom";
import { configure } from "@testing-library/react";
// import "jest-styled-components";

// Configure testing-library
configure({ testIdAttribute: "data-test-id" });

// Mock styled-components
// jest.mock("styled-components", () => {
//   const actual = jest.requireActual("styled-components");
//   return {
//     ...actual,
//     default: actual.default,
//     css: actual.css,
//     createGlobalStyle: actual.createGlobalStyle,
//     keyframes: actual.keyframes,
//     ThemeProvider: actual.ThemeProvider,
//     ServerStyleSheet: actual.ServerStyleSheet,
//     StyleSheetManager: actual.StyleSheetManager,
//   };
// });

// // Mock MobX
// jest.mock("mobx", () => ({
//   ...jest.requireActual("mobx"),
//   makeAutoObservable: jest.fn(),
//   runInAction: jest.fn((fn) => fn()),
// }));

// // Mock socket helper
// jest.mock("@docspace/shared/utils/socket", () => ({
//   __esModule: true,
//   default: jest.fn(),
//   SocketCommands: {},
//   SocketEvents: {},
// }));

// // Mock API
// jest.mock("@docspace/shared/api", () => ({
//   __esModule: true,
//   default: {
//     files: {
//       getFiles: jest.fn(),
//       createFolder: jest.fn(),
//     },
//   },
// }));

// // Mock getCookie function
// jest.mock("@docspace/shared/utils", () => ({
//   ...jest.requireActual("@docspace/shared/utils"),
//   getCookie: jest.fn(() => "en"),
// }));

// // Mock i18next and i18next-http-backend
// jest.mock("i18next", () => ({
//   ...jest.requireActual("i18next"),
//   use: jest.fn().mockReturnThis(),
//   init: jest.fn(),
//   createInstance: jest.fn().mockReturnThis(),
// }));

// jest.mock("i18next-http-backend", () => ({
//   __esModule: true,
//   default: jest.fn(),
// }));
