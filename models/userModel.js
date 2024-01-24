import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { model, Schema } = mongoose;

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      title: String,
      imageUrl: String,
    },
    role: {
      type: String,
      required: true,
      enum: ["Newsmaker", "Newsroom", "Editor", "Support", "Admin"],
      default: "Newsmaker",
    },
    phoneNumber: {
      type: String,
    },
    isSubscriptionValid: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    authCode: {
      //Same as 2FA code
      type: String,
    },
    city: {
      type: String,
    },
    country: {
      type: String,
    },
    region: {
      type: String,
    },
    language: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Method to compare a password with the stored password hash
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = model("User", userSchema);

export default User;
