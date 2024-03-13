import {
  addDependenciesToPackageJson,
  formatFiles,
  GeneratorCallback,
  runTasksInSerial,
  Tree,
} from "@nx/devkit";
import { InitSchema } from "./schema";
import {
  awsCdkConstructsVersion,
  awsCdkEslintVersion,
  awsCdkVersion,
} from "../../utils/versions";

export async function nxCdkInitGenerator(host: Tree, schema: InitSchema) {
  const tasks: GeneratorCallback[] = [];

  if (!schema.skipPackageJson) {
    tasks.push(
      addDependenciesToPackageJson(
        host,
        {
          "aws-cdk": awsCdkVersion,
          "aws-cdk-lib": awsCdkVersion,
          constructs: awsCdkConstructsVersion,
        },
        {
          "eslint-plugin-cdk": awsCdkEslintVersion,
        },
        undefined,
        schema.keepExistingVersions
      )
    );
  }

  if (!schema.skipFormat) {
    await formatFiles(host);
  }

  return runTasksInSerial(...tasks);
}

export default nxCdkInitGenerator;
