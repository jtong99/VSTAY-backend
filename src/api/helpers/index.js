const toObjectId = (id) => {
  if (typeof id === "string" && id.length != 24) {
    throw new APIError({
      message: `Invalid id format ${id}`,
      status: httpStatus.BAD_REQUEST,
      errors: [
        {
          field: "id",
          location: "toObjectId",
          message: "Cannot convert to ObjectID instance",
        },
      ],
    });
  }

  return new ObjectID(id.toString());
};

module.exports = {
  toObjectId,
};
