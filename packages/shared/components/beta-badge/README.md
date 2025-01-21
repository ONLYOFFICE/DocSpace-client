# Beta Badge

The Beta Badge is used to indicate that a feature is in beta testing.

### Usage

```js
import { BetaBadge } from "@docspace/shared/components/beta-badge";
```

```jsx
<BetaBadge
  documentationEmail="support@example.com"
  currentDeviceType="desktop"
  withOutFeedbackLink={false}
/>
```

### Properties

| Props                 |     Type     | Required | Values |  Default  | Description                  |
| --------------------- | :----------: | :------: | :----: | :-------: | ---------------------------- |
| `documentationEmail`  |   `string`   |    -     |   -    |     -     | Email for feedback           |
| `currentDeviceType`   | `DeviceType` |    -     |   -    | `desktop` | Device type (mobile/desktop) |
| `withOutFeedbackLink` |  `boolean`   |    -     |   -    |  `false`  | Hides feedback link if true  |
