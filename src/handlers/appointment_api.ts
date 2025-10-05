import { randomUUID } from "crypto";
import { publishAppointmentCreated } from "../infrastructure/sns.publisher";
import { config } from "../infrastructure/config";
import { saveAppointment, listByInsured as ddbList } from "../infrastructure/dynamodb.repository";

type Country = "PE" | "CL";
const isFiveDigits = (s: string) => /^\d{5}$/.test(s);
function parseBody<T>(body?: string | null): T { if (!body) throw new Error("Empty body"); return JSON.parse(body) as T; }

export const create = async (event: any) => {
  try {
    const { insuredId, scheduleId, countryISO } = parseBody<{ insuredId: string; scheduleId: number; countryISO: Country; }>(event.body);

    if (!isFiveDigits(insuredId)) return resp(400, { message: "insuredId debe tener 5 dígitos" });
    if (!Number.isInteger(scheduleId) || scheduleId <= 0) return resp(400, { message: "scheduleId debe ser entero positivo" });
    if (countryISO !== "PE" && countryISO !== "CL") return resp(400, { message: "countryISO debe ser 'PE' o 'CL'" });

    const appointmentId = randomUUID();
    const now = config.nowIso();

    await saveAppointment({
      PK: `INSURED#${insuredId}`,
      SK: `APPT#${appointmentId}`,
      insuredId, appointmentId, scheduleId, countryISO,
      status: "pending", createdAt: now, updatedAt: now
    });

    await publishAppointmentCreated({ appointmentId, insuredId, scheduleId, countryISO });

    return resp(202, { appointmentId, status: "pending" });
  } catch (err: any) {
    console.error("create error", err);
    return resp(500, { message: "Internal error", detail: err?.message });
  }
};

export const listByInsured = async (event: any) => {
  try {
    const insuredId = event?.pathParameters?.insuredId as string;
    if (!insuredId || !isFiveDigits(insuredId)) return resp(400, { message: "insuredId inválido (5 dígitos)" });

    const items = await ddbList(insuredId);
    const mapped = items.map(i => ({
      appointmentId: i.appointmentId,
      insuredId: i.insuredId,
      scheduleId: i.scheduleId,
      countryISO: i.countryISO,
      status: i.status,
      createdAt: i.createdAt,
      updatedAt: i.updatedAt
    }));
    return resp(200, mapped);
  } catch (err: any) {
    console.error("list error", err);
    return resp(500, { message: "Internal error", detail: err?.message });
  }
};

function resp(statusCode: number, body: unknown) {
  return { statusCode, headers: { "content-type": "application/json" }, body: JSON.stringify(body) };
}
