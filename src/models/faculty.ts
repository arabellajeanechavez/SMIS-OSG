import mongoose from "mongoose";

const schema = new mongoose.Schema({
  email: { 
    type: String, 
    unique: true 
  },
  password: { 
    type: String, 
    default: '12341234'
  },
  created_at: { 
    type: Date, 
    default: Date.now 
  },
});


// Create & Export Model
const Faculty = mongoose.models.Faculty || mongoose.model("Faculty", schema);
export default Faculty;

