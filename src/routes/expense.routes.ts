import { Router } from "express";
import {
  addExpense,
  getExpense,
  updateExpense,
  deleteExpense,
} from "../controllers/expense.controller";
import { authenticate } from "../middlewares/auth/auth.middleware";

const router = Router();

router.post("/", authenticate, addExpense);
router.get("/", authenticate, getExpense);
router.put("/:id", authenticate, updateExpense);
router.delete("/:id", authenticate, deleteExpense);

export default router;
