import mongoose from "mongoose";

const { Schema, model } = mongoose;

//Pr might need to look for another name for press release
const prSchema = Schema({});

const Pr = model("Pr", prSchema);

export default Pr;
