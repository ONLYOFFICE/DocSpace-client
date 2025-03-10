# Aside Header Component

The AsideHeader component is a reusable header component typically used in sidebars and panels. It supports various features like back navigation, close button, custom icons, and loading states.

## Usage

```jsx
import { AsideHeader } from "@docspace/components";

// Basic usage with text
<AsideHeader header="Settings" />

// With back and close buttons
<AsideHeader
  header="Details"
  isBackButton
  onBackClick={() => navigate(-1)}
  isCloseable
  onCloseClick={handleClose}
/>

// With custom icons
<AsideHeader
  header="Document"
  headerIcons={[
    {
      key: "settings",
      url: "/images/settings.react.svg",
      onClick: handleSettings
    },
    {
      key: "info",
      url: "/images/info.react.svg",
      onClick: handleInfo
    }
  ]}
/>

// With loading state
<AsideHeader isLoading />
```

## Props

| Prop            | Type                  | Default  | Description                                                         |
| --------------- | --------------------- | -------- | ------------------------------------------------------------------- |
| `header`        | `string \| ReactNode` | -        | Content to display in the header. Can be text or a custom component |
| `isBackButton`  | `boolean`             | `false`  | Whether to show the back navigation button                          |
| `onBackClick`   | `() => void`          | -        | Handler for back button click. Required when `isBackButton` is true |
| `isCloseable`   | `boolean`             | `false`  | Whether to show the close button                                    |
| `onCloseClick`  | `() => void`          | -        | Handler for close button click. Required when `isCloseable` is true |
| `headerIcons`   | `HeaderIcon[]`        | `[]`     | Array of custom icons to display in the header                      |
| `isLoading`     | `boolean`             | `false`  | Whether to show a loading skeleton                                  |
| `withoutBorder` | `boolean`             | `false`  | Whether to hide the bottom border                                   |
| `headerHeight`  | `string`              | `"53px"` | Custom height for the header                                        |
| `className`     | `string`              | -        | Additional CSS class name                                           |
| `id`            | `string`              | -        | HTML id attribute                                                   |
| `style`         | `CSSProperties`       | -        | Additional inline styles                                            |

### HeaderIcon Type

```typescript
type HeaderIcon = {
  key: string; // Unique identifier for the icon
  url: string; // URL or path to the icon image
  onClick: () => void; // Click handler for the icon
};
```
