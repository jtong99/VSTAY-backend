let radians = function (degree) {
  // degrees to radians
  let rad = (degree * Math.PI) / 180;

  return rad;
};

/**
 * Haversine get distance in kilometers
 *
 * @param {latitude 1} lat1 latitude 1
 * @param {longitude 1} lon1 longitude 1
 * @param {latitude 2} lat2 latitude 2
 * @param {longitude 2} lon2 longitude 2
 */

const haversine = (lat1, lon1, lat2, lon2) => {
  let dlat, dlon, a, c, R;

  R = 6372.8; // km
  dlat = radians(lat2 - lat1);
  dlon = radians(lon2 - lon1);
  lat1 = radians(lat1);
  lat2 = radians(lat2);
  a =
    Math.sin(dlat / 2) * Math.sin(dlat / 2) +
    Math.sin(dlon / 2) * Math.sin(dlon / 2) * Math.cos(lat1) * Math.cos(lat2);
  c = 2 * Math.asin(Math.sqrt(a));
  return R * c;
};

// const getNearestLocation = (target, array) => {
//   const closest = array[0];
//   const closest_distance = haversine(closest, position.coords);
//   for (let i = 1; i < array.length; i++) {
//     if (distance(array[i], position.coords) < closest_distance) {
//       closest_distance = distance(array[i], position.coords);
//       closest = array[i];
//     }
//   }
// };

module.exports = { haversine };
