import type { PlanDay, StudentProfile } from '../types';

export const demoProfile: Readonly<StudentProfile> = {
  budgetCents: 3500,
  diet: 'standard',
  cookUnderMinutes: 20,
};

// Reproducible offline sample, displayed as such if the live meal-idea request fails.
export const demoWeek: readonly PlanDay[] = [
  { day: "Monday", meals: { breakfast: "berry-oats", lunch: "chickpea-pasta", dinner: "chicken-tomato-pasta" } },
  { day: "Tuesday", meals: { breakfast: "egg-oats", lunch: "egg-pasta", dinner: "tomato-eggs" } },
  { day: "Wednesday", meals: { breakfast: "berry-oats", lunch: "chickpea-stew", dinner: "chicken-veg-pasta" } },
  { day: "Thursday", meals: { breakfast: "berry-oats", lunch: "egg-pasta", dinner: "chickpea-pasta" } },
  { day: "Friday", meals: { breakfast: "egg-oats", lunch: "chickpea-pasta", dinner: "chicken-tomato-pasta" } },
  { day: "Saturday", meals: { breakfast: "berry-oats", lunch: "chickpea-stew", dinner: "tomato-eggs" } },
  { day: "Sunday", meals: { breakfast: "berry-oats", lunch: "egg-pasta", dinner: "chickpea-stew" } },
];
