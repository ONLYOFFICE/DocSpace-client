const pageStyles = `
  html {
      font-family: "Open Sans", sans-serif, Arial;
    }
    
    body {
      margin: 0;
    }
    
    *,
    ::before,
    ::after {
      box-sizing: border-box;
    }
    
    * {
      font-family: "Open Sans", sans-serif, Arial;
      margin: 0;
    }
    
    @media (prefers-color-scheme: dark) {
      .chat-panel-wrapper,
      [data-theme="dark"] {
        /*dark*/
        color-scheme: dark;
    
        --chat-panel-border: #474747;
        --ai-chat-text-color: #adadad;

        --scrollbar-padding-inline-end: 17px;
        --scrollbar-padding-inline-end-mobile: 8px;
        --scrollbar-padding-after-last-item: unset;

        --scrollbar-bg-color: rgba(136, 136, 136, 0.4);
        --scrollbar-hover-bg-color: rgba(136, 136, 136, 0.64);
        --scrollbar-press-bg-color: rgba(136, 136, 136, 0.8);
      }
    }
    
    @media (prefers-color-scheme: light) {
      .chat-panel-wrapper,
      [data-theme="light"] {
        /*light*/
        color-scheme: light;
    
        --chat-panel-border: #eceef1;
        --ai-chat-text-color: #657077;

        --scrollbar-padding-inline-end: 17px;
        --scrollbar-padding-inline-end-mobile: 8px;
        --scrollbar-padding-after-last-item: unset;

        --scrollbar-bg-color: rgba(6, 22, 38, 0.16);
        --scrollbar-hover-bg-color: rgba(6, 22, 38, 0.32);
        --scrollbar-press-bg-color: rgba(6, 22, 38, 0.5);

        
      }
    }
    
    .chat-panel-wrapper {
      height: 100%;
      width: auto;
      position: relative;
      z-index: 300;
    
      //   @include no-user-select;
    
      //   @include tablet-and-below {
      //     z-index: 309;
      //     position: fixed;
      //     inset: 0;
      //   }
    }
    
    .chat-panel {
      height: 100%;
      width: 400px;
      background-color: var(--chat-panel-bg);
      display: flex;
      flex-direction: column;
    
      :global {
        .scroll-body {
          padding-bottom: 20px;
        }
      }
    
      // @include tablet-and-below {
      //   position: absolute;
      //   border: none;
      //   inset-inline-end: 0;
      //   width: 480px;
      //   max-width: calc(100vw - 69px);
      // }
    
      // @include mobile {
      //   bottom: 0;
      //   height: calc(100% - 64px);
      //   width: 100vw;
      //   max-width: 100vw;
      // }
    }
    
    .chat-panel-header-container {
      width: 100%;
      max-width: 100%;
    
      display: flex;
      flex-direction: column;
      border-bottom: 1px solid var(--chat-panel-border);
    
      .headerText {
        height: 68px;
    
        // @include tablet-and-below {
        //   height: 52px;
        // }
      }
    }
    
    .chat-panel-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      margin: 0 16px;
      height: 53px;
      min-height: 53px;
      position: relative;
    }
    
    .chat-panel-header_text {
      font-size: 18px;
      font-weight: 700;
    }
    
    .chat-panel-body-container {
      height: auto;
      padding-inline: 20px;
    
      color: var(--info-panel-text-color);
      background-color: var(--info-panel-bg);
    
      //   @include mobile {
      //     padding-block: 0;
      //     padding-inline: 16px 8px;
      //   }
    
      &:not(.sectionIsVisible) {
        width: 100%;
        margin: 0 auto;
        max-width: 726px;
      }
    }
    
    .chat-panel-body_empty-container {
      margin-block: 80px 0;
      margin-inline: 0 auto;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 14px;
    
      .chat-panel-body_empty-container-text {
        font-weight: 700;
        font-size: 23px;
        text-align: center;
      }
    
      .chat-panel-body_empty-container-image-wrapper {
        width: 48px;
        height: 48px;
        img {
          width: 48px;
          height: 48px;
        }
      }
    }
    
    .chat-panel-footer-container {
      width: calc(100% - 32px);
      padding: 22px 16px;
      background-color: var(--info-panel-bg);
    
      .input-component {
        width: 100%;
      }
    
      &:not(.sectionIsVisible) {
        width: 100%;
        margin: 0 auto;
        max-width: 726px;
      }
    }
    
    .chat-panel-footer_input-block {
      display: flex;
      width: 100%;
      background-color: rgb(255, 255, 255);
      color: rgb(51, 51, 51);
      border-radius: 3px;
      box-shadow: none;
      border: 1px solid rgb(208, 213, 218);
      cursor: text;
    }

    .chat-panel-footer_input-dropdown {
      position: absolute;
      z-index: 9999;
      box-shadow: 0px -3px 8px rgba(0, 0, 0, 0.25);
      border-bottom: 0px;
      border-radius: 8px 8px 0 0;
      padding: 8px 0;
      overflow: hidden;
    }

    .chat-panel-footer_input-dropdown-item,
    .chat-panel-footer_input-dropdown-item_active {
      height: 50px;
      width: 100%;
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 0 8px;
      cursor: pointer;

      p {
        color: #333;
        font-size: 13px;
        font-weight: 400;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    .chat-panel-footer_input-dropdown-item_active {
      background: #f8f9f9;
    }

    .chat-panel-footer_input-dropdown-item:hover {
      background: #f8f9f9;
    }

    .chat-panel-footer_input-dropdown-item:not(:last-child) {
      border-bottom: 1px solid rgb(208, 213, 218);
    }

    .chat-panel-footer_input-backdrop {
      position: absolute;
      z-index: 9998;
      background: transparent;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }
    
    .chat-panel-footer_input {
      color: rgb(51, 51, 51);
      border-radius: 3px;
      box-sizing: border-box;
      cursor: text;
      appearance: none;
      background-color: rgb(255, 255, 255);
      caret-color: rgb(51, 51, 51);
      display: flex;
      line-height: 20px;
      font-size: 13px;
      font-weight: normal;
      flex: 1 1 0%;
      outline: none;
      overflow: hidden;
      opacity: 1;
      width: 173px;
      padding: 5px 6px;
      border: none;
      background-clip: text !important;
      -webkit-text-fill-color: rgb(163, 169, 174) !important;
      box-shadow: rgb(255, 255, 255) 0px 0px 0px 30px inset !important;
      resize: none;
      max-height: 200px;
    
      width: 550px;
      line-height: 20px;
      font-size: 16px;
      padding: 11px 12px;
    }

    // .chat-panel-footer_input[placeholder]:empty:before {
    //   content: attr(placeholder);
    //   color: #555; 
    // }

    // .chat-panel-footer_input[placeholder]:empty:focus:before {
    //   content: "";
    // }
    
    .chat-panel-footer_input-append {
      align-items: center;
      margin: 0;
      background-color: inherit;
    }
    
    .chat-panel-footer_icon-wrapper {
      --icon-button-color: #{$gray};
      --icon-button-hover-color: #{$light-gray-dark};
      --icon-button-size: 28px;
    
      line-height: 0;
      -webkit-tap-highlight-color: $tap-highlight;
      cursor: pointer;
    
      color: var(--icon-button-color);
    
      width: var(--icon-button-size);
      height: var(--icon-button-size);
    
      &.disabled {
        cursor: default;
      }
    
      &.notClickable {
        cursor: default;
      }
    
      &.stroke {
        svg {
          &:not(:root) {
            width: 100%;
            height: 100%;
          }
    
          path {
            stroke: var(--icon-button-color);
          }
        }
    
        @media (hover: hover) and (pointer: fine) {
          &:hover:not(.disabled) {
            svg {
              path {
                stroke: var(--icon-button-hover-color);
              }
            }
          }
        }
      }
    
      &.fill {
        svg {
          width: 100%;
          height: 100%;
    
          path {
            fill: var(--icon-button-color);
          }
        }
    
        @media (hover: hover) and (pointer: fine) {
          &:hover:not(.disabled) {
            svg {
              path {
                fill: var(--icon-button-hover-color);
              }
            }
          }
        }
      }
    
      //   .notSelectable {
      //     @include no-user-select;
      //   }
    }
    
    .chat-panel-footer_input-block-icon {
      display: flex;
      align-items: center;
      height: 100%;
      padding-inline-end: 8px;
      padding-inline-start: 1px;
      background-color: inherit;
    }
    
    .chat-message-container {
      margin: 26px 0px;
    }
    
    .chat-message-user {
      display: flex;
      align-items: center;
      justify-content: start;
      gap: 12px;
    }
    
    .chat-message-user-name {
      font-size: 14px;
      font-weight: 600;
    }
    
    .chat-message-user-message {
      font-size: 13px;
      font-weight: 400;
      margin: 4px 0 0 44px;
      color: var(--ai-chat-text-color);
    
      p {
        margin: 0;
      }
    }
    
    .chat-message-user-avatar-wrapper {
      width: 32px;
      min-width: 32px;
      height: 32px;
    
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        content: var(--avatar-default-image);
      }
    }

    .chat-panel-loading-placeholder {
      display: flex;
      align-items: center;
      background: gainsboro;
      width: 50px;
      height: 30px;
      border-radius: 16px;
      justify-content: center;
    }

    .chat-panel-loading-placeholder-ellipsis {
      line-height: 16px;
      height: 30px;    
    }

    .chat-panel-loading-placeholder-ellipsis::after {
      display: inline-block;
      animation: ellipsis steps(1,end) 2s infinite;
      content: '';
    }
      
    @keyframes ellipsis {
      0%   { content: ''; }
      25%  { content: '.'; }
      50%  { content: '..'; }
      75%  { content: '...'; }
      100% { content: ''; }
    }
`;

const scrollStyles = `

  :global(.rtl) {
    :local {
      .track-horizontal {
        left: unset !important;
        right: 0 !important;
      }
    }
  }

  .scrollbar {
    &:global(.trackYVisible.trackXVisible) {
      .track-vertical {
        height: calc(100% - 16px) !important;
      }

      .track-horizontal {
        width: calc(100% - 16px) !important;
      }
    }

    &.noScrollY {
      .track-vertical {
        height: 0 !important;
      }
    }

    // fix when iframe breaks dragging scroll
    &:has(> .track > :global(.dragging)) {
      iframe {
        pointer-events: none;
      }
    }
  }

  .scroller {
    &.ios::-webkit-scrollbar {
      display: none;
    }
  }

  .scroll-body {
    padding-inline-end: var(--scrollbar-padding-inline-end) !important;
    position: relative;
    outline: none;

    // @include mobile {
    //   padding-inline-end: var(--scrollbar-padding-inline-end-mobile) !important;
    // }
  }

  .track {
    box-sizing: border-box;
    display: flex;
    padding: 4px;
    border-radius: 8px !important;
    background: transparent !important;
    z-index: 201;

    @media (min-width: 1025px) {
      &:hover {
        .thumb-vertical {
          width: 8px !important;
        }

        .thumb-horizontal {
          height: 8px !important;
        }
      }
    }

    @media (max-width: $tablet: 1024px;) {
      pointer-events: none;

      .thumb {
        pointer-events: all;
      }
    }
  }

  .track-vertical {
    direction: var(--interface-direction);
    height: 100% !important;
    width: 16px !important;
    top: 0 !important;
    justify-content: flex-end;
  }

  .track-horizontal {
    width: 100% !important;
    height: 16px !important;
    align-items: flex-end;
    direction: ltr;
    left: 0 !important;
  }

  .thumb {
    touch-action: none;
    background-color: var(--scrollbar-bg-color) !important;
    position: relative;
    cursor: default !important;

    &:hover {
      background-color: var(--scrollbar-hover-bg-color) !important;
    }

    &:active,
    &:global(.dragging) {
      touch-action: none;
      background-color: var(--scrollbar-press-bg-color) !important;
    }
  }

  .thumb-vertical {
    width: 4px !important;
    transition: width linear 0.1s;

    @media (min-width: 1025px) {
      &:active {
        width: 8px !important;
      }
    }
      
    @media (min-width: 1024px) {
      width: 4px !important;
    }
  }

  .thumb-horizontal {
    height: 4px !important;
    transition: height linear 0.1s;

    @media (min-width: 1025px) {
      &:active {
        height: 8px !important;
      }
    }

    @media (min-width: 1024px) {
      height: 4px !important;
    }
  }

  .fixed-size {
    @include desktop {
      .thumb-vertical {
        width: 8px !important;
      }
      .thumb-horizontal {
        height: 8px !important;
      }
    }
  }

  .padding-after-last-item {
    .scroll-body {
      padding-bottom: var(--scrollbar-padding-after-last-item) !important;
    }
  }

  .track {
    opacity: 0;
    transition: opacity 0.35s;
  }

  .track:is(:hover, :has(> :global(.dragging))) {
    opacity: 1;
  }


  .scroll-visible:hover:not(
      :has(.trackYVisible .trackXVisible .dragging .backdrop-active)
    ) {
    > .track {
      opacity: 1;
    }
  }

  @media (hover: none) {
    &.scroll-visible:not(:has(:global(.backdrop-active))) {
      .track {
        opacity: 1;
      }
    }
  }
`;

export const styles = pageStyles + scrollStyles;
