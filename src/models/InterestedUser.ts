import mongoose from "mongoose";

const InterestedUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    mobileNumber: {
      type: String,
      required: [true, "Please provide a mobile number"],
      match: [/^[6-9]\d{9}$/, "Please provide a valid 10-digit mobile number"],
    },
    registrationNumber: {
      type: String,
      trim: true,
    },
    schoolCollegeName: {
      type: String,
      trim: true,
    },
    workshopNames: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      default: "Interested",
    },
  },
  {
    timestamps: true,
  },
);

const InterestedUser =
  mongoose.models.InterestedUser ||
  mongoose.model("InterestedUser", InterestedUserSchema);

export default InterestedUser;
