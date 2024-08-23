import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import Sqids from "sqids"
import { v4 as uuidv4 } from 'uuid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const sqids = new Sqids({
  alphabet: process.env.SQIDS_ALPHABET!,
  minLength: 6,
})

function uuidToNumberArray(uuid: any) {
  // Remove hyphens and convert to lowercase
  const hex = uuid.replace(/-/g, '').toLowerCase();
  
  // Convert each pair of hex digits to a number
  const numbers = [];
  for (let i = 0; i < hex.length; i += 2) {
    numbers.push(parseInt(hex.substr(i, 2), 16));
  }

  // Randomly pick 4 numbers from the numbers array
  const randomNumbers: number[] = [];
  while (randomNumbers.length < 3) {
    const randomIndex = Math.floor(Math.random() * numbers.length);
    const randomNumber = numbers[randomIndex];
    if (!randomNumbers.includes(randomNumber)) {
      randomNumbers.push(randomNumber);
    }
  }

  const dateNumber = new Date().getTime() % 10000;
  randomNumbers.push(dateNumber)
  
  return randomNumbers;
}

export const genShortId = () => {
  const newId = uuidv4();
  const numbers = uuidToNumberArray(newId);
  const result = sqids.encode(numbers)
  return result
}

export const noRing = 'ring-0 active:ring-0 active:ring-offset-0 focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0'