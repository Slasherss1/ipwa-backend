import { PipelineStage, Types } from "mongoose"

function userNotif(uname: string) {
  var pipeline: PipelineStage[] = [
    {
      "$match": {
        uname: uname
      }
    }
  ]
  return pipeline
}

function roomNotif(room: number) {
  var pipeline: PipelineStage[] = [
    {
      $lookup: {
        from: "logins",
        localField: "uname",
        foreignField: "uname",
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $addFields: {
        rooms: "$user.room",
      },
    },
    {
      $match:
        {
          rooms: room,
        },
    },
    {
      $unset:
        ["user", "uname", "rooms"],
    },
  ]
  return pipeline
}

function allNotif() {
  var pipeline: PipelineStage[] = [
    {
      $lookup: {
        from: "logins",
        localField: "uname",
        foreignField: "uname",
        as: "user",
      },
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $addFields: {
        rooms: "$user.room",
      },
    },
    {
      $match:
        {
          rooms: {$exists: true},
        },
    },
    {
      $unset:
        ["user", "uname", "rooms"],
    },
  ]
  return pipeline
}

function groupNotif(group: string) {
  var pipeline: PipelineStage[] = [
    {
      $match:
        {
          _id: new Types.ObjectId(group)
        }
    },
    {
      $graphLookup:
        {
          from: "logins",
          startWith: "$rooms",
          connectFromField: "rooms",
          connectToField: "room",
          as: "logins",
        },
    },
    {
      $set: {
        unames: {
          $function: {
            body: "function (arg, arg2) { if (!arg2) arg2 = []; return [...arg2,...arg.map((s) => s.uname)];}",
            args: ["$logins", "$unames"],
            lang: "js",
          },
        },
      },
    },
    {
      $unwind:
        {
          path: "$unames",
        },
    },
    {
      $graphLookup:
        {
          from: "notifications",
          startWith: "$unames",
          connectFromField: "unames",
          connectToField: "uname",
          as: "notif",
        },
    },
    {
      $project:
        {
          notif: 1,
        },
    },
    {
      $unwind:
        {
          path: "$notif",
        },
    },
    {
      $replaceRoot:
        {
          newRoot: "$notif",
        },
    },
  ]
  return pipeline
}

export { userNotif, roomNotif, allNotif, groupNotif }