const generateRandomUserAvatar = (name) => {
  const url = "https://ui-avatars.com/api";
  const size = 285;
  const src = `${url}/?size=${size}&name=${name}`;

  return src;
};

module.exports.generateFakeAvatar = generateRandomUserAvatar;
