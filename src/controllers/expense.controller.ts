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
    const { from, to, filter } = req.query;
    const query: any = { userId: req.user };

    let startDate: Date | undefined;
    let endDate: Date | undefined = new Date();

    switch (filter) {
      case "week":
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "month":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case "3months":
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        break;
    }

    if (from) startDate = new Date(from as string);
    if (to) endDate = new Date(to as string);

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = startDate;
      if (endDate) query.date.$lte = endDate;
    }

    const expenses = await Expense.find(query).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
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
