import {generateFiles, names, readJson, Tree} from "@nx/devkit";
import {NormalizedSchema} from "../schema";
import {getRelativePathToRootTsConfig} from "@nx/js";
import {join} from "path";
import {addProject} from "./add-project";

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
            {...templateVariables, stackName: `${templateVariables.applicationName}Core`},
        );
        addProject(host, {...options, appProjectRoot: join(options.appProjectRoot, "../service-core"),
            name: "service-certificate-core"});

        generateFiles(
            host,
            join(__dirname, "../files/services/certificate"),
            join(options.appProjectRoot, "../service-certificate-global"),
            {
                ...templateVariables,
                stackName: `${templateVariables.applicationName}GlobalCertificate`,
            },
        );
        addProject(host, {...options, appProjectRoot: join(options.appProjectRoot, "../service-certificate-global"),
            name: "service-certificate-global"});

        generateFiles(
            host,
            join(__dirname, "../files/services/certificate"),
            join(options.appProjectRoot, "../service-certificate-regional"),
            {
                ...templateVariables,
                stackName: `${templateVariables.applicationName}RegionalCertificate`,
            },
        );
        addProject(host, {
            ...options, appProjectRoot: join(options.appProjectRoot, "../service-certificate-regional"),
            name: "service-certificate-regional"
        });

        generateFiles(
            host,
            join(__dirname, "../files/services/api-domain"),
            join(options.appProjectRoot, "../service-api-domain"),
            {...templateVariables, stackName: `${templateVariables.applicationName}ApiDomain`},
        );
        addProject(host, {
            ...options,
            appProjectRoot: join(options.appProjectRoot, "../service-api-domain"),
            name: "service-api-domain"
        });

        generateFiles(
            host,
            join(__dirname, "../files/bin"),
            join(options.appProjectRoot, "../../bin"),
            templateVariables,
        );

        generateFiles(
            host,
            join(__dirname, "../files/all"),
            join(options.appProjectRoot, "../all"),
            templateVariables,
        );
        addProject(host, {...options, appProjectRoot: join(options.appProjectRoot, "../all"), name: "all"});
    }

    generateFiles(
        host,
        join(__dirname, "../files/services/service"),
        options.appProjectRoot,
        templateVariables,
    );
}
