import {Schema} from "./schema";
import {ExecutorContext} from "@nx/devkit";

const NX_WORKSPACE_ROOT = process.env.NX_WORKSPACE_ROOT ?? "";
if (!NX_WORKSPACE_ROOT) {
    throw new Error("CDK not Found");
}

const awsProfileArg = (awsProfile: string | undefined) => {
    return awsProfile && awsProfile.toLowerCase() !== "default" ? ` --profile ${awsProfile}` : "";
};

export function generateCommandString(command: string, appPath: string) {
    const generatePath = `"npx ts-node --require tsconfig-paths/register --project ./apps/all/tsconfig.app.json ./bin/cdk.ts"`;
    return `node --require ts-node/register ${NX_WORKSPACE_ROOT}/node_modules/aws-cdk/bin/cdk.js -a ${generatePath} ${command}`;
}

export default async function runDeployExecutor(schema: Schema, context: ExecutorContext) {
    const {projectName} = context;
    const generatePath = "npx ts-node --require tsconfig-paths/register --project ./apps/all/tsconfig.app.json ./bin/cdk.ts";

    let command = `node --require ts-node/register ${NX_WORKSPACE_ROOT}/node_modules/aws-cdk/bin/cdk.js -a "${generatePath}" deploy `;

    if (projectName === "all") {
        command += "--all --concurrency 6";
    } else {
        // TODO
        // const serviceName = projectName.replace("service-", "");
        // command += `${normalizedOptions.stackPrefix}-LOS-${
        //   serviceName.charAt(0).toUpperCase() + serviceName.slice(1)
        // } --exclusively`;
    }
    command += ` --require-approval=never${awsProfileArg(schema.profile)}`;
    console.log(command);

    // execSync(command, {
    //   cwd: context.root,
    //   stdio: "inherit",
    // });

    return {
        success: true,
    };
}
