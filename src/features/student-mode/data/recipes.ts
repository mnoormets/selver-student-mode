import type { Recipe } from '../types';

// Each entry is one serving. Ingredient quantities inherit the product's unit.
// Water, salt, pepper, and a little cooking oil are assumed pantry staples.
export const recipes: readonly Recipe[] = [
  {
    id: "berry-oats",
    title: "Warm berry oats",
    totalMinutes: 8,
    mealSlots: ["breakfast"],
    vegetarian: true,
    ingredients: [
      { productId: "oats", quantity: 70 },
      { productId: "milk", quantity: 200 },
      { productId: "berries", quantity: 60 },
    ],
  },
  {
    id: "egg-oats",
    title: "Savory egg and vegetable oats",
    totalMinutes: 13,
    mealSlots: ["breakfast"],
    vegetarian: true,
    ingredients: [
      { productId: "oats", quantity: 65 },
      { productId: "eggs", quantity: 2 },
      { productId: "mixed-veg", quantity: 80 },
    ],
  },
  {
    id: "chickpea-pasta",
    title: "Tomato and chickpea spaghetti",
    totalMinutes: 17,
    mealSlots: ["lunch", "dinner"],
    vegetarian: true,
    ingredients: [
      { productId: "spaghetti", quantity: 90 },
      { productId: "chickpeas", quantity: 100 },
      { productId: "tomatoes", quantity: 100 },
      { productId: "mixed-veg", quantity: 80 },
    ],
  },
  {
    id: "egg-pasta",
    title: "Egg and vegetable spaghetti",
    totalMinutes: 16,
    mealSlots: ["lunch", "dinner"],
    vegetarian: true,
    ingredients: [
      { productId: "spaghetti", quantity: 90 },
      { productId: "eggs", quantity: 2 },
      { productId: "mixed-veg", quantity: 130 },
    ],
  },
  {
    id: "chickpea-stew",
    title: "Chickpea and vegetable tomato stew",
    totalMinutes: 15,
    mealSlots: ["lunch", "dinner"],
    vegetarian: true,
    ingredients: [
      { productId: "chickpeas", quantity: 120 },
      { productId: "tomatoes", quantity: 120 },
      { productId: "mixed-veg", quantity: 150 },
    ],
  },
  {
    id: "chicken-tomato-pasta",
    title: "Chicken and tomato spaghetti",
    totalMinutes: 19,
    mealSlots: ["lunch", "dinner"],
    vegetarian: false,
    ingredients: [
      { productId: "chicken", quantity: 130 },
      { productId: "spaghetti", quantity: 90 },
      { productId: "tomatoes", quantity: 130 },
      { productId: "mixed-veg", quantity: 60 },
    ],
  },
  {
    id: "chicken-veg-pasta",
    title: "Chicken and vegetable spaghetti",
    totalMinutes: 19,
    mealSlots: ["lunch", "dinner"],
    vegetarian: false,
    ingredients: [
      { productId: "chicken", quantity: 130 },
      { productId: "spaghetti", quantity: 90 },
      { productId: "mixed-veg", quantity: 150 },
    ],
  },
  {
    id: "tomato-eggs",
    title: "Tomato and egg skillet",
    totalMinutes: 16,
    mealSlots: ["lunch", "dinner"],
    vegetarian: true,
    ingredients: [
      { productId: "eggs", quantity: 2 },
      { productId: "tomatoes", quantity: 140 },
      { productId: "mixed-veg", quantity: 80 },
    ],
  },
  {
    id: "hakkliha-pannkoogid",
    title: "Minced meat pancakes",
    totalMinutes: 25,
    mealSlots: ["lunch", "dinner"],
    vegetarian: false,
    // Batter/dough is assumed from pantry when the student says they have taigen.
    ingredients: [
      { productId: "eggs", quantity: 2 },
      { productId: "minced-meat", quantity: 300 },
      { productId: "mixed-veg", quantity: 100 },
    ],
  },
  {
    id: "chicken-stew",
    title: "Chicken and vegetable stew",
    totalMinutes: 22,
    mealSlots: ["lunch", "dinner"],
    vegetarian: false,
    ingredients: [
      { productId: "chicken", quantity: 150 },
      { productId: "tomatoes", quantity: 140 },
      { productId: "mixed-veg", quantity: 150 },
    ],
  },
];
