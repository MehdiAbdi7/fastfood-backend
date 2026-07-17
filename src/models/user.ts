import { model, Model, Schema } from "mongoose";
import { IUser, IUserMethods } from "../types/models/user.js";
import bcrypt from "bcrypt";

type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    firstname: { type: String, required: true, trim: true },
    lastname: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    tel: { type: String, required: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "staff"], default: "staff" },
  },
  {
    timestamps: true,
    // Include virtuals when converting to JSON (API responses) or plain objects
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.virtual("isAdmin").get(function () {
  return this.role === "admin";
});

userSchema.pre("save", async function () {
  if (this.isNew || this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.comparePassword = async function (
  requestedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(requestedPassword, this.password);
};

export const User = model<IUser, UserModel>("User", userSchema);
