import React from "react";
import { Meta, StoryFn } from "@storybook/react";
import { BrowserRouter } from "react-router";
import { DeviceType } from "../../enums";
import Article from ".";
import { ArticleProps } from "./Article.types";

export default {
  title: "Layout Components/Article",
  component: Article,
  parameters: {
    docs: {
      description: {
        component:
          "Article component with header, profile, and content sections",
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
  downloaddesktopUrl: "",
  officeforandroidUrl: "",
  officeforiosUrl: "",
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

const Template: StoryFn<ArticleProps> = (args) => (
  <div style={{ height: "600px", position: "relative" }}>
    <Article {...args} />
  </div>
);

export const Default = Template.bind({});
Default.args = {
  ...defaultProps,
};

export const WithoutText = Template.bind({});
WithoutText.args = {
  ...defaultProps,
  showText: false,
};

export const Mobile = Template.bind({});
Mobile.args = {
  ...defaultProps,
  currentDeviceType: DeviceType.mobile,
  isMobileArticle: true,
};

export const Tablet = Template.bind({});
Tablet.args = {
  ...defaultProps,
  currentDeviceType: DeviceType.tablet,
};

export const WithoutProfile = Template.bind({});
WithoutProfile.args = {
  ...defaultProps,
  hideProfileBlock: true,
};

export const WithoutApps = Template.bind({});
WithoutApps.args = {
  ...defaultProps,
  hideAppsBlock: true,
};

export const WithLiveChat = Template.bind({});
WithLiveChat.args = {
  ...defaultProps,
  isLiveChatAvailable: true,
  isShowLiveChat: true,
};

export const Loading = Template.bind({});
Loading.args = {
  ...defaultProps,
  showArticleLoader: true,
  isBurgerLoading: true,
};

export const WithCustomHeader = Template.bind({});
WithCustomHeader.args = {
  ...defaultProps,
  withCustomArticleHeader: true,
  children: [
    <Article.Header key="header">
      <div style={{ padding: "16px", backgroundColor: "#f5f5f5" }}>
        Custom Header Content
      </div>
    </Article.Header>,
    <Article.Body key="body">
      <div>Article Content</div>
    </Article.Body>,
  ],
};
