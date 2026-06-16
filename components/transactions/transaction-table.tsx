"use client";

import { Fragment, useState, useTransition } from "react";
import { Edit3, Loader2, Trash2 } from "lucide-react";
import { deleteTransactionAction } from "@/app/actions/finance-actions";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";

type CategoryOption = { id: string; name: string };

type Row = {
  id: string;
  amount: number;
  description: string;
  type: "INCOME" | "EXPENSE";
  categoryId: string | null;
  categoryName: string | null;
  date: string;
  recurrence: "NONE" | "DAILY" | "WEEKLY" | "MONTHLY";
  predictedCategory: string | null;
  confidenceScore: number | null;
};

export function TransactionTable({
  rows,
  categories,
  currency
}: {
  rows: Row[];
  categories: CategoryOption[];
  currency: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-24 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <Fragment key={row.id}>
              <TableRow key={row.id}>
                <TableCell>
                  <div className="font-medium">{row.description}</div>
                  {row.confidenceScore !== null && (
                    <div className="text-xs text-muted-foreground">
                      AI: {row.predictedCategory} · {Math.round(row.confidenceScore * 100)}%
                    </div>
                  )}
                </TableCell>
                <TableCell>{row.categoryName ?? row.predictedCategory ?? "Other"}</TableCell>
                <TableCell>{formatDate(row.date)}</TableCell>
                <TableCell>
                  <Badge variant={row.type === "INCOME" ? "success" : "secondary"}>{row.type.toLowerCase()}</Badge>
                </TableCell>
                <TableCell className={row.type === "INCOME" ? "text-right text-emerald-600" : "text-right text-destructive"}>
                  {row.type === "INCOME" ? "+" : "-"}{formatCurrency(row.amount, currency)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" title="Edit transaction" aria-label="Edit transaction" onClick={() => setEditingId(editingId === row.id ? null : row.id)}>
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete transaction"
                      aria-label="Delete transaction"
                      disabled={isPending && deletingId === row.id}
                      onClick={() => {
                        setDeletingId(row.id);
                        startTransition(async () => {
                          await deleteTransactionAction(row.id);
                        });
                      }}
                    >
                      {isPending && deletingId === row.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {editingId === row.id && (
                <TableRow key={`${row.id}-edit`}>
                  <TableCell colSpan={6} className="bg-muted/30 p-4">
                    <TransactionForm categories={categories} initial={row} onDone={() => setEditingId(null)} />
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
