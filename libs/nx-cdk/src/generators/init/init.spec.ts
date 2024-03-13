import { createTreeWithEmptyWorkspace } from "@nx/devkit/testing";
import { readJson, Tree } from "@nx/devkit";

import { nxCdkInitGenerator } from "./init";

describe("init", () => {
  let tree: Tree;

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it("should add cdk dependencies", async () => {
    await nxCdkInitGenerator(tree, { skipFormat: true });
    const packageJson = readJson(tree, "package.json");
    expect(packageJson.dependencies["aws-cdk"]).toBeDefined();
    expect(packageJson.dependencies["aws-cdk-lib"]).toBeDefined();
    expect(packageJson.dependencies["constructs"]).toBeDefined();
    expect(packageJson.devDependencies["eslint-plugin-cdk"]).toBeDefined();
  });
});
