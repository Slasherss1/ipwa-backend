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

export { vote }