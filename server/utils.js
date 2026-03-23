//formatting of date
const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

//calculate end date 12 weeks from a specific date
const calcEndDate = (startDate) => {
  const end = new Date(startDate);
  end.setDate(end.getDate() + 84);
  return formatDate(end);
};

//filter for only private routines
const filterPrivateRoutines = (routines) => {
  return routines.filter((routine) => !routine.is_public);
};

module.exports = { formatDate, calcEndDate, filterPrivateRoutines };
