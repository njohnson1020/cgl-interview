'use server';

import { addDays, differenceInDays, format, startOfDay } from 'date-fns';
import { getCurrentDate } from '@app/utils/date';
import {
  prescriptionScheduleSchema,
  PrescriptionFormValues,
} from '@app/lib/prescriptionSchedule/schema';
import { PrescriptionType } from '@app/lib/prescriptionSchedule/enums';

const today = startOfDay(getCurrentDate());

const calculateSchedule = (
  data: PrescriptionFormValues,
  getDailyDosage: (
    currentDate: Date,
    firstPickupDay: ScheduleDay | undefined
  ) => number
) => {
  const schedule: ScheduleDay[] = [];
  let firstPickupDay: ScheduleDay | undefined;
  let lastPickupDay: ScheduleDay | undefined;

  for (let i = 0; i < 14; i++) {
    const currentDate = addDays(today, i);
    const dayOfWeek = currentDate.getDay();
    const isPickupDay = data.daysOfWeek.includes(dayOfWeek);

    // Get the current dosage using the provided callback
    const currentDosage = getDailyDosage(currentDate, firstPickupDay);

    const currentScheduleDate: ScheduleDay = {
      index: i,
      date: currentDate,
      dose: isPickupDay ? currentDosage : 0,
      pickup: isPickupDay,
    };

    // If it's a pickup day, update tracking variables
    if (isPickupDay) {
      // Set the first pickup day if it doesn't exist
      if (!firstPickupDay) {
        firstPickupDay = currentScheduleDate;
      }
      lastPickupDay = currentScheduleDate;
    } else {
      // If it's not a pickup day, add the daily dosage to the most recent pickup day if it exists
      if (lastPickupDay) {
        const lastPickupDayIndex = lastPickupDay.index;
        const entry = schedule[lastPickupDayIndex];
        entry.dose = entry.dose + currentDosage;
      }
    }

    schedule.push(currentScheduleDate);
  }

  return schedule;
};

const calculateStabilisationDosageSchedule = (data: PrescriptionFormValues) => {
  const dailyDosage = data.dosage!;

  // For stabilisation, dosage is constant regardless of date
  return calculateSchedule(data, () => dailyDosage);
};

const calculateVariableDosageSchedule = (data: PrescriptionFormValues) => {
  const initialDailyDose = data.initialDailyDose!;
  const changeFrequency = data.changeFrequency!;
  const changeAmount = data.changeAmount!;
  const isIncreasing = data.prescriptionType === PrescriptionType.Increasing;

  return calculateSchedule(data, (currentDate, firstPickupDay) => {
    // If no first pickup day yet, return initial dose
    if (!firstPickupDay) {
      return initialDailyDose;
    }

    // Calculate if there should be a dosage change
    const daysDifference = differenceInDays(currentDate, firstPickupDay.date);
    const shouldChangeDosage = daysDifference % changeFrequency === 0;

    if (shouldChangeDosage) {
      // Calculate how many changes to apply
      const changeCount = Math.floor(daysDifference / changeFrequency);
      // Apply dosage change based on prescription type
      return isIncreasing
        ? initialDailyDose + changeAmount * changeCount
        : initialDailyDose - changeAmount * changeCount;
    }

    // If no change is needed on this day, calculate current dosage based on previous changes
    const previousChangeDay =
      daysDifference - (daysDifference % changeFrequency);
    const previousChanges = Math.floor(previousChangeDay / changeFrequency);

    return isIncreasing
      ? initialDailyDose + changeAmount * previousChanges
      : initialDailyDose - changeAmount * previousChanges;
  });
};

export const generatePrescriptionSchedule = async (
  data: PrescriptionFormValues
): Promise<ScheduleDay[]> => {
  // Validate the data again on the server
  const validatedData: PrescriptionFormValues =
    prescriptionScheduleSchema.parse(data);

  const dosageSchedule =
    validatedData.prescriptionType === PrescriptionType.Stabilisation
      ? calculateStabilisationDosageSchedule(validatedData)
      : calculateVariableDosageSchedule(validatedData);

  return Promise.resolve(dosageSchedule);
};
