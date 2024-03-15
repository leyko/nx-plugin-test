import { createTreeWithEmptyWorkspace } from "@nx/devkit/testing";
import { Tree, readProjectConfiguration } from "@nx/devkit";

import { nxCdkServiceGenerator } from "./service";
import { Schema } from "./schema";

describe("service generator", () => {
  let tree: Tree;
  const options: Schema = { name: "test" };

  beforeEach(() => {
    tree = createTreeWithEmptyWorkspace();
  });

  it("should run successfully", async () => {
    await nxCdkServiceGenerator(tree, options);
    const config = readProjectConfiguration(tree, "service-test");
    expect(config).toBeDefined();
  });
});
