import Link from "next/link";
import { ArrowDownUp, Plus, ReceiptText } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { requireUser } from "@/lib/auth";
import { getCategories, getTransactions } from "@/lib/queries";
import { toNumber } from "@/lib/utils";

type PageProps = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function TransactionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { dbUser } = await requireUser();
  const [categories, result] = await Promise.all([
    getCategories(dbUser.id),
    getTransactions(dbUser.id, params)
  ]);

  const categoryOptions = categories.map((category) => ({ id: category.id, name: category.name }));
  const rows = result.items.map((transaction) => ({
    id: transaction.id,
    amount: toNumber(transaction.amount),
    description: transaction.description,
    type: transaction.type,
    categoryId: transaction.categoryId,
    categoryName: transaction.category?.name ?? null,
    date: transaction.date.toISOString(),
    recurrence: transaction.recurrence,
    predictedCategory: transaction.predictedCategory,
    confidenceScore: transaction.confidenceScore ? toNumber(transaction.confidenceScore) : null
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <p className="text-sm text-muted-foreground">Search, filter, and classify expenses</p>
          <h1 className="text-3xl font-semibold tracking-normal">Transactions</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Transaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TransactionForm categories={categoryOptions} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownUp className="h-5 w-5" />
            Transaction Ledger
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="grid gap-3 md:grid-cols-[1fr_160px_180px_160px_auto]" action="/transactions">
            <Input name="q" placeholder="Search transactions" defaultValue={params.q ?? ""} />
            <Select name="type" defaultValue={params.type ?? ""}>
              <option value="">All types</option>
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
            </Select>
            <Select name="category" defaultValue={params.category ?? ""}>
              <option value="">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </Select>
            <Select name="sort" defaultValue={params.sort ?? "date-desc"}>
              <option value="date-desc">Newest</option>
              <option value="date-asc">Oldest</option>
              <option value="amount-desc">Amount high</option>
              <option value="amount-asc">Amount low</option>
            </Select>
            <Button>Apply</Button>
          </form>

          {rows.length ? (
            <TransactionTable rows={rows} categories={categoryOptions} currency={dbUser.currency} />
          ) : (
            <EmptyState icon={ReceiptText} title="No transactions found" description="Add a transaction or adjust your filters." />
          )}

          <div className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
            <span>
              Page {result.page} of {result.pageCount} · {result.total} total
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={result.page <= 1} asChild={result.page > 1}>
                <Link href={{ pathname: "/transactions", query: { ...params, page: String(result.page - 1) } }}>Previous</Link>
              </Button>
              <Button variant="outline" size="sm" disabled={result.page >= result.pageCount} asChild={result.page < result.pageCount}>
                <Link href={{ pathname: "/transactions", query: { ...params, page: String(result.page + 1) } }}>Next</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
