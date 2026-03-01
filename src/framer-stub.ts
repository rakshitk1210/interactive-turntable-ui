/**
 * Local stub for the "framer" package.
 *
 * Vite aliases `import ... from "framer"` to this file during local dev/build.
 * When the component is pasted into Framer, Framer's own bundler resolves the
 * import to the real `framer` package — this stub is never used there.
 *
 * Exports are typed to match the Framer API surface we actually use, so
 * TypeScript is happy without installing the real package.
 */

export type PropertyControls = Record<string, unknown>;
export type ComponentType = React.ComponentType<unknown>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function addPropertyControls(_component: ComponentType, _controls: PropertyControls): void {
  // no-op outside Framer
}

export const ControlType = {
  String: "string",
  Number: "number",
  Boolean: "boolean",
  Color: "color",
  Image: "image",
  File: "file",
  Enum: "enum",
  SegmentedEnum: "segmentedenum",
  FusedNumber: "fusednumber",
  EventHandler: "eventhandler",
  ComponentInstance: "componentinstance",
  Array: "array",
  Object: "object",
  Date: "date",
  Link: "link",
  Transition: "transition",
  BoxShadow: "boxshadow",
  TextShadow: "textshadow",
  Font: "font",
} as const;
