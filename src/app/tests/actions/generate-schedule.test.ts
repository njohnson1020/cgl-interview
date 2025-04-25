import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { generatePrescriptionSchedule } from '@app/actions/generate-schedule';
import {
  DayOfWeek,
  PrescriptionType,
} from '@app/lib/prescriptionSchedule/enums';
import { PrescriptionFormValues } from '@app/lib/prescriptionSchedule/schema';
import { getCurrentDate } from '@app/utils/date';
import { prescriptionScheduleSchema } from '@app/lib/prescriptionSchedule/schema';

vi.mock('@app/utils/date', () => ({
  getCurrentDate: vi.fn(),
}));

vi.mock('@app/lib/prescriptionSchedule/schema', () => ({
  prescriptionScheduleSchema: {
    parse: vi.fn((data) => data),
  },
}));

describe('Prescription Schedule Generator', () => {
  const mockToday = new Date(2025, 3, 24);

  beforeEach(() => {
    vi.mocked(getCurrentDate).mockReturnValue(mockToday);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Stabilisation Dosage Schedule', () => {
    test('should generate correct schedule with daily pickups', async () => {
      const formData: PrescriptionFormValues = {
        prescriptionType: PrescriptionType.Stabilisation,
        daysOfWeek: [
          DayOfWeek.Sunday,
          DayOfWeek.Monday,
          DayOfWeek.Tuesday,
          DayOfWeek.Wednesday,
          DayOfWeek.Thursday,
          DayOfWeek.Friday,
          DayOfWeek.Saturday,
        ],
        dosage: 10,
      };

      const schedule = await generatePrescriptionSchedule(formData);

      expect(schedule.length).toBe(14);

      schedule.forEach((day) => {
        expect(day.pickup).toBe(true);
        expect(day.dose).toBe(10);
      });
    });

    test('should correctly add dosage to previous pickup day', async () => {
      const formData: PrescriptionFormValues = {
        prescriptionType: PrescriptionType.Stabilisation,
        daysOfWeek: [DayOfWeek.Monday, DayOfWeek.Friday],
        dosage: 20,
      };

      const schedule = await generatePrescriptionSchedule(formData);

      const pickupDays = schedule.filter((x) => x.pickup);
      expect(pickupDays.length).toBe(4);
      expect(pickupDays[0].dose).toBe(60); // Friday-Sunday
      expect(pickupDays[1].dose).toBe(80); // Monday-Thursday
      expect(pickupDays[2].dose).toBe(60); // Friday-Sunday
      expect(pickupDays[3].dose).toBe(60); // Monday-Wednesday (hits the 14-day limit)

      expectZeroDoseOnNonPickupDays(schedule);
    });
  });

  describe('Variable Dosage Schedule', () => {
    test('should generate correct schedule for increasing dosage', async () => {
      // Pickup every day, increase by 5 every 3 days
      const formData: PrescriptionFormValues = {
        prescriptionType: PrescriptionType.Increasing,
        daysOfWeek: [
          DayOfWeek.Sunday,
          DayOfWeek.Monday,
          DayOfWeek.Tuesday,
          DayOfWeek.Wednesday,
          DayOfWeek.Thursday,
          DayOfWeek.Friday,
          DayOfWeek.Saturday,
        ],
        initialDailyDose: 10,
        changeFrequency: 3,
        changeAmount: 5,
      };

      const schedule = await generatePrescriptionSchedule(formData);

      expect(schedule.length).toBe(14);

      // Check that dosages increase properly every 3 days
      // Day 0-2: 10
      // Day 3-5: 15
      // Day 6-8: 20
      // Day 9-11: 25
      // Day 12-13: 30
      schedule.forEach((day, index) => {
        if (index < 3) {
          expect(day.dose).toBe(10);
        } else if (index < 6) {
          expect(day.dose).toBe(15);
        } else if (index < 9) {
          expect(day.dose).toBe(20);
        } else if (index < 12) {
          expect(day.dose).toBe(25);
        } else {
          expect(day.dose).toBe(30);
        }
      });
    });

    test('should generate correct schedule for reducing dosage', async () => {
      // Pickup every day, reduce by 5 every 3 days
      const formData: PrescriptionFormValues = {
        prescriptionType: PrescriptionType.Reducing,
        daysOfWeek: [
          DayOfWeek.Sunday,
          DayOfWeek.Monday,
          DayOfWeek.Tuesday,
          DayOfWeek.Wednesday,
          DayOfWeek.Thursday,
          DayOfWeek.Friday,
          DayOfWeek.Saturday,
        ],
        initialDailyDose: 30,
        changeFrequency: 3,
        changeAmount: 5,
      };

      const schedule = await generatePrescriptionSchedule(formData);

      expect(schedule.length).toBe(14);

      // Check that dosages decrease properly every 3 days
      // Day 0-2: 30
      // Day 3-5: 25
      // Day 6-8: 20
      // Day 9-11: 15
      // Day 12-13: 10
      schedule.forEach((day, index) => {
        if (index < 3) {
          expect(day.dose).toBe(30);
        } else if (index < 6) {
          expect(day.dose).toBe(25);
        } else if (index < 9) {
          expect(day.dose).toBe(20);
        } else if (index < 12) {
          expect(day.dose).toBe(15);
        } else {
          expect(day.dose).toBe(10);
        }
      });
    });

    test('should handle a dose increasing on a non-pickup day', async () => {
      // Pickup on Sunday, Tuesday, increase by 5 every 3 days
      const formData: PrescriptionFormValues = {
        prescriptionType: PrescriptionType.Increasing,
        daysOfWeek: [DayOfWeek.Sunday, DayOfWeek.Tuesday],
        initialDailyDose: 10,
        changeFrequency: 3,
        changeAmount: 5,
      };

      const schedule = await generatePrescriptionSchedule(formData);

      // Check that the schedule length is correct
      expect(schedule.length).toBe(14);

      //Thursday: 0
      //Friday: 0
      //Saturday: 0
      //Sunday[10] (plus Monday[10]): 20
      //Tuesday[10] (plus Wednesday[15], Thurs[15], Fri[15], Sat[20]): 75
      //Sunday[20] (plus Monday[20]): 40
      //Tuesday[25], Wednesday[25]]): 50

      const pickupDays = schedule.filter((x) => x.pickup);
      expect(pickupDays.length).toBe(4);
      expect(pickupDays[0].dose).toBe(20); // Sunday
      expect(pickupDays[1].dose).toBe(75); // Tuesday
      expect(pickupDays[2].dose).toBe(40); // Sunday
      expect(pickupDays[3].dose).toBe(50); // Tuesday

      expectZeroDoseOnNonPickupDays(schedule);
    });

    test('should handle a dose reducing on a non-pickup day', async () => {
      // Pickup on Sunday, Tuesday, reduce by 5 every 3 days
      const formData: PrescriptionFormValues = {
        prescriptionType: PrescriptionType.Reducing,
        daysOfWeek: [DayOfWeek.Sunday, DayOfWeek.Tuesday],
        initialDailyDose: 25,
        changeFrequency: 3,
        changeAmount: 5,
      };

      const schedule = await generatePrescriptionSchedule(formData);

      // Check that the schedule length is correct
      expect(schedule.length).toBe(14);

      //Thursday: 0
      //Friday: 0
      //Saturday: 0
      //Sunday[25] (plus Monday[25]): 50
      //Tuesday[25] (plus Wednesday[20], Thurs[20], Fri[20], Sat[15]): 100
      //Sunday[15] (plus Monday[15]): 30
      //Tuesday[10], Wednesday[10]]): 20

      const pickupDays = schedule.filter((x) => x.pickup);
      expect(pickupDays.length).toBe(4);
      expect(pickupDays[0].dose).toBe(50); // Sunday
      expect(pickupDays[1].dose).toBe(100); // Tuesday
      expect(pickupDays[2].dose).toBe(30); // Sunday
      expect(pickupDays[3].dose).toBe(20); // Tuesday

      expectZeroDoseOnNonPickupDays(schedule);
    });
  });

  test('should throw error for invalid data', async () => {
    // Mock schema validation to throw an error
    vi.mocked(prescriptionScheduleSchema.parse).mockImplementationOnce(() => {
      throw new Error('Invalid data');
    });

    const invalidData = {};

    await expect(
      generatePrescriptionSchedule(invalidData as PrescriptionFormValues)
    ).rejects.toThrow('Invalid data');
  });
});

// Helper function to verify non-pickup days have a dose of 0
const expectZeroDoseOnNonPickupDays = (schedule: ScheduleDay[]) => {
  const nonPickupDays = schedule.filter((x) => !x.pickup);

  // Ensure non-pickup days have a dose of 0
  nonPickupDays.forEach((day) => {
    expect(day.dose).toBe(0);
  });
};
