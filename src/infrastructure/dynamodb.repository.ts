import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { config } from "./config";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export interface AppointmentRecord {
  PK: string; // INSURED#12345
  SK: string; // APPT#uuid
  insuredId: string;
  appointmentId: string;
  scheduleId: number;
  countryISO: "PE" | "CL";
  status: "pending" | "completed";
  createdAt: string;
  updatedAt: string;
}

export async function saveAppointment(item: AppointmentRecord) {
  await ddb.send(new PutCommand({
    TableName: config.tableName,
    Item: item,
    ConditionExpression: "attribute_not_exists(PK) AND attribute_not_exists(SK)"
  }));
}

export async function listByInsured(insuredId: string) {
  const PK = `INSURED#${insuredId}`;
  const res = await ddb.send(new QueryCommand({
    TableName: config.tableName,
    KeyConditionExpression: "PK = :pk",
    ExpressionAttributeValues: { ":pk": PK }
  }));
  return (res.Items as AppointmentRecord[]) ?? [];
}

export async function markCompleted(insuredId: string, appointmentId: string) {
  const PK = `INSURED#${insuredId}`;
  const SK = `APPT#${appointmentId}`;
  await ddb.send(new UpdateCommand({
    TableName: config.tableName,
    Key: { PK, SK },
    UpdateExpression: "SET #s = :completed, updatedAt = :now",
    ExpressionAttributeNames: { "#s": "status" },
    ExpressionAttributeValues: {
      ":completed": "completed",
      ":now": new Date().toISOString()
    }
  }));
}

export const buildPK = (insuredId: string) => `INSURED#${insuredId}`;
export const buildSK = (appointmentId: string) => `APPT#${appointmentId}`;
