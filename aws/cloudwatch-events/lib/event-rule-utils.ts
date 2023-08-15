import { CloudWatchEventsClient, DescribeRuleCommand, DisableRuleCommand, EnableRuleCommand } from "@aws-sdk/client-cloudwatch-events";
import { DocumentDatabaseTable } from "@mcma/data";
import { Logger, Utils } from "@mcma/core";

async function enableDisableRule(doEnable: boolean, ruleName: string, table: DocumentDatabaseTable, cloudWatchEventsClient: CloudWatchEventsClient, requestId: string, logger: Logger) {
    const mutex = table.createMutex({
        name: ruleName,
        holder: requestId,
        logger: logger,
    });

    await mutex.lock();
    try {
        let rule = await cloudWatchEventsClient.send(new DescribeRuleCommand({ Name: ruleName }));
        if (rule.State !== "DISABLED") {
            await cloudWatchEventsClient.send(new DisableRuleCommand({ Name: ruleName }));
            await Utils.sleep(2500);
            rule = await cloudWatchEventsClient.send(new DescribeRuleCommand({ Name: ruleName }));
        }
        if (doEnable) {
            if (rule.State !== "ENABLED") {
                await cloudWatchEventsClient.send(new EnableRuleCommand({ Name: ruleName }));
                await Utils.sleep(2500);
            }
        }
    } finally {
        await mutex.unlock();
    }
}

export async function enableEventRule(ruleName: string, table: DocumentDatabaseTable, cloudWatchEventsClient: CloudWatchEventsClient, requestId: string, logger: Logger) {
    await enableDisableRule(true, ruleName, table, cloudWatchEventsClient, requestId, logger);
}

export async function disableEventRule(ruleName: string, table: DocumentDatabaseTable, cloudWatchEventsClient: CloudWatchEventsClient, requestId: string, logger: Logger) {
    await enableDisableRule(false, ruleName, table, cloudWatchEventsClient, requestId, logger);
}
