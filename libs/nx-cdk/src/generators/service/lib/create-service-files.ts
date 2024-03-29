import { generateFiles, names, readJson, Tree } from '@nx/devkit';
import { NormalizedSchema } from '../schema';
import { getRelativePathToRootTsConfig } from '@nx/js';
import { join } from 'path';
import { addProject } from './add-project';

export function createServiceFiles(host: Tree, options: NormalizedSchema) {
  const relativePathToRootTsConfig = getRelativePathToRootTsConfig(
    host,
    options.appProjectRoot
  );

  const packageJson = readJson(host, 'package.json');
  const nameStrings = names(options.name);

  const templateVariables = {
    ...nameStrings,
    applicationName: names(packageJson.name).className,
    applicationFileName: names(packageJson.name).fileName,
    stackName: nameStrings.className,
  };

  if (!host.exists('bin/cdk.ts')) {
    generateFiles(
      host,
      join(__dirname, '../files/services/core'),
      join(options.appProjectRoot, '../service-core'),
      {
        ...templateVariables,
        stackName: `${templateVariables.applicationName}Core`,
      }
    );
    addProject(host, {
      ...options,
      appProjectRoot: join(options.appProjectRoot, '../service-core'),
      name: 'service-certificate-core',
    });

    generateFiles(
      host,
      join(__dirname, '../files/services/certificate'),
      join(options.appProjectRoot, '../service-certificate-global'),
      {
        ...templateVariables,
        stackName: `${templateVariables.applicationName}GlobalCertificate`,
      }
    );
    addProject(host, {
      ...options,
      appProjectRoot: join(
        options.appProjectRoot,
        '../service-certificate-global'
      ),
      name: 'service-certificate-global',
    });

    generateFiles(
      host,
      join(__dirname, '../files/services/certificate'),
      join(options.appProjectRoot, '../service-certificate-regional'),
      {
        ...templateVariables,
        stackName: `${templateVariables.applicationName}RegionalCertificate`,
      }
    );
    addProject(host, {
      ...options,
      appProjectRoot: join(
        options.appProjectRoot,
        '../service-certificate-regional'
      ),
      name: 'service-certificate-regional',
    });

    generateFiles(
      host,
      join(__dirname, '../files/services/api-domain'),
      join(options.appProjectRoot, '../service-api-domain'),
      {
        ...templateVariables,
        stackName: `${templateVariables.applicationName}ApiDomain`,
      }
    );
    addProject(host, {
      ...options,
      appProjectRoot: join(options.appProjectRoot, '../service-api-domain'),
      name: 'service-api-domain',
    });

    generateFiles(
      host,
      join(__dirname, '../files/bin'),
      join(options.appProjectRoot, '../../bin'),
      templateVariables
    );
    generateFiles(
      host,
      join(__dirname, '../files/root'),
      join(options.appProjectRoot, '../..'),
      templateVariables
    );
    generateFiles(
      host,
      join(__dirname, '../files/tools/scripts'),
      join(options.appProjectRoot, '../../tools/scripts'),
      templateVariables
    );

    generateFiles(
      host,
      join(__dirname, '../files/all'),
      join(options.appProjectRoot, '../all'),
      templateVariables
    );
    addProject(host, {
      ...options,
      appProjectRoot: join(options.appProjectRoot, '../all'),
      name: 'all',
    });
  }

  generateFiles(
    host,
    join(__dirname, '../files/services/service'),
    options.appProjectRoot,
    templateVariables
  );
  host.rename(
    join(options.appProjectRoot, 'cdk/src/apis', 'fileName'),
    join(options.appProjectRoot, 'cdk/src/apis', templateVariables.fileName)
  );

  if (!host.exists('bin/cdk.ts')) {
    return;
  }
  let content = host.read('bin/cdk.ts', 'utf-8').trimEnd();
  content =
    `${content}\n\n` +
    `const ${templateVariables.propertyName}Stateful = new ${templateVariables.stackName}StatefulStack(app, "${templateVariables.applicationName}${templateVariables.stackName}Stateful", {
    env,core: coreStack,
  });\n` +
    `${templateVariables.propertyName}Stateful.addDependency(coreStack);\n\n` +
    `const ${templateVariables.propertyName} = new ${templateVariables.stackName}Stack(app, "${templateVariables.applicationName}${templateVariables.stackName}", {
      env,
        core: coreStack,
        stateful: ${templateVariables.propertyName}Stateful, 
        apiDomainStack,
        });\n` +
    `${templateVariables.propertyName}.addDependency(coreStack);\n` +
    `${templateVariables.propertyName}.addDependency(${templateVariables.propertyName}Stateful);\n` +
    `${templateVariables.propertyName}.addDependency(apiDomainStack);\n\n`;

  const newImports =
    `import { ${templateVariables.stackName}StatefulStack } from "../${options.appProjectRoot}/cdk/stateful";\n` +
    `import { ${templateVariables.stackName}Stack } from "../${options.appProjectRoot}/cdk/stateless";\n`;

  const contentLines = content.split('\n');
  let lastImportIndex = -1;
  for (let i = 0; i < contentLines.length; i++) {
    if (contentLines[i].startsWith('import ')) {
      lastImportIndex = i;
    }
  }

  if (lastImportIndex === -1) {
    content = `${newImports}\n\n${content}`;
  } else {
    // Insert the new imports after the last import statement
    contentLines.splice(lastImportIndex + 1, 0, newImports.trim());
    content = contentLines.join('\n');
  }

  host.write('bin/cdk.ts', content);
}
