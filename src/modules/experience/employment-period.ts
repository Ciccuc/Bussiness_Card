import type { EmploymentPeriod } from './models/employment-period.model.js';

export function buildEmploymentPeriod(
  startDate: Date,
  endDate: Date | null,
  now: Date,
): EmploymentPeriod {
  if (endDate === null) {
    return {
      startDate,
      endDate,
      isCurrent: true,
      durationInMonths: monthsWorkedSoFar(startDate, now),
    };
  }
  if (endDate.getTime() < startDate.getTime()) {
    throw new Error(
      `Job period from ${toIsoDate(startDate)} to ${toIsoDate(endDate)} violates experiences_end_date_after_start_date_check: it ends before it starts`,
    );
  }
  return {
    startDate,
    endDate,
    isCurrent: false,
    durationInMonths: countMonthsInclusive(startDate, endDate),
  };
}

function monthsWorkedSoFar(startDate: Date, now: Date): number {
  const hasNotStartedYet =
    monthsSinceYearZero(now) < monthsSinceYearZero(startDate);
  if (hasNotStartedYet) {
    return 0;
  }
  return countMonthsInclusive(startDate, now);
}

function countMonthsInclusive(firstDate: Date, lastDate: Date): number {
  return monthsSinceYearZero(lastDate) - monthsSinceYearZero(firstDate) + 1;
}

function monthsSinceYearZero(date: Date): number {
  return date.getUTCFullYear() * 12 + date.getUTCMonth();
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
