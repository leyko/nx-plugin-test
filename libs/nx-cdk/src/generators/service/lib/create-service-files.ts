import { generateFiles, names, readJson, Tree } from "@nx/devkit";
import { NormalizedSchema } from "../schema";
import { getRelativePathToRootTsConfig } from "@nx/js";
import { join } from "path";

export function createServiceFiles(host: Tree, options: NormalizedSchema) {
  const relativePathToRootTsConfig = getRelativePathToRootTsConfig(host, options.appProjectRoot);

  const packageJson = readJson(host, "package.json");
  const nameStrings = names(options.name);

  const templateVariables = {
    ...nameStrings,
    applicationName: names(packageJson.name).className,
    stackName: nameStrings.className,
  };

  if (!host.exists("bin/cdk.ts")) {
    generateFiles(
      host,
      join(__dirname, "../files/services/core"),
      join(options.appProjectRoot, "../service-core"),
      { ...templateVariables, stackName: `${templateVariables.applicationName}Core` },
    );

    generateFiles(
      host,
      join(__dirname, "../files/services/certificate"),
      join(options.appProjectRoot, "../service-certificate-global"),
      {
        ...templateVariables,
        stackName: `${templateVariables.applicationName}GlobalCertificate`,
      },
    );

    generateFiles(
      host,
      join(__dirname, "../files/services/certificate"),
      join(options.appProjectRoot, "../service-certificate-regional"),
      {
        ...templateVariables,
        stackName: `${templateVariables.applicationName}RegionalCertificate`,
      },
    );

    generateFiles(
      host,
      join(__dirname, "../files/services/api-domain"),
      join(options.appProjectRoot, "../service-api-domain"),
      { ...templateVariables, stackName: `${templateVariables.applicationName}ApiDomain` },
    );

    generateFiles(
      host,
      join(__dirname, "../files/bin"),
      join(options.appProjectRoot, "../../bin"),
      templateVariables,
    );
  }

  generateFiles(
    host,
    join(__dirname, "../files/services/service"),
    options.appProjectRoot,
    templateVariables,
  );
}
