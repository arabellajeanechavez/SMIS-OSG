// student.ts

import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    default: "12341234",
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  student_id: {
    type: String,
  },
  gender: {
    type: String,
  },
  university: {
    type: String,
  },
  program: {
    type: String,
  },
  college: {
    type: String,
  },
  year_level: {
    type: String,
  },
  contracts: [
    {
      contract: { type: mongoose.Schema.Types.ObjectId, ref: "Contract" },
      status: { type: String, enum: ["pending", "signed", "rejected"], default: "pending" },
    },
  ],

});

const Student = mongoose.models.Student || mongoose.model("Student", schema);
export default Student;

