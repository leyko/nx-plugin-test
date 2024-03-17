import {
  addDependenciesToPackageJson,
  formatFiles,
  GeneratorCallback,
  runTasksInSerial,
  Tree,
} from '@nx/devkit';
import { InitSchema } from './schema';
import {
  awsCdkConstructsVersion,
  awsCdkEslintVersion,
  awsCdkVersion,
  enquirerVersion,
  esbuildVersion,
  yargsVersion,
} from '../../utils/versions';

export async function nxCdkInitGenerator(host: Tree, schema: InitSchema) {
  const tasks: GeneratorCallback[] = [];

  if (!schema.skipPackageJson) {
    tasks.push(
      addDependenciesToPackageJson(
        host,
        {
          'aws-cdk': awsCdkVersion,
          'aws-cdk-lib': awsCdkVersion,
          constructs: awsCdkConstructsVersion,
        },
        {
          enquirer: enquirerVersion,
          esbuild: esbuildVersion,
          'eslint-plugin-cdk': awsCdkEslintVersion,
          yargs: yargsVersion,
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
