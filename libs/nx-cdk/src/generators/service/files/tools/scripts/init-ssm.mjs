import { fromIni } from '@aws-sdk/credential-providers';
import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import {
  ListHostedZonesCommand,
  Route53Client,
} from '@aws-sdk/client-route-53';
import enquirer from 'enquirer';
import {
  GetParametersByPathCommand,
  PutParameterCommand,
  SSMClient,
} from '@aws-sdk/client-ssm';

const ssmPrefix = '/<%= applicationFileName %>';

const argv = yargs(hideBin(process.argv)).argv;

const config = {
  ...(argv.profile ? { credentials: fromIni({ profile: argv.profile }) } : {}),
};

(async () => {
  const route53 = new Route53Client(config);
  const ssm = new SSMClient(config);

  const currentRegion = await ssm.config.region();
  const globalSsm = new SSMClient({ ...config, region: 'us-east-1' });

  const { HostedZones: hostedZones } = await route53.send(
    new ListHostedZonesCommand({})
  );
  if (!hostedZones.length) {
    throw new Error('No hosted zones found.');
  }
  const { Parameters: parameters } = await ssm.send(
    new GetParametersByPathCommand({
      Path: ssmPrefix,
      Recursive: true,
      MaxResults: 10,
    })
  );

  const findParameter = (id, defaultValue = '') => {
    const p = parameters.find((p) => p.Name === `${ssmPrefix}/${id}`);
    if (p === undefined) {
      return defaultValue;
    }
    return p.Value;
  };

  const defaultHostedZoneId = findParameter('hosted-zone-id');
  const configs = {
    hostedZoneName: hostedZones.find((hz) => hz.Id === defaultHostedZoneId)
      ?.Name,
    domainName: findParameter('domain-name'),
    environmentType: findParameter('environment-type', 'development'),
    removalPolicy: findParameter('removal-policy', 'destroy'),
    logLevel: findParameter('log-level', 'debug'),
    logRetentionDays: findParameter('log-retention-days', '9999'),
  };

  const response = await enquirer.prompt([
    {
      type: 'select',
      name: 'hosted-zone-name',
      message: 'Hosted zone:',
      choices: hostedZones.map((zone) => zone.Name.slice(0, -1)),
      initial: configs.hostedZoneName,
    },
    {
      type: 'input',
      name: 'domain-name',
      message: 'Domain:',
      initial: ({ enquirer: { answers } }) => {
        if (configs.domainName.includes(answers['hosted-zone-name'])) {
          return configs.domainName;
        }
        return answers['hosted-zone-name'];
      },
    },
    {
      type: 'select',
      name: 'environment-type',
      message: 'Environment type:',
      choices: ['development', 'ci', 'test', 'staging', 'production'],
      initial: configs.environmentType,
    },
    {
      type: 'select',
      name: 'removal-policy',
      message: 'Removal policy:',
      choices: ['destroy', 'retain'],
      initial: configs.removalPolicy,
    },
    {
      type: 'select',
      name: 'log-level',
      message: 'Log level:',
      choices: ['debug', 'verbose', 'info', 'warn', 'error'],
      initial: configs.logLevel,
    },
    {
      type: 'select',
      name: 'log-retention-days',
      message: 'Log retention days:',
      choices: [
        '1',
        '3',
        '5',
        '7',
        '14',
        '30',
        '60',
        '90',
        '120',
        '150',
        '180',
        '365',
        '400',
        '545',
        '731',
        '1096',
        '1827',
        '2192',
        '2557',
        '2922',
        '3288',
        '3653',
        '9999',
      ],
      initial: configs.logRetentionDays,
    },
  ]);

  for (const [key, value] of Object.entries(response)) {
    if (key === 'hosted-zone-name') {
      const hostedZoneItInput = new PutParameterCommand({
        Type: 'String',
        Name: `${ssmPrefix}/hosted-zone-id`,
        Value: hostedZones
          .find((hz) => hz.Name.slice(0, -1) === value)
          ?.Id.replace('/hostedzone/', ''),
        Overwrite: true,
      });
      await ssm.send(hostedZoneItInput);
      if (currentRegion !== 'us-east-1') {
        await globalSsm.send(hostedZoneItInput);
      }
    }
    const input = new PutParameterCommand({
      Type: 'String',
      Name: `${ssmPrefix}/${key}`,
      Value: value,
      Overwrite: true,
    });
    await ssm.send(input);
    if (currentRegion !== 'us-east-1') {
      await globalSsm.send(input);
    }
  }
})();
