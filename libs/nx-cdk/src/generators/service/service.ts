import {formatFiles, GeneratorCallback, runTasksInSerial, Tree} from "@nx/devkit";
import {addProject} from "./lib/add-project";
import {nxCdkInitGenerator} from "../init/init";
import {normalizeOptions} from "./lib/normalize-options";
import {initGenerator as jsInitGenerator} from "@nx/js";
import {Schema} from "./schema";
import * as shared from "@nx/js/src/utils/typescript/create-ts-config";
import {createServiceFiles} from "./lib/create-service-files";

export async function serviceGenerator(host: Tree, schema: Schema) {
    const tasks: GeneratorCallback[] = [];
    const options = await normalizeOptions(host, schema);

    const jsInitTask = await jsInitGenerator(host, {
        ...schema,
        // tsConfigName: schema.rootProject ? "tsconfig.json" : "tsconfig.base.json",
        tsConfigName: "tsconfig.base.json",
        skipFormat: true,
    });
    tasks.push(jsInitTask);

    const initTask = await nxCdkInitGenerator(host, {
        ...options,
        skipFormat: true,
    });
    tasks.push(initTask);

    // const initTask = await initGenerator(host, {});
    // tasks.push(initTask);

    shared.extractTsConfigBase(host);

    createServiceFiles(host, options);
    addProject(host, options);

    // const e2eTask = await addE2e(host, options);
    // tasks.push(e2eTask);

    // const jestTask = await addJest(host, options);
    // tasks.push(jestTask);

    // const lintTask = await addLinting(host, options);
    // tasks.push(lintTask);

    // updateJestConfig(host, options);
    // updateCypressTsConfig(host, options);

    // let content = host.read("bin/cdk.ts", "utf-8").trimEnd();
    // content =
    //   `${content}\n\n` +
    //   `new ${options.stackName}Stack(app, \`\${config.stackPrefix}-LOS-${options.stackName}\`, baseStackProps);\n`;
    // content = content.replace(
    //   '";\n\n',
    //   `";\nimport { ${options.stackName}Stack } from "../${options.serviceRoot}/cdk/stack";\n\n`,
    // );
    // host.write("bin/cdk.ts", content);

    if (!options.skipFormat) {
        await formatFiles(host);
    }

    return runTasksInSerial(...tasks);
}

export default serviceGenerator;
