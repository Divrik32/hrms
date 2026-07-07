export const getDaysInMonth = (month, year) => {
  if (
    typeof month !== "number" ||
    typeof year !== "number"
  ) {
    throw new Error("Month and Year must be numbers.");
  }

  if (month < 1 || month > 12) {
    throw new Error("Month must be between 1 and 12.");
  }

  return new Date(year, month, 0).getDate();
};