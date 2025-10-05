import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
const eb = new EventBridgeClient({});
export const handler = async (event: any) => {
  for (const record of event.Records ?? []) {
    const msg = JSON.parse(record.body);
    console.log("CL worker got:", msg);
    await eb.send(new PutEventsCommand({
      Entries: [{
        Source: "appointments.country",
        DetailType: "AppointmentBooked",
        Detail: JSON.stringify({
          appointmentId: msg.appointmentId,
          insuredId: msg.insuredId,
          scheduleId: msg.scheduleId,
          countryISO: msg.countryISO
        })
      }]
    }));
  }
  return { ok: true };
};
