import { execSync } from "child_process";
import { ExecutorContext } from "@nx/devkit";
import { Schema } from "./schema";
import { readdirSync, readFileSync } from "fs";
import { join } from "path";

const NX_WORKSPACE_ROOT = process.env.NX_WORKSPACE_ROOT ?? "";
if (!NX_WORKSPACE_ROOT) {
  throw new Error("CDK not Found");
}

const awsProfileArg = (awsProfile: string | undefined) => {
  return awsProfile && awsProfile.toLowerCase() !== "default"
    ? ` --profile ${awsProfile}`
    : "";
};

export default async function runDeployExecutor(
  schema: Schema,
  context: ExecutorContext
) {
  const { projectName } = context;
  const generatePath =
    "npx ts-node --require tsconfig-paths/register --project ./apps/all/tsconfig.app.json ./bin/cdk.ts";

  let command = `node --require ts-node/register ${NX_WORKSPACE_ROOT}/node_modules/aws-cdk/bin/cdk.js -a "${generatePath}" deploy `;

  if (projectName === "all") {
    command += "--all --concurrency 6";
  } else {
    const binFile = readFileSync(join("bin", "cdk.ts"), "utf-8");

    const regex = /new\s+(\w+)\(\s*\w+,\s*['"]([^'"\n]+)['"]/g;
    const stacksInBin: Record<string, string> = {};
    let match: RegExpExecArray | null;

    // Use a loop with exec for global regex to iterate over all matches
    while ((match = regex.exec(binFile)) !== null) {
      // match[1] contains the class name, match[2] contains the quoted name
      if (match[1] && match[2]) {
        stacksInBin[match[1]] = match[2];
      }
    }

    const p = context.projectsConfigurations.projects[context.projectName];
    const filePaths = readdirSync(join(p.root, "cdk"));
    const serviceStacks: string[] = [];

    for (const filePath of filePaths) {
      if (!filePath.endsWith(".ts")) {
        continue;
      }
      const file = readFileSync(join(p.root, "cdk", filePath), "utf-8");
      const matches = file.matchAll(/export\s*class\s*(\w+)\s*extends/g);
      for (const match of matches) {
        serviceStacks.push(match[1]);
      }
    }

    for (const stack of serviceStacks) {
      if (stacksInBin[stack]) {
        command += `${stack} `;
      }
    }
    command += `--exclusively`;
  }
  command += ` --require-approval=never${awsProfileArg(schema.profile)}`;
  console.log(command);

  execSync(command, {
    cwd: context.root,
    stdio: "inherit",
  });

  return {
    success: true,
  };
}
