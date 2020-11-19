module.exports.EnvHostingEnum = {
  PRODUCTION: "production",
  DEVELOPMENT: "development",
  TESTING: "test",
};

module.exports.UserRolesEnum = {
  GUEST: "guest",
  ADMIN: "admin",
  FREE: "free",
  PREMIUM: "premium",
};

module.exports.UserStatusEnum = {
  ACTIVE: "active",
  DEACTIVE: "deactive",
  DEACTIVATING: "deactivating",
  BLOCKED: "blocked",
};

module.exports.PostStatus = {
  PENDING: "pending",
  REJECTED: "rejected",
  APPROVED: "approved",
};

module.exports.PostType = {
  S_ROOM: "share_room",
  S_HOUSE: "share_room_in_house",
  N_ROOM: "need_room",
  N_HOUSE: "need_house",
  R_HOUSE: "share_whole_property",
};

module.exports.RoomFurnishing = {
  FLEXIBLE: "flexible",
  FURNISHED: "furnished",
};

module.exports.RoomToilet = {
  SHARED: "shared",
  OWNED: "owned",
};

module.exports.RoomFeatures = {
  DOOR_LOCK: "door_lock",
  AIR_CONDITIONER: "air_conditioner",
  WARDROBE: "wardrobe",
  CHAIR: "chair",
  BALCONY: "balcony",
  COUCH: "couch",
  FAN: "fan",
  KITCHENETTE: "kitchenette",
  DESK: "desk",
  TABLE: "table",
  TV: "tv",
};

module.exports.Bills = {
  INCLUDE_IN_RENT: "include_in_rent",
  SOME_IN_RENT: "some_in_rent",
  NOT_IN_RENT: "not_in_rent",
};

module.exports.CustomerPreference = {
  ANYONE: "anyone",
  FEMALE_ONLY: "female_only",
  MALE_ONLY: "male_only",
  NO_COUPLE: "no_couple",
  COUPLE: "couple",
};

module.exports.LengthOfStay = {
  UNLIMITTED: -1,
  ONE_MONTH: 1,
  TWO_MONTH: 2,
  THREE_MONTH: 3,
  FOUR_MONTH: 4,
  FIVE_MONTH: 5,
  SIX_MONTH: 6,
  SEVEN_MONTH: 7,
  EIGHT_MONTH: 8,
  NINE_MONTH: 9,
  TEN_MONTH: 10,
  ELEVEN_MONTH: 11,
  TWELVE_MONTH: 12,
};

module.exports.TypeOfPost = {
  SHARE: "share",
  NEED: "need",
};
