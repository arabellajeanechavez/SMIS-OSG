// scholarship.ts

import mongoose from "mongoose";

const schema = new mongoose.Schema({
  reference: {
    type: mongoose.Schema.Types.ObjectId,
  },
  email: {
    type: String,
  },
  attachment: {
    type: [Buffer],
  },
  scholarship_type: {
    type: String,
  },
  gpa_requirement: {
    type: Number,
  },
  benefactor: {
    type: String,
  },
  academic_year: {
    type: String,
  },
  contract_expiration: {
    type: Date,
  },
  is_revoked: {
    type: Boolean,
    default: false
  },
  date_verified: {
    type: Date
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  // TODO: change the name into lastname, firstname, middlename
  // snapshot of the student's profile
  name: {
    type: String,
  },
  student_id: {
    type: String,
  },
  university: {
    type: String,
  },
  program: {
    type: String,
  },
  gender: {
    type: String,
  },
  college: {
    type: String,
  },
  year_level: {
    type: String,
  },
  contracts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Contract" }],
});

// Create & Export Model
const Scholarship = mongoose.models.Scholarship || mongoose.model("Scholarship", schema);
export default Scholarship;
