const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return ;
  }
  this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model("User", userSchema);
module.exports = User;
