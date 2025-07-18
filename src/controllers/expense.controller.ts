import { Request, Response } from "express";
import Expense from "../models/expense.model";

interface AuthRequest extends Request {
  user?: string;
}

// add expense
export const addExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { title, amount, category, date, note } = req.body;

    const expense = new Expense({
      userId: req.user,
      title,
      amount,
      category,
      date,
      note,
    });

    await expense.save();

    res.status(201).json({ message: "Expense added successfully", expense });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// get expense
export const getExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { from, to } = req.query;
    const query: any = { userId: req.user };

    if (from || to) {
      query.date = {};

      if (from) query.date.$gte = new Date(from as string);

      if (to) query.date.$lte = new Date(to as string);
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// update expense
export const updateExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findByIdAndUpdate(
      {
        _id: id,
        userId: req.user,
      },
      req.body,
      { new: true }
    );

    if (!expense) {
      res.status(404).json({ message: "Expense not found" });
      return;
    }

    res.status(200).json({ message: "Expese updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// delete expense
export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const expense = await Expense.findByIdAndDelete({
      _id: id,
      userId: req.user,
    });

    if (!expense) {
      res.status(404).json({ message: "Expense not found" });
      return;
    }

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
