import { fromIni } from '@aws-sdk/credential-providers';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import {
  ListHostedZonesCommand,
  Route53Client,
} from '@aws-sdk/client-route-53';
import enquirer from 'enquirer';

const ssmPrefix = `/<%= applicationFileName %>`;

const argv = yargs(hideBin(process.argv)).argv;

const config = {
  ...(argv.profile ? { credentials: fromIni({ profile: argv.profile }) } : {}),
};
const route53 = new Route53Client(config);

(async () => {
  const { HostedZones: hostedZones } = await route53.send(
    new ListHostedZonesCommand({})
  );

  console.log(hostedZones);
  const response = await enquirer.prompt([
    {
      type: 'select',
      name: 'hostedZoneId',
      message: 'Hosted zone:',
      choices: hostedZones.map((zone) => ({ name: zone.Name, value: zone.Id })),
    },
  ]);

  console.log(response);
})();

console.log(argv);
