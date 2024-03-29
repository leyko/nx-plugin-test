import {
  formatFiles,
  GeneratorCallback,
  runTasksInSerial,
  Tree,
} from '@nx/devkit';
import { addProject } from './lib/add-project';
import { nxCdkInitGenerator } from '../init/init';
import { normalizeOptions } from './lib/normalize-options';
import { initGenerator as jsInitGenerator } from '@nx/js';
import { Schema } from './schema';
import * as shared from '@nx/js/src/utils/typescript/create-ts-config';
import { createServiceFiles } from './lib/create-service-files';

export async function nxCdkServiceGenerator(host: Tree, schema: Schema) {
  const tasks: GeneratorCallback[] = [];
  const options = await normalizeOptions(host, schema);

  const jsInitTask = await jsInitGenerator(host, {
    ...schema,
    // tsConfigName: schema.rootProject ? "tsconfig.json" : "tsconfig.base.json",
    tsConfigName: 'tsconfig.base.json',
    skipFormat: true,
  });
  tasks.push(jsInitTask);

  const initTask = await nxCdkInitGenerator(host, {
    ...options,
    skipFormat: true,
  });
  tasks.push(initTask);

  shared.extractTsConfigBase(host);

  createServiceFiles(host, options);
  addProject(host, { ...options, name: `service-${options.name}` });

  if (!options.skipFormat) {
    await formatFiles(host);
  }

  return runTasksInSerial(...tasks);
}

export default nxCdkServiceGenerator;
