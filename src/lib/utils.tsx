import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Fragment } from 'react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const renderWithBreaks = (text: string) =>
  text.split(/<br\s*\/?>/i).map((part, index) => (
    <Fragment key={index}>
      {part}
      {index < text.split(/<br\s*\/?>/i).length - 1 && <br />}
    </Fragment>
  ));


export function toISODateTime(time: string) {
  const now = new Date();

  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes
  );

  return date.toISOString();
}