'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  prescriptionFormSchema,
  PrescriptionFormValues,
  defaultFormValues,
} from '@app/lib/prescriptionForm/schema';

import { DayOfWeek, PrescriptionType } from '@app/lib/prescriptionForm/enums';

export default function PrescriptionForm() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PrescriptionFormValues>({
    resolver: zodResolver(prescriptionFormSchema),
    defaultValues: defaultFormValues,
  });

  const prescriptionType = watch('prescriptionType');

  useEffect(() => {
    if (prescriptionType === PrescriptionType.Stabilisation) {
      setValue('initialDailyDose', undefined);
      setValue('changeFrequency', undefined);
      setValue('changeAmount', undefined);
    } else {
      setValue('dosage', undefined);
    }
  }, [prescriptionType, setValue]);

  const onSubmit = async (data: PrescriptionFormValues) => {
    setIsLoading(true);
    try {
      console.info(`Form submitted with data:`, JSON.stringify(data));
    } catch (error) {
      console.error('Error processing form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onError = (errors: any) => {
    console.error('Validation errors:', errors);
  };

  const stabilisationSection = (
    <div>
      <label htmlFor="dosage" className="block text-gray-700 font-medium">
        Dosage (ml)
      </label>
      <input
        type="number"
        id="dosage"
        {...register('dosage', { valueAsNumber: true })}
        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        step="0.01"
      />
      {errors.dosage && (
        <p className="text-red-500 text-sm mt-1">{errors.dosage.message}</p>
      )}
    </div>
  );

  const variableDoseSection = (
    <>
      <div>
        <label htmlFor="initialDailyDose" className="block text-gray-700">
          Initial Daily Dose (ml)
        </label>
        <input
          type="number"
          id="initialDailyDose"
          {...register('initialDailyDose', { valueAsNumber: true })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          step="0.01"
        />
        {errors.initialDailyDose && (
          <p className="text-red-500 text-sm mt-1">
            {errors.initialDailyDose.message}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="changeFrequency" className="block text-gray-700">
          Frequency (days)
        </label>
        <input
          type="number"
          id="changeFrequency"
          {...register('changeFrequency', { valueAsNumber: true })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          min="1"
          step="1"
        />
        {errors.changeFrequency && (
          <p className="text-red-500 text-sm mt-1">
            {errors.changeFrequency.message}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="changeAmount" className="block text-gray-700">
          {`Amount to ${
            prescriptionType === PrescriptionType.Increasing
              ? 'Increase'
              : 'Decrease'
          } (ml)`}
        </label>
        <input
          type="number"
          id="changeAmount"
          {...register('changeAmount', { valueAsNumber: true })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          step="0.01"
        />
        {errors.changeAmount && (
          <p className="text-red-500 text-sm mt-1">
            {errors.changeAmount.message}
          </p>
        )}
      </div>
    </>
  );

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">
        Generate Prescription Schedule
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">
            Days of Week Availability
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Object.values(DayOfWeek)
              .filter((v) => typeof v === 'number')
              .map((value) => (
                <div key={value} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`dow-${value}`}
                    value={value}
                    {...register('daysOfWeek')}
                    className="mr-2"
                  />
                  <label htmlFor={`dow-${value}`}>{DayOfWeek[value]}</label>
                </div>
              ))}
          </div>
          {errors.daysOfWeek && (
            <p className="text-red-500 text-sm mt-1">
              {errors.daysOfWeek.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="prescriptionType"
            className="block text-gray-700 font-medium"
          >
            Prescription Type
          </label>
          <select
            id="prescriptionType"
            {...register('prescriptionType')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            {Object.values(PrescriptionType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.prescriptionType && (
            <p className="text-red-500 text-sm mt-1">
              {errors.prescriptionType.message}
            </p>
          )}
        </div>

        <div className="space-y-4 p-4 border border-gray-200 rounded-md bg-gray-50">
          <h3 className="font-medium">
            {`${prescriptionType.toString()}  Details`}
          </h3>
          {(prescriptionType === PrescriptionType.Increasing ||
            prescriptionType === PrescriptionType.Reducing) &&
            variableDoseSection}

          {prescriptionType === PrescriptionType.Stabilisation &&
            stabilisationSection}
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="cursor-pointer w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:opacity-70"
          >
            {isLoading ? 'Processing...' : 'Generate Schedule'}
          </button>
        </div>
      </form>

      {/* TODO: display table results */}
    </div>
  );
}
