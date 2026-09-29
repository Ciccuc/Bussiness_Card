import { buildEmploymentPeriod } from './employment-period.js';

const date = (isoDate: string): Date => new Date(`${isoDate}T00:00:00.000Z`);

describe('buildEmploymentPeriod', () => {
  describe('current job (no end date)', () => {
    it('is current and lasts until "now", counting both edge months', () => {
      const period = buildEmploymentPeriod(
        date('2023-03-01'),
        null,
        date('2026-09-28'),
      );

      expect(period).toEqual({
        startDate: date('2023-03-01'),
        endDate: null,
        isCurrent: true,
        durationInMonths: 43,
      });
    });

    it('uses the given "now" rather than the system clock', () => {
      const start = date('2023-03-01');

      const inTheFirstMonth = buildEmploymentPeriod(
        start,
        null,
        date('2023-03-15'),
      );
      const aYearLater = buildEmploymentPeriod(start, null, date('2024-02-29'));

      expect(inTheFirstMonth.durationInMonths).toBe(1);
      expect(aYearLater.durationInMonths).toBe(12);
    });

    it('has lasted 0 months when it starts after "now"', () => {
      const period = buildEmploymentPeriod(
        date('2026-10-01'),
        null,
        date('2026-09-28'),
      );

      expect(period.durationInMonths).toBe(0);
    });

    it('has lasted 1 month when it starts later in the month of "now"', () => {
      const period = buildEmploymentPeriod(
        date('2026-09-29'),
        null,
        date('2026-09-28'),
      );

      expect(period.durationInMonths).toBe(1);
    });
  });

  describe('finished job', () => {
    it('is not current and lasts until its end date, whatever "now" is', () => {
      const period = buildEmploymentPeriod(
        date('2021-06-01'),
        date('2023-02-01'),
        date('2030-01-01'),
      );

      expect(period).toEqual({
        startDate: date('2021-06-01'),
        endDate: date('2023-02-01'),
        isCurrent: false,
        durationInMonths: 21,
      });
    });

    it.each([
      ['within one month', '2024-05-01', '2024-05-31', 1],
      ['across a year boundary', '2022-11-01', '2023-01-01', 3],
      ['regardless of the day of month', '2023-01-31', '2023-02-01', 2],
      ['over whole years', '2020-01-01', '2021-12-01', 24],
    ])('counts calendar months %s', (_case, start, end, months) => {
      const period = buildEmploymentPeriod(
        date(start),
        date(end),
        date('2030-01-01'),
      );

      expect(period.durationInMonths).toBe(months);
    });

    it('fails with the name of the violated constraint when it ends before it starts', () => {
      const buildReversedPeriod = () =>
        buildEmploymentPeriod(
          date('2023-03-15'),
          date('2023-03-01'),
          date('2030-01-01'),
        );

      expect(buildReversedPeriod).toThrow(
        'Job period from 2023-03-15 to 2023-03-01 violates experiences_end_date_after_start_date_check',
      );
    });
  });
});
