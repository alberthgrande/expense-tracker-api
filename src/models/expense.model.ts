import mongoose, { Document, Schema } from "mongoose";

export interface IExpense extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  category: string;
  date: Date;
  note?: string;
}

const expenseSchema = new Schema<IExpense>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: {
      type: String,
      enum: [
        "Groceries",
        "Leisure",
        "Electronics",
        "Utilities",
        "Clothing",
        "Health",
        "Others",
      ],
      required: true,
    },
    date: { type: Date, required: true, default: Date.now },
    note: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IExpense>("Expense", expenseSchema);
