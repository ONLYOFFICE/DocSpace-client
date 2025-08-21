# ArticleItem

A versatile item component for displaying catalog entries with various states and interactions.

### Usage

```jsx
import { ArticleItem } from "@docspace/shared/components";

const MyComponent = () => {
  return (
    <ArticleItem
      icon="/path/to/icon.svg"
      text="My Item"
      showText
      linkData={{
        path: "/my-path",
        state: {},
      }}
    />
  );
};
```

### Properties

| Props            |          Type          | Required | Default | Description                                   |
| ---------------- | :--------------------: | :------: | :-----: | --------------------------------------------- |
| `id`             |        `string`        |    -     |    -    | Item identifier                               |
| `className`      |        `string`        |    -     |    -    | Additional CSS class                          |
| `style`          | `React.CSSProperties`  |    -     |    -    | Inline styles                                 |
| `icon`           |        `string`        |    ✓     |    -    | URL of the item icon                          |
| `text`           |        `string`        |    ✓     |    -    | Display text for the item                     |
| `showText`       |       `boolean`        |    -     | `false` | Whether to display the text next to the icon  |
| `onClick`        |   `(e, id?) => void`   |    -     |    -    | Click handler for the item                    |
| `onDrop`         | `(id?, text?) => void` |    -     |    -    | Handler for drag and drop operations          |
| `showInitial`    |       `boolean`        |    -     | `false` | Show first letter of text when text is hidden |
| `isEndOfBlock`   |       `boolean`        |    -     | `false` | Add bottom margin to indicate end of a block  |
| `isActive`       |       `boolean`        |    -     | `false` | Apply active state styling                    |
| `isDragging`     |       `boolean`        |    -     | `false` | Indicate item is being dragged                |
| `isDragActive`   |       `boolean`        |    -     | `false` | Indicate item is a drag target                |
| `showBadge`      |       `boolean`        |    -     | `false` | Show a badge on the item                      |
| `labelBadge`     |   `string \| number`   |    -     |    -    | Text or number for the badge                  |
| `iconBadge`      |        `string`        |    -     |    -    | URL of custom badge icon                      |
| `onClickBadge`   |    `(id?) => void`     |    -     |    -    | Click handler for the badge                   |
| `isHeader`       |       `boolean`        |    -     | `false` | Render as a header item                       |
| `isFirstHeader`  |       `boolean`        |    -     | `false` | Remove top margin when used as first header   |
| `folderId`       |        `string`        |    -     |    -    | Identifier for folder items                   |
| `badgeTitle`     |        `string`        |    -     |    -    | Tooltip text for badge                        |
| `badgeComponent` |   `React.ReactNode`    |    -     |    -    | Custom badge component                        |
| `title`          |        `string`        |    -     |    -    | Tooltip text for item                         |
| `linkData`       |   `TArticleLinkData`   |    ✓     |    -    | Routing data (path and state)                 |

### Features

- Supports icon-only and text+icon display modes
- Built-in drag and drop support
- Customizable badges with text or icons
- Header variant for section titles
- Mobile-responsive design
- Theme support (light/dark)
- Tooltip support
- React Router integration

### Styling

The component uses CSS Modules with theme support. Custom styles can be applied through:

- `className` prop for additional classes
- `style` prop for inline styles
- Theme variables for color customization
