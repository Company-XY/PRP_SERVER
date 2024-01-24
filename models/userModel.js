import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const userSchema = Schema({});

const User = model("User", userSchema);

export default User;
