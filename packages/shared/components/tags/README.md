# Tags Component

The `Tags` component is used to display tags.

## Properties

| Property      | Type                       | Required | Default | Description                                         |
| ------------- | -------------------------- | -------- | ------- | --------------------------------------------------- |
| `id`          | `string`                   | No       | -       | Accepts an id.                                      |
| `tags`        | `Array<TagType \| string>` | Yes      | -       | Accepts the tags.                                   |
| `className`   | `string`                   | No       | -       | Accepts a class.                                    |
| `columnCount` | `number`                   | Yes      | -       | Accepts the tag column count.                       |
| `style`       | `React.CSSProperties`      | No       | -       | Accepts CSS styles.                                 |
| `onSelectTag` | `(tag?: string) => void`   | Yes      | -       | Accepts the function called when a tag is selected. |

### Property `id`

- Type: `string`
- Required: No
- Default: -
- Description: Accepts an id.

### Property `tags`

- Type: `Array<TagType | string>`
- Required: Yes
- Default: -
- Description: Accepts the tags.

### Property `className`

- Type: `string`
- Required: No
- Default: -
- Description: Accepts a class.

### Property `columnCount`

- Type: `number`
- Required: Yes
- Default: -
- Description: Accepts the tag column count.

### Property `style`

- Type: `React.CSSProperties`
- Required: No
- Default: -
- Description: Accepts CSS styles.

### Property `onSelectTag`

- Type: `(tag?: string) => void`
- Required: Yes
- Default: -
- Description: Accepts the function called when a tag is selected.

## Usage Example

```jsx
import React from "react";
import Tags from "@docspace/shared/components";

const MyComponent = () => {
  const handleTagSelection = (selectedTag) => {
    console.log("Selected tag:", selectedTag);
  };

  return (
    <Tags
      id="myTags"
      tags={["tag1", "tag2", "tag3"]}
      className="custom-tags"
      columnCount={2}
      style={{ color: "blue" }}
      onSelectTag={handleTagSelection}
    />
  );
};

export default MyComponent;
```
