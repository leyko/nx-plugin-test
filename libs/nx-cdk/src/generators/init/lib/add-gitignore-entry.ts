import { Tree } from 'nx/src/generators/tree';
import ignore from 'ignore';

export function addGitIgnoreEntry(host: Tree) {
  if (!host.exists('.gitignore')) {
    return;
  }

  let content = host.read('.gitignore', 'utf-8').trimEnd();

  const ig = ignore();
  ig.add(host.read('.gitignore', 'utf-8'));

  if (!ig.ignores('apps/example/cdk.out')) {
    content =
      `${content}\n\n# CDK\n` +
      '.cdk.staging\n' +
      'cdk.out\n' +
      'cdk.context.json\n';
  }

  host.write('.gitignore', content);
}
