# SocialButton Component

The `SocialButton` component is used to display social media buttons with customizable styles.

## Properties

| Property        | Type                                                               | Required | Default                    | Description                                                                      |
| --------------- | ------------------------------------------------------------------ | -------- | -------------------------- | -------------------------------------------------------------------------------- |
| `label`         | `string`                                                           | No       | `""`                       | Button text.                                                                     |
| `iconName`      | `string`                                                           | No       | `"SocialButtonGoogleIcon"` | Button icon name.                                                                |
| `tabIndex`      | `number`                                                           | No       | `-1`                       | Accepts tabindex prop.                                                           |
| `isDisabled`    | `boolean`                                                          | No       | `false`                    | Sets the button to present a disabled state.                                     |
| `className`     | `string`                                                           | No       | -                          | Accepts a class.                                                                 |
| `id`            | `string`                                                           | No       | -                          | Accepts an id.                                                                   |
| `style`         | `React.CSSProperties`                                              | No       | -                          | Accepts CSS styles.                                                              |
| `onClick`       | `(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void` | No       | -                          | Sets a callback function that is triggered when the button is clicked.           |
| `$iconOptions`  | `IconOptions`                                                      | No       | -                          | Accepts the icon options.                                                        |
| `size`          | `SocialButtonSize`                                                 | No       | `"base"`                   | Sets the image size. Contains the small and the basic size options.              |
| `isConnect`     | `boolean`                                                          | No       | `false`                    | Changes the button style if the user is connected to the social network account. |
| `IconComponent` | `JSX.ElementType`                                                  | No       | -                          | Custom icon component.                                                           |
| `noHover`       | `boolean`                                                          | No       | `false`                    | Specifies if the button should not have a hover effect.                          |

## Usage Example

```jsx
import React from "react";
import SocialButton from "@docspace/shared/components";

const MyComponent = () => {
  const handleButtonClick = (event) => {
    console.log("Button clicked!", event);
  };

  return (
    <SocialButton
      label="Connect with Social Media"
      iconName="social-icon"
      tabIndex={1}
      isDisabled={false}
      className="custom-button"
      id="socialButton"
      style={{ backgroundColor: "lightgray" }}
      onClick={handleButtonClick}
      $iconOptions={{ color: "blue" }}
      size="base"
      isConnect={true}
      IconComponent={CustomIconComponent}
      noHover={false}
    />
  );
};

export default MyComponent;
```
