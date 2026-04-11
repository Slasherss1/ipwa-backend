import { PipelineStage, Types } from "mongoose";

function vote(date: Date, userId: Types.ObjectId) {
  var pipeline: PipelineStage[] = [
    {
      '$match': {
        'day': date
      }
    }, {
      '$lookup': {
        'from': 'votes',
        'localField': 'day',
        'foreignField': 'dom',
        'as': 'result',
        'pipeline': [
          {
            '$match': {
              'tom': 'ob',
              'user': new Types.ObjectId(userId)
            }
          }, {
            '$project': {
              '_id': 0,
              'vote': 1
            }
          }
        ]
      }
    }, {
      '$unwind': {
        'path': '$result',
        'preserveNullAndEmptyArrays': true
      }
    }, {
      '$set': {
        'obv': '$result.vote'
      }
    }, {
      '$lookup': {
        'from': 'votes',
        'localField': 'day',
        'foreignField': 'dom',
        'as': 'result',
        'pipeline': [
          {
            '$match': {
              'tom': 'kol',
              'user': new Types.ObjectId(userId)
            }
          }, {
            '$project': {
              '_id': 0,
              'vote': 1
            }
          }
        ]
      }
    }, {
      '$unwind': {
        'path': '$result',
        'preserveNullAndEmptyArrays': true
      }
    }, {
      '$set': {
        'kolv': '$result.vote'
      }
    }, {
      '$unset': 'result'
    }
  ]
  return pipeline
}

function voteStats(date: Date, item: string) {
  var pipeline: PipelineStage[] = [
  {
    $match: { $and: [
      {dom: date}, 
      {name: item}
    ]}
  },
  {
    $facet: {
      "stats": [
        {
          $group: {
            _id: null,
            rating: { $avg: "$vote.rating" },
            comments: {
              $addToSet: {
                $cond: [{ $ne: ["$vote.comment", ""] }, "$vote.comment", "$$REMOVE"]
              }
            }
          }
        }
      ],
      "tagCounts": [
        { $unwind: "$vote.tags" },
        {
          $group: {
            _id: "$vote.tags",
            count: { $sum: 1 }
          }
        }
      ]
    }
  },
  {
    $project: {
      rating: { $arrayElemAt: ["$stats.rating", 0] },
      comments: { $arrayElemAt: ["$stats.comments", 0] },
      tags: {
        $arrayToObject: {
          $map: {
            input: "$tagCounts",
            as: "t",
            in: { k: "$$t._id", v: "$$t.count" }
          }
        }
      }
    }
  }
]
  return pipeline
}

export { vote, voteStats }