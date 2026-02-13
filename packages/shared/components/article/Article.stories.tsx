import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { BrowserRouter } from "react-router";
import {
  DeviceType,
  EmployeeActivationStatus,
  EmployeeStatus,
} from "../../enums";
import Article from ".";
import { ArticleProps } from "./Article.types";
import { ContextMenuModel } from "../context-menu";

export default {
  title: "Layout Components/Article",
  component: Article,
  parameters: {
    docs: {
      description: {
        component: "Article component with various display options",
      },
    },
  },
  decorators: [
    (S) => (
      <BrowserRouter>
        <S />
      </BrowserRouter>
    ),
  ],
  argTypes: {
    children: { control: false },
    setShowText: { action: "setShowText" },
    toggleShowText: { action: "toggleShowText" },
    toggleArticleOpen: { action: "toggleArticleOpen" },
    setIsMobileArticle: { action: "setIsMobileArticle" },
    setArticleOpen: { action: "setArticleOpen" },
    onLogoClickAction: { action: "onLogoClickAction" },
    onProfileClick: { action: "onProfileClick" },
  },
} as Meta;

const Template: StoryFn<ArticleProps> = (args) => (
  <div style={{ height: "600px", position: "relative" }}>
    <Article {...args} />
  </div>
);

const defaultProps: ArticleProps = {
  showText: true,
  setShowText: () => {},
  articleOpen: true,
  toggleShowText: () => {},
  toggleArticleOpen: () => {},
  setIsMobileArticle: () => {},
  setArticleOpen: () => {},
  withSendAgain: false,
  mainBarVisible: true,
  hideProfileBlock: false,
  logoText: "",
  isShowLiveChat: false,
  hideAppsBlock: false,
  isLiveChatAvailable: false,
  isAdmin: false,
  currentDeviceType: DeviceType.desktop,
  onLogoClickAction: () => {},
  onProfileClick: () => {},
  withCustomArticleHeader: false,
  isBurgerLoading: false,
  languageBaseName: "en",
  zendeskEmail: "support@example.com",
  chatDisplayName: "Support Chat",
  isMobileArticle: false,
  zendeskKey: "your-zendesk-key",
  showProgress: false,
  showBackButton: false,
  downloaddesktopUrl: "https://example.com/desktop",
  officeforandroidUrl: "https://example.com/android",
  officeforiosUrl: "https://example.com/ios",
  limitedAccessDevToolsForUsers: false,
  children: [
    <Article.Header key="header">
      <h2>Article Header</h2>
    </Article.Header>,
    <Article.MainButton key="main-button">
      <button type="button">Main Action</button>
    </Article.MainButton>,
    <Article.Body key="body">
      <div>Article Content</div>
    </Article.Body>,
  ],
};

export const Default = Template.bind({});
Default.args = {
  ...defaultProps,
  user: {
    id: "user-1",
    displayName: "John Smith",
    title: "Manager",
    avatarSmall: "https://via.placeholder.com/32",
    access: 0,
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    status: EmployeeStatus.Active,
    activationStatus: EmployeeActivationStatus.NotActivated,
    department: "",
    workFrom: "",
    avatarMax: "",
    avatarMedium: "",
    avatarOriginal: "",
    avatar: "",
    isAdmin: false,
    isRoomAdmin: false,
    isLDAP: false,
    listAdminModules: [],
    isOwner: false,
    isVisitor: false,
    isCollaborator: false,
    mobilePhoneActivationStatus: 0,
    isSSO: false,
    profileUrl: "",
    hasAvatar: false,
    isAnonim: false,
  },
  getActions: () =>
    [
      {
        key: "profile",
        label: "Profile",
        onClick: () => console.log("Profile clicked"),
      },
      {
        key: "help",
        label: "Help",
        onClick: () => console.log("Help clicked"),
      },
      {
        key: "logout",
        label: "Logout",
        onClick: () => console.log("Logout clicked"),
      },
    ] as ContextMenuModel[],
  children: [
    <Article.Header key="header">
      <h2>Article with Context Menu</h2>
    </Article.Header>,
    <Article.Body key="body">
      <div>Content with available user context menu</div>
    </Article.Body>,
  ],
};
