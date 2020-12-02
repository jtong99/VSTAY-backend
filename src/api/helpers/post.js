module.exports.ESsortItems = {
  //   bestMatch: {
  //     _score: "desc",
  //   },
  // mostView: {
  //     'statistics.viewCount': {
  //         mode: 'max',
  //         order: 'desc',
  //         nested_path: 'statistics',
  //     },
  // },
  newest: {
    createdAt: "desc",
  },
  //   mostLike: {
  //     "statistics.likeCount": {
  //       mode: "max",
  //       order: "desc",
  //       nested_path: "statistics",
  //     },
  //   },
  //   uploadStatus: {
  //     uploadStatus: "asc",
  //   },
};

module.exports.sortItems = {
  mostView: {
    "statistics.viewCount": -1,
  },
  newest: {
    releasedAt: -1,
  },
  oldest: {
    releasedAt: 1,
  },
  mostLike: {
    "statistics.likeCount": -1,
  },
  status: {
    status: 1,
  },
};
