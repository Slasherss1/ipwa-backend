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
  return
}

export { userNotif, roomNotif, allNotif, groupNotif }