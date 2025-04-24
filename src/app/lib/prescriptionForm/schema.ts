import { z } from 'zod';
import { DayOfWeek, PrescriptionType } from './enums';

export const prescriptionFormSchema = z
  .object({
    daysOfWeek: z
      .array(z.enum(Object.keys(DayOfWeek) as [keyof typeof DayOfWeek]))
      .refine((days) => days.length >= 2, {
        message: 'At least 2 days of the week must be selected',
      }),
    prescriptionType: z.nativeEnum(PrescriptionType),
    dosage: z
      .number()
      .min(0, 'Dosage must be at least 0ml')
      .max(60, 'Dosage cannot exceed 60ml')
      .optional(),
    initialDailyDose: z
      .number()
      .min(0, 'Initial daily dose must be at least 0ml')
      .max(60, 'Initial daily dose cannot exceed 60ml')
      .optional(),
    changeFrequency: z
      .number()
      .int('Frequency must be a whole number')
      .positive('Frequency must be a positive number')
      .optional(),
    changeAmount: z
      .number()
      .min(0, 'Change amount must be at least 0ml')
      .max(60, 'Change amount cannot exceed 60ml')
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Add conditional validation based on prescription type
    if (
      data.prescriptionType === PrescriptionType.Increasing ||
      data.prescriptionType === PrescriptionType.Reducing
    ) {
      if (data.initialDailyDose === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Initial daily dose is required for this prescription type',
          path: ['initialDailyDose'],
        });
      }

      if (data.changeFrequency === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Change frequency is required for this prescription type',
          path: ['changeFrequency'],
        });
      }

      if (data.changeAmount === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Change amount is required for this prescription type',
          path: ['changeAmount'],
        });
      }

      if (data.dosage !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Dosage should not be provided for this prescription type',
        });
      }
    }

    if (data.prescriptionType === PrescriptionType.Stabilisation) {
      if (data.dosage === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Dosage is required for this prescription type',
        });
      }
      if (data.initialDailyDose !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Initial daily dose should not be provided for this prescription type',
        });
      }
      if (data.changeFrequency !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Change frequency should not be provided for this prescription type',
        });
      }
      if (data.changeAmount !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'Change amount should not be provided for this prescription type',
        });
      }
    }
  });

export type PrescriptionFormValues = z.infer<typeof prescriptionFormSchema>;

export const defaultFormValues: Partial<PrescriptionFormValues> = {
  daysOfWeek: [],
  prescriptionType: PrescriptionType.Stabilisation,
  dosage: undefined,
  initialDailyDose: undefined,
  changeFrequency: undefined,
  changeAmount: undefined,
};
