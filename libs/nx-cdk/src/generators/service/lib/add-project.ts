import { addProjectConfiguration, ProjectConfiguration, Tree } from "@nx/devkit";
import {NormalizedSchema} from "../schema";
import {join} from "path";

export function addProject(host: Tree, options: NormalizedSchema) {
  const targets: Record<string, any> = {
    deploy: {
      executor: "@leagueofsmurfs/nx-plugin:deploy",
      options: {},
    },
    destroy: {
      executor: "@leagueofsmurfs/nx-plugin:destroy",
      options: {},
    },
  };

  // targets.build = {
  //   executor: "@nx/next:build",
  //   outputs: ["{options.outputPath}"],
  //   defaultConfiguration: "production",
  //   options: {
  //     outputPath: options.outputPath,
  //   },
  //   configurations: {
  //     development: {
  //       outputPath: options.appProjectRoot,
  //     },
  //     production: {},
  //   },
  // };
  //
  // targets.serve = {
  //   executor: "@nx/next:server",
  //   defaultConfiguration: "development",
  //   options: {
  //     buildTarget: `${options.projectName}:build`,
  //     dev: true,
  //   },
  //   configurations: {
  //     development: {
  //       buildTarget: `${options.projectName}:build:development`,
  //       dev: true,
  //     },
  //     production: {
  //       buildTarget: `${options.projectName}:build:production`,
  //       dev: false,
  //     },
  //   },
  // };
  //
  // targets.export = {
  //   executor: "@nx/next:export",
  //   options: {
  //     buildTarget: `${options.projectName}:build:production`,
  //   },
  // };

  const project: ProjectConfiguration = {
    root: options.appProjectRoot,
    sourceRoot: join(options.appProjectRoot, "src"),
    projectType: "application",
    targets,
  };

  addProjectConfiguration(host, options.appProjectRoot, {
    ...project,
  });
}
