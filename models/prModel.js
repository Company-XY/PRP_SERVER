import mongoose from "mongoose";

const { Schema, model } = mongoose;

//Pr might need to look for another name for press release
const prSchema = Schema(
  {
    author: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    targetCountry: {
      type: String,
    },
    targetRegion: {
      type: String,
    },
    embargoed: {
      type: Boolean,
      required: true,
      default: false,
    },
    embargoedTill: {
      type: Date,
    },
    factChecked: {
      type: Boolean,
      default: false,
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
    reviewedBy: {
      type: String,
    },
    audioFiles: [
      {
        title: String,
        audioUrl: String,
      },
    ],
    imageFIles: [
      {
        title: String,
        imageUrl: String,
      },
    ],
    videoFiles: [
      {
        title: String,
        videoUrl: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Pr = model("Pr", prSchema);

export default Pr;
