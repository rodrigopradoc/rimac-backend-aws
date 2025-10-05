export const config = {
  tableName: process.env.APPOINTMENTS_TABLE!,
  topicArn: process.env.APPOINTMENTS_TOPIC_ARN!,
  nowIso: () => new Date().toISOString(),
};
