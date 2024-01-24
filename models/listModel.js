import mongoose from "mongoose";

const { Schema, model } = mongoose;

const listSchema = Schema({});

const List = model("List", listSchema);

export default List;
