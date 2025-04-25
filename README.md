# CGL Tech Test

## Overview

For this task, I created a NextJS application that will collect the required information via a form, and upon form submission, a server action will be run that calculates the prescription pickup schedule, based on the provided form data.

I went with NextJS for this exercise because it is a nice full stack solution that provides both a friendly user interface as well as means for running the core logic server side. I also used a zod schema for validation, which provide a clean and easy way to validate the form of data. I used it to not only validate the expected data types for the fields, but also the conditional logic based on the selected prescription type. It also can be used both client and server side, which is especially nice if you are working in a situation where you have a separate Node backend, and you wrap your schemas in an npm package and re-use them on the front and back end to ensure consistency between them.

## App Directory

```none
cgl-interview/
├── app/ # App Router directory
│ ├── layout.tsx # Root layout
│ ├── page.tsx # Home page
│ ├── actions/ # Server Actions
│ │ ├── generate-schedule.ts # Business logic for schedule generation
│ ├── layout.tsx
│ ├── page.tsx
│ ├── components/ # React components
│ │ ├── ScheduleTable.tsx
│ │ └── PrescriptionForm.tsx
│ ├── lib/prescriptionSchedule # validation and enums for the schedule
│ │ ├── enums.ts
│ │ └── schema.ts # Zod validation schema
│ ├── tests/ # Unit tests
│ ├── utils/ # Utility functions
│ │ ├── date.ts # Utility functions for dates
├── public/ # Static assets like images and fonts
├── next.config.js # Next.js configuration
├── tsconfig.json # TypeScript configuration
├── vitest.config.js # Vitest configuration
└── package.json # Project metadata and dependencies
```

## Running the application

This is a NextJS application that I started with `create-next-app`.

- Install dependencies using `npm i`
- Run the application using `npm run dev`
- View the app in your browser at `http://localhost:3000/`

## Unit tests

Tests can be found in the `src/app/tests` directory. I wrote unit tests to cover both the zod schema and the core business logic that lives in the server action.

The tests can be run by running the `npm run test` command.
