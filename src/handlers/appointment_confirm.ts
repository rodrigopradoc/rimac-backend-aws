import { markCompleted } from "../infrastructure/dynamodb.repository";
export const handler = async (event: any) => {
  for (const record of event.Records ?? []) {
    const envelope = JSON.parse(record.body); // EventBridge->SQS envelope
    const detail = typeof envelope.detail === "string" ? JSON.parse(envelope.detail) : envelope.detail;
    const { appointmentId, insuredId } = detail || {};
    if (appointmentId && insuredId) {
      await markCompleted(insuredId, appointmentId);
      console.log("Marked completed:", { appointmentId, insuredId });
    } else {
      console.warn("Invalid confirmation payload", { envelope });
    }
  }
  return { ok: true };
};
