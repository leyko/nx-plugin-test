import { names, Tree } from "@nx/devkit";
import { Schema, NormalizedSchema } from "../schema";
import { determineProjectNameAndRootOptions } from "@nx/devkit/src/generators/project-name-and-root-utils";

// export interface ServiceGeneratorNormalizedSchema extends ServiceGeneratorSchema {
//   stackName: string;
//   serviceName: string;
//   serviceRoot: string;
//   serviceSourceRoot: string;
// }

export async function normalizeOptions(host: Tree, options: Schema): Promise<NormalizedSchema> {
  const formattedNames = names(options.name);

  const { projectName: appProjectName, projectRoot: appProjectRoot } =
    await determineProjectNameAndRootOptions(host, {
      name: options.name,
      projectType: "application",
      directory: `apps/service-${formattedNames.fileName}`,
      projectNameAndRootFormat: "as-provided",
      rootProject: false,
      callingGenerator: null,
    });

  const normalized: NormalizedSchema = {
    ...options,
    name: names(options.name).fileName,
    projectName: appProjectName,
    appProjectRoot,
  };

  // normalized.routing = normalized.routing ?? false;
  // normalized.strict = normalized.strict ?? true;
  // normalized.classComponent = normalized.classComponent ?? false;
  // normalized.compiler = normalized.compiler ?? "babel";
  // normalized.bundler = normalized.bundler ?? "webpack";
  // normalized.unitTestRunner = normalized.unitTestRunner ?? "jest";
  // normalized.e2eTestRunner = normalized.e2eTestRunner ?? "cypress";
  // normalized.inSourceTests = normalized.minimal || normalized.inSourceTests;
  // normalized.devServerPort ??= findFreePort(host);
  // normalized.minimal = normalized.minimal ?? false;

  return normalized;
}
