const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

export const getCurrentTrainingDay = () => {
  return days[new Date().getDay()];
};
