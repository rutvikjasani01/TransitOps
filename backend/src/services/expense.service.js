import prisma from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { mapExpenseToApi, mapExpenseCategoryToDb } from "../utils/mappings.js";

const round = (value) => Number(value.toFixed(2));

const getExpenseOrThrow = async (id) => {
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) throw new ApiError(404, "Expense not found.");
  return expense;
};

const assertVehicleExists = async (vehicleId) => {
  if (vehicleId) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw new ApiError(422, "Referenced vehicle does not exist.");
  }
};

export const list = async ({ category, vehicleId, from, to }) => {
  const dbCategory = category ? mapExpenseCategoryToDb(category) : undefined;
  
  const expenses = await prisma.expense.findMany({
    where: {
      category: dbCategory,
      vehicleId: vehicleId || undefined,
      date: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined
      }
    },
    orderBy: { date: 'desc' }
  });

  return expenses.map(mapExpenseToApi);
};

export const getById = async (id) => {
  const expense = await getExpenseOrThrow(id);
  return mapExpenseToApi(expense);
};

export const create = async (data) => {
  await assertVehicleExists(data.vehicleId);
  const dbCategory = mapExpenseCategoryToDb(data.category);

  const expense = await prisma.expense.create({
    data: {
      category: dbCategory,
      amount: Number(data.amount),
      date: new Date(data.date || new Date()),
      description: data.description,
      vehicleId: data.vehicleId
    }
  });

  return mapExpenseToApi(expense);
};

export const update = async (id, changes) => {
  const existing = await getExpenseOrThrow(id);
  if (existing.sourceType) {
    throw new ApiError(409, "System-generated expenses must be changed through their source record.");
  }

  await assertVehicleExists(changes.vehicleId);

  const updateData = {};
  if (changes.category) updateData.category = mapExpenseCategoryToDb(changes.category);
  if (changes.amount !== undefined) updateData.amount = Number(changes.amount);
  if (changes.date) updateData.date = new Date(changes.date);
  if (changes.description) updateData.description = changes.description;
  if (changes.vehicleId) updateData.vehicleId = changes.vehicleId;

  const updated = await prisma.expense.update({
    where: { id },
    data: updateData
  });

  return mapExpenseToApi(updated);
};

export const remove = async (id) => {
  const expense = await getExpenseOrThrow(id);
  if (expense.sourceType) {
    throw new ApiError(409, "System-generated expenses must be deleted through their source record.");
  }

  await prisma.expense.delete({ where: { id } });
};

export const upsertGeneratedExpense = async ({ sourceType, sourceId, category, amount, date, description, vehicleId }) => {
  const dbCategory = mapExpenseCategoryToDb(category);
  const existing = await prisma.expense.findFirst({
    where: { sourceType, sourceId }
  });

  const data = {
    category: dbCategory,
    amount: Number(amount),
    date: new Date(date),
    description,
    vehicleId,
    sourceType,
    sourceId
  };

  if (existing) {
    const updated = await prisma.expense.update({
      where: { id: existing.id },
      data
    });
    return mapExpenseToApi(updated);
  }

  const expense = await prisma.expense.create({ data });
  return mapExpenseToApi(expense);
};

export const removeGeneratedExpense = async (sourceType, sourceId) => {
  const existing = await prisma.expense.findFirst({
    where: { sourceType, sourceId }
  });
  if (existing) {
    await prisma.expense.delete({ where: { id: existing.id } });
  }
};

export const summary = async (filters) => {
  const expenses = await list(filters);
  const totalOperationalCost = round(expenses.reduce((sum, e) => sum + e.amount, 0));
  
  const categories = [...new Set(expenses.map((e) => e.category))];
  const byCategory = {};
  for (const cat of categories) {
    byCategory[cat] = round(
      expenses.filter((e) => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
    );
  }

  const vehicleCostMap = expenses.reduce((out, e) => {
    const key = e.vehicleId || "unassigned";
    out[key] = (out[key] || 0) + e.amount;
    return out;
  }, {});

  const byVehicle = Object.entries(vehicleCostMap).map(([vehicleId, amount]) => ({
    vehicleId,
    totalOperationalCost: round(amount)
  }));

  return {
    totalExpenses: expenses.length,
    totalOperationalCost,
    averageExpense: expenses.length ? round(totalOperationalCost / expenses.length) : 0,
    byCategory,
    byVehicle
  };
};
