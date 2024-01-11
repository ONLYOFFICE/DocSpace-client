/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/naming-convention */
/* global jest */

const react_i18next: {
  translate: () => (
    Component: React.JSXElementConstructor<{
      t: () => string;
    }>,
  ) => (props: {}) => JSX.Element;
  useTranslation: (value: string) => {
    t: (key: string) => string;
    i18n: {
      language: string;
    };
  };
  language: string;
  i18n: {
    language: string;
  };
} = jest.genMockFromModule("react-i18next");

const translate =
  () =>
  (Component: React.JSXElementConstructor<{ t: () => string }>) =>
  (props: {}) => <Component t={() => ""} {...props} />;

react_i18next.translate = translate;
react_i18next.useTranslation = () => ({
  t: () => "",
  i18n: {
    language: "en",
  },
});
react_i18next.i18n = { language: "en" };

module.exports = react_i18next;
