import * as path from "path";
import { generateFiles, Tree } from "@nx/devkit";

export function createApplicationFiles(host: Tree, options: any) {
  generateFiles(host, path.join(__dirname, "../files"), options.serviceRoot, options);
}
