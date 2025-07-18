import { z } from "zod"

export const appointmentSchema = z.object({
  id: z.string(),
  startTime: z.coerce.date(),
  endTime: z.string(),
  status: z.enum(["scheduled", "completed", "canceled"]),
  service: z.object({
    id: z.string(),
    name: z.string(),
  }),
  professional: z.object({
    id: z.string(),
    name: z.string(),
  }),
  customer: z.object({
    id: z.string(),
    name: z.string(),
  }),
})

export const getAppointmentsResponseSchema = z.object({
  appointments: z.array(appointmentSchema),
  total: z.number(),
})

export type Appointment = z.infer<typeof appointmentSchema>
export type GetAppointmentsResponse = z.infer<
  typeof getAppointmentsResponseSchema
>
