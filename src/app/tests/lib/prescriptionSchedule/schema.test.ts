import { describe, it, expect } from 'vitest';
import {
  prescriptionScheduleSchema,
  defaultFormValues,
} from '@app/lib/prescriptionSchedule/schema';
import {
  DayOfWeek,
  PrescriptionType,
} from '@app/lib/prescriptionSchedule/enums';

describe('prescriptionScheduleSchema', () => {
  describe('defaultFormValues', () => {
    it('should have correct default values', () => {
      expect(defaultFormValues).toEqual({
        daysOfWeek: [],
        prescriptionType: PrescriptionType.Stabilisation,
        dosage: undefined,
        initialDailyDose: undefined,
        changeFrequency: undefined,
        changeAmount: undefined,
      });
    });
  });

  describe('daysOfWeek validation', () => {
    it('should fail if daysOfWeek is missing', () => {
      const result = prescriptionScheduleSchema.safeParse({
        prescriptionType: PrescriptionType.Stabilisation,
        dosage: 30,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('daysOfWeek');
      }
    });

    it('should fail if fewer than 2 days are selected', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday],
        prescriptionType: PrescriptionType.Stabilisation,
        dosage: 30,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'At least 2 days of the week must be selected'
        );
      }
    });

    it('should pass if at least 2 days are selected', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Stabilisation,
        dosage: 30,
      });

      expect(result.success).toBe(true);
    });

    it('should pass with all days selected', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [
          DayOfWeek.Monday,
          DayOfWeek.Tuesday,
          DayOfWeek.Wednesday,
          DayOfWeek.Thursday,
          DayOfWeek.Friday,
          DayOfWeek.Saturday,
          DayOfWeek.Sunday,
        ],
        prescriptionType: PrescriptionType.Stabilisation,
        dosage: 30,
      });

      expect(result.success).toBe(true);
    });

    it('should fail with invalid day names', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: ['InvalidDay'],
        prescriptionType: PrescriptionType.Stabilisation,
        dosage: 30,
      });

      expect(result.success).toBe(false);
    });
  });

  describe('prescriptionType validation', () => {
    it('should fail if prescriptionType is missing', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        dosage: 30,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('prescriptionType');
      }
    });

    it('should fail with invalid prescription type', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: 'InvalidType',
        dosage: 30,
      });

      expect(result.success).toBe(false);
    });

    it('should pass with valid prescription type', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Stabilisation,
        dosage: 30,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('dosage validation', () => {
    it('should fail if dosage is negative', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Stabilisation,
        dosage: -5,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('dosage');
        expect(result.error.issues[0].message).toBe(
          'Dosage must be at least 0ml'
        );
      }
    });

    it('should fail if dosage exceeds maximum', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Stabilisation,
        dosage: 70,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('dosage');
        expect(result.error.issues[0].message).toBe(
          'Dosage cannot exceed 60ml'
        );
      }
    });

    it('should pass with valid dosage values', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Stabilisation,
        dosage: 30,
      });

      expect(result.success).toBe(true);
    });

    it('should pass with boundary dosage values', () => {
      const resultLower = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Stabilisation,
        dosage: 0,
      });

      const resultUpper = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Stabilisation,
        dosage: 60,
      });

      expect(resultLower.success).toBe(true);
      expect(resultUpper.success).toBe(true);
    });
  });

  describe('initialDailyDose validation', () => {
    it('should fail if initialDailyDose is negative', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Increasing,
        initialDailyDose: -10,
        changeFrequency: 7,
        changeAmount: 5,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('initialDailyDose');
        expect(result.error.issues[0].message).toBe(
          'Initial daily dose must be at least 0ml'
        );
      }
    });

    it('should fail if initialDailyDose exceeds maximum', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Increasing,
        initialDailyDose: 65,
        changeFrequency: 7,
        changeAmount: 5,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('initialDailyDose');
        expect(result.error.issues[0].message).toBe(
          'Initial daily dose cannot exceed 60ml'
        );
      }
    });

    it('should pass with valid initialDailyDose values', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Increasing,
        initialDailyDose: 25,
        changeFrequency: 7,
        changeAmount: 5,
      });

      expect(result.success).toBe(true);
    });

    it('should pass with boundary initialDailyDose values', () => {
      const resultLower = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Increasing,
        initialDailyDose: 0,
        changeFrequency: 7,
        changeAmount: 5,
      });

      const resultUpper = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Increasing,
        initialDailyDose: 60,
        changeFrequency: 7,
        changeAmount: 5,
      });

      expect(resultLower.success).toBe(true);
      expect(resultUpper.success).toBe(true);
    });
  });

  describe('changeFrequency validation', () => {
    it('should fail if changeFrequency is not an integer', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Reducing,
        initialDailyDose: 30,
        changeFrequency: 7.5,
        changeAmount: 5,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('changeFrequency');
        expect(result.error.issues[0].message).toBe(
          'Frequency must be a whole number'
        );
      }
    });

    it('should fail if changeFrequency is not positive', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Reducing,
        initialDailyDose: 30,
        changeFrequency: 0,
        changeAmount: 5,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('changeFrequency');
        expect(result.error.issues[0].message).toBe(
          'Frequency must be a positive number'
        );
      }
    });

    it('should pass with valid changeFrequency values', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Reducing,
        initialDailyDose: 30,
        changeFrequency: 7,
        changeAmount: 5,
      });

      expect(result.success).toBe(true);
    });
  });

  describe('changeAmount validation', () => {
    it('should fail if changeAmount is negative', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Reducing,
        initialDailyDose: 30,
        changeFrequency: 7,
        changeAmount: -5,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('changeAmount');
        expect(result.error.issues[0].message).toBe(
          'Change amount must be at least 0ml'
        );
      }
    });

    it('should fail if changeAmount exceeds maximum', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Reducing,
        initialDailyDose: 30,
        changeFrequency: 7,
        changeAmount: 65,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('changeAmount');
        expect(result.error.issues[0].message).toBe(
          'Change amount cannot exceed 60ml'
        );
      }
    });

    it('should pass with valid changeAmount values', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Reducing,
        initialDailyDose: 30,
        changeFrequency: 7,
        changeAmount: 5,
      });

      expect(result.success).toBe(true);
    });

    it('should pass with boundary changeAmount values', () => {
      const resultLower = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Reducing,
        initialDailyDose: 30,
        changeFrequency: 7,
        changeAmount: 0,
      });

      const resultUpper = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Reducing,
        initialDailyDose: 30,
        changeFrequency: 7,
        changeAmount: 60,
      });

      expect(resultLower.success).toBe(true);
      expect(resultUpper.success).toBe(true);
    });
  });

  describe('conditional validation based on prescription type', () => {
    it('should require dosage for Stabilisation prescription type', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Stabilisation,
        // Missing dosage
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const dosageIssue = result.error.issues.find(
          (issue) =>
            issue.message === 'Dosage is required for this prescription type'
        );
        expect(dosageIssue).toBeDefined();
      }
    });

    it('should not require initialDailyDose, changeFrequency, changeAmount for Stabilisation', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Stabilisation,
        dosage: 30,
        // Missing initialDailyDose, changeFrequency, changeAmount
      });

      expect(result.success).toBe(true);
    });

    it('should not include initialDailyDose for Stabilisation', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Stabilisation,
        dosage: 30,
        initialDailyDose: 20,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const initialDoseIssue = result.error.issues.find(
          (issue) =>
            issue.message ===
            'Initial daily dose should not be provided for this prescription type'
        );
        expect(initialDoseIssue).toBeDefined();
      }
    });

    it('should not include changeFrequency for Stabilisation', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Stabilisation,
        dosage: 30,
        changeFrequency: 7,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const changeFrequencyIssue = result.error.issues.find(
          (issue) =>
            issue.message ===
            'Change frequency should not be provided for this prescription type'
        );
        expect(changeFrequencyIssue).toBeDefined();
      }
    });

    it('should not include changeAmount for Stabilisation', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Stabilisation,
        dosage: 30,
        changeAmount: 5,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const changeAmountIssue = result.error.issues.find(
          (issue) =>
            issue.message ===
            'Change amount should not be provided for this prescription type'
        );
        expect(changeAmountIssue).toBeDefined();
      }
    });

    it('should require initialDailyDose for Increasing prescription type', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Increasing,
        // Missing initialDailyDose
        changeFrequency: 7,
        changeAmount: 5,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const initialDoseIssue = result.error.issues.find(
          (issue) =>
            issue.message ===
            'Initial daily dose is required for this prescription type'
        );
        expect(initialDoseIssue).toBeDefined();
      }
    });

    it('should require changeFrequency for Increasing prescription type', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Increasing,
        initialDailyDose: 30,
        // Missing changeFrequency
        changeAmount: 5,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const frequencyIssue = result.error.issues.find(
          (issue) =>
            issue.message ===
            'Change frequency is required for this prescription type'
        );
        expect(frequencyIssue).toBeDefined();
      }
    });

    it('should require changeAmount for Increasing prescription type', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Increasing,
        initialDailyDose: 30,
        changeFrequency: 7,
        // Missing changeAmount
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const amountIssue = result.error.issues.find(
          (issue) =>
            issue.message ===
            'Change amount is required for this prescription type'
        );
        expect(amountIssue).toBeDefined();
      }
    });

    it('should not include dosage for Increasing prescription type', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Increasing,
        dosage: 30,
        initialDailyDose: 30,
        changeFrequency: 7,
        changeAmount: 5,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const doseageIssue = result.error.issues.find(
          (issue) =>
            issue.message ===
            'Dosage should not be provided for this prescription type'
        );
        expect(doseageIssue).toBeDefined();
      }
    });

    it('should require initialDailyDose for Reducing prescription type', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Reducing,
        // Missing initialDailyDose
        changeFrequency: 7,
        changeAmount: 5,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const initialDoseIssue = result.error.issues.find(
          (issue) =>
            issue.message ===
            'Initial daily dose is required for this prescription type'
        );
        expect(initialDoseIssue).toBeDefined();
      }
    });

    it('should require changeFrequency for Reducing prescription type', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Reducing,
        initialDailyDose: 30,
        // Missing changeFrequency
        changeAmount: 5,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const frequencyIssue = result.error.issues.find(
          (issue) =>
            issue.message ===
            'Change frequency is required for this prescription type'
        );
        expect(frequencyIssue).toBeDefined();
      }
    });

    it('should require changeAmount for Reducing prescription type', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Reducing,
        initialDailyDose: 30,
        changeFrequency: 7,
        // Missing changeAmount
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const amountIssue = result.error.issues.find(
          (issue) =>
            issue.message ===
            'Change amount is required for this prescription type'
        );
        expect(amountIssue).toBeDefined();
      }
    });

    it('should not include dosage for Reducing prescription type', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Reducing,
        dosage: 30,
        initialDailyDose: 30,
        changeFrequency: 7,
        changeAmount: 5,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        const doseageIssue = result.error.issues.find(
          (issue) =>
            issue.message ===
            'Dosage should not be provided for this prescription type'
        );
        expect(doseageIssue).toBeDefined();
      }
    });
  });

  describe('complete valid objects', () => {
    it('should validate a complete Stabilisation prescription', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Wednesday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Stabilisation,
        dosage: 30,
      });

      expect(result.success).toBe(true);
    });

    it('should validate a complete Increasing prescription', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Wednesday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Increasing,
        initialDailyDose: 15,
        changeFrequency: 7,
        changeAmount: 5,
      });

      expect(result.success).toBe(true);
    });

    it('should validate a complete Reducing prescription', () => {
      const result = prescriptionScheduleSchema.safeParse({
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Wednesday, DayOfWeek.Friday],
        prescriptionType: PrescriptionType.Reducing,
        initialDailyDose: 45,
        changeFrequency: 7,
        changeAmount: 5,
      });

      expect(result.success).toBe(true);
    });
  });
});
