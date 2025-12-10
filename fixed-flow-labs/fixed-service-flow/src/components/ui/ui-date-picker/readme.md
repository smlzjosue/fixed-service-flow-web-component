# ui-date-picker



<!-- Auto Generated Below -->


## Properties

| Property      | Attribute     | Description                       | Type      | Default        |
| ------------- | ------------- | --------------------------------- | --------- | -------------- |
| `disabled`    | `disabled`    | Disabled state                    | `boolean` | `false`        |
| `error`       | `error`       | Error message to display          | `string`  | `undefined`    |
| `helperText`  | `helper-text` | Helper text below the input       | `string`  | `undefined`    |
| `label`       | `label`       | Input label                       | `string`  | `undefined`    |
| `max`         | `max`         | Maximum date (YYYY-MM-DD)         | `string`  | `undefined`    |
| `min`         | `min`         | Minimum date (YYYY-MM-DD)         | `string`  | `undefined`    |
| `name`        | `name`        | Input name attribute              | `string`  | `undefined`    |
| `placeholder` | `placeholder` | Placeholder text                  | `string`  | `'dd/mm/yyyy'` |
| `readonly`    | `readonly`    | Read-only state                   | `boolean` | `false`        |
| `required`    | `required`    | Required field                    | `boolean` | `false`        |
| `value`       | `value`       | Current value (YYYY-MM-DD format) | `string`  | `''`           |


## Events

| Event         | Description                | Type                      |
| ------------- | -------------------------- | ------------------------- |
| `dateBlur`    | Emitted on blur            | `CustomEvent<FocusEvent>` |
| `dateFocus`   | Emitted on focus           | `CustomEvent<FocusEvent>` |
| `valueChange` | Emitted when value changes | `CustomEvent<string>`     |


----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
