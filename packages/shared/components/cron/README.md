# Cron

The `Cron` component provides an interface for working with cron expressions.

## Properties

| Property   | Type                      | Required | Default       | Description                                                           |
| ---------- | ------------------------- | -------- | ------------- | --------------------------------------------------------------------- |
| `value`    | `string`                  | No       | `"* * * * *"` | Current cron expression value.                                        |
| `setValue` | `(value: string) => void` | Yes      | -             | Function to set a new cron expression value, similar to `onChange`.   |
| `onError`  | `(error?: Error) => void` | No       | -             | Callback function triggered when an error is detected with the value. |

### Property `value`

- Type: `string`
- Description: The current cron expression value. If not specified, the component will display the default value.

### Property `setValue`

- Type: `(value: string) => void`
- Description: Function to set a new cron expression value. Called when the component's value changes, similar to the `onChange` event.

### Property `onError`

- Type: `(error?: Error) => void`
- Description: Callback function triggered when an error is detected with the cron expression value. If specified, the component will pass error information to this function.

## Usage Example

```jsx
import React from "react";
import Cron from "@docspace/shared/components";

const Component = () => {
  const handleCronChange = (newCronValue) => {
    console.log("New cron value:", newCronValue);
  };

  const handleCronError = (error) => {
    console.error("Cron error:", error);
  };

  return (
    <Cron
      value="*5 * * * *"
      setValue={handleCronChange}
      onError={handleCronError}
    />
  );
};

export default Component;
```
