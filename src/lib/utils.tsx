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