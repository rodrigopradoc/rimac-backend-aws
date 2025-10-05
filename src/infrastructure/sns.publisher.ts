import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
import { config } from "./config";
const sns = new SNSClient({});

export async function publishAppointmentCreated(payload: {
  appointmentId: string;
  insuredId: string;
  scheduleId: number;
  countryISO: "PE" | "CL";
}) {
  await sns.send(new PublishCommand({
    TopicArn: config.topicArn,
    Message: JSON.stringify(payload),
    MessageAttributes: {
      countryISO: { DataType: "String", StringValue: payload.countryISO }
    }
  }));
}
