# InfoBadge Component

The `InfoBadge` component is used to display information badges with tooltips.

## Properties

| Property             | Type              | Required | Default | Description                                                                               |
| -------------------- | ----------------- | -------- | ------- | ----------------------------------------------------------------------------------------- |
| `label`              | `string`          | Yes      | -       | Badge label.                                                                              |
| `place`              | `PlacesType`      | Yes      | -       | Global tooltip placement.                                                                 |
| `tooltipTitle`       | `React.ReactNode` | Yes      | -       | Tooltip header content.                                                                   |
| `tooltipDescription` | `React.ReactNode` | Yes      | -       | Tooltip body content.                                                                     |
| `offset`             | `number`          | Yes      | -       | Space between the tooltip element and anchor element (arrow not included in calculation). |

### Property `label`

- Type: `string`
- Required: Yes
- Default: -
- Description: Badge label.

### Property `place`

- Type: `PlacesType`
- Required: Yes
- Default: -
- Description: Global tooltip placement.

### Property `tooltipTitle`

- Type: `React.ReactNode`
- Required: Yes
- Default: -
- Description: Tooltip header content.

### Property `tooltipDescription`

- Type: `React.ReactNode`
- Required: Yes
- Default: -
- Description: Tooltip body content.

### Property `offset`

- Type: `number`
- Required: Yes
- Default: -
- Description: Space between the tooltip element and anchor element (arrow not included in calculation).

## Usage Example

```jsx
import React from "react";
import InfoBadge from "@docspace/shared/components";

const MyComponent = () => {
  return (
    <InfoBadge
      label="Info"
      place="top"
      tooltipTitle="Information"
      tooltipDescription="This is an information badge with a tooltip."
      offset={10}
    />
  );
};

export default MyComponent;
```
