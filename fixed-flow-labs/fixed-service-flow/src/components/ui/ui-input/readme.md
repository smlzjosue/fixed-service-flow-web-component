# ui-input



<!-- Auto Generated Below -->


## Properties

| Property       | Attribute      | Description                       | Type                                                             | Default     |
| -------------- | -------------- | --------------------------------- | ---------------------------------------------------------------- | ----------- |
| `autocomplete` | `autocomplete` | Autocomplete attribute            | `string`                                                         | `undefined` |
| `disabled`     | `disabled`     | Disabled state                    | `boolean`                                                        | `false`     |
| `error`        | `error`        | Error message to display          | `string`                                                         | `undefined` |
| `helperText`   | `helper-text`  | Helper text (shown when no error) | `string`                                                         | `undefined` |
| `label`        | `label`        | Input label text                  | `string`                                                         | `undefined` |
| `maxlength`    | `maxlength`    | Maximum length                    | `number`                                                         | `undefined` |
| `minlength`    | `minlength`    | Minimum length                    | `number`                                                         | `undefined` |
| `name`         | `name`         | Input name attribute              | `string`                                                         | `undefined` |
| `pattern`      | `pattern`      | Input pattern for validation      | `string`                                                         | `undefined` |
| `placeholder`  | `placeholder`  | Placeholder text                  | `string`                                                         | `undefined` |
| `readonly`     | `readonly`     | Read-only state                   | `boolean`                                                        | `false`     |
| `required`     | `required`     | Required field                    | `boolean`                                                        | `false`     |
| `type`         | `type`         | Input type                        | `"date" \| "email" \| "number" \| "password" \| "tel" \| "text"` | `'text'`    |
| `value`        | `value`        | Current value                     | `string`                                                         | `''`        |


## Events

| Event         | Description                | Type                      |
| ------------- | -------------------------- | ------------------------- |
| `inputBlur`   | Emitted on blur            | `CustomEvent<FocusEvent>` |
| `inputEvent`  | Emitted on input event     | `CustomEvent<InputEvent>` |
| `inputFocus`  | Emitted on focus           | `CustomEvent<FocusEvent>` |
| `valueChange` | Emitted when value changes | `CustomEvent<string>`     |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
