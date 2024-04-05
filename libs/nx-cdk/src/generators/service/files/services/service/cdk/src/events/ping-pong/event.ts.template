import * as events from "aws-cdk-lib/aws-events";

export const eventRuleProps = {
  eventPattern: {
    detailType: events.Match.anyOf(events.Match.suffix(".Ping")),
  },
};
