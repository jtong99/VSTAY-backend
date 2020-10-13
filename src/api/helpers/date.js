const { format, differenceInHours } = require("date-fns");

const ensureUnixTimestampInSeconds = (time) => {
  const formattedTime = time.toString().length !== 14 ? time * 1000 : time;

  return formattedTime;
};

const formatTimeIn8601 = (time) => {
  // transform UNIX timestamp in seconds to milliseconds
  if (typeof time === "number") {
    const formattedTime = new Date(ensureUnixTimestampInSeconds(time));

    return format(formattedTime, "yyyy-MM-dd'T'HH:mm:ssxxx");
  }

  return format(time, "yyyy-MM-dd'T'HH:mm:ssxxx");
};

module.exports = {
  formatTimeIn8601,
};
