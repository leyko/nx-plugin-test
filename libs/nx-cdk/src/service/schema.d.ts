export interface Schema {
  name: string;
  // serviceType: "core" | "certificate" | "stateful" | "stateless";
  skipFormat?: boolean;
  skipPackageJson?: boolean;
}

export interface NormalizedSchema<T extends Schema = Schema> extends T {
  projectName: string;
  appProjectRoot: string;
  // e2eProjectName: string;
  // e2eProjectRoot: string;
  // parsedTags: string[];
  // fileName: string;
  // styledModule: null | SupportedStyles;
  // hasStyles: boolean;
  // unitTestRunner: "jest" | "vitest" | "none";
  // addPlugin?: boolean;
}
