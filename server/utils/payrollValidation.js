export const validatePayrollMonth = (
  month,
  year
) => {
  const today = new Date();

  const currentMonth =
    today.getMonth() + 1;

  const currentYear =
    today.getFullYear();

  // Future year
  if (year > currentYear) {
    return false;
  }

  // Same year but current/future month
  if (
    year === currentYear &&
    month >= currentMonth
  ) {
    return false;
  }

  return true;
};