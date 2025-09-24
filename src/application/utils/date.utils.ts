/**
 * Date utility functions for the application
 */
export class DateUtils {

  /**
   * Formats a Date object to YYYY-MM-DD string
   * @param date Date object to format
   * @returns Formatted date string (YYYY-MM-DD)
   */
  static formatToDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * Generates array of month strings between startDate and endDate (inclusive)
   * @param startDate Start date
   * @param endDate End date
   * @returns Array of month strings in YYYY-MM format
   */
  static generateMonthRange(startDate: Date, endDate: Date): string[] {
    const months: string[] = [];
    const currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    while (currentDate <= endMonth) {
      const yearMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      months.push(yearMonth);
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return months;
  }

  /**
   * Extracts year-month from date string (YYYY-MM-DD -> YYYY-MM)
   * @param dateString Date string in YYYY-MM-DD format
   * @returns Year-month string (YYYY-MM)
   */
  static extractYearMonth(dateString: string): string {
    return dateString.substring(0, 7);
  }
}
