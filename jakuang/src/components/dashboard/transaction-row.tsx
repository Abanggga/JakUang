import { formatCurrency } from "@/lib/utils/currency";
import { cn } from "@/lib/utils";
import { TRANSACTION_CATEGORY_CONFIG, TRANSACTION_DEFAULT_CONFIG } from "@/lib/config/ui-config";

interface TransactionData {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
  category: string;
  isConfirmed: boolean;
}

export function TransactionRow({ txn }: { txn: TransactionData }) {
  const config = TRANSACTION_CATEGORY_CONFIG[txn.category] || TRANSACTION_DEFAULT_CONFIG;
  const isIncome = txn.type === "INCOME";

  return (
    <tr className="hover:bg-surface-container-low transition-colors group">
      <td className="p-4 rounded-l-xl">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl ${config.iconBg} flex items-center justify-center ${config.iconText} group-hover:scale-110 transition-transform`}>
            <span className="material-symbols-outlined text-[20px]">{config.icon}</span>
          </div>
          <span className="text-body-md font-semibold text-on-surface">{txn.description}</span>
        </div>
      </td>
      <td className="p-4">
        <span className={`${config.bgClass} ${config.textClass} px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide`}>
          {config.label}
        </span>
      </td>
      <td className={cn("p-4 text-right text-body-md font-bold font-financial", isIncome ? "text-green-600" : "text-on-surface")}>
        {isIncome ? "+" : "-"}{formatCurrency(txn.amount)}
      </td>
      <td className="p-4 text-center rounded-r-xl">
        <span className={cn(
          "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
          txn.isConfirmed
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-amber-50 text-amber-700 border-amber-200"
        )}>
          <span className="material-symbols-outlined text-[14px]">
            {txn.isConfirmed ? "check_circle" : "pending"}
          </span>
          {txn.isConfirmed ? "Confirmed" : "Review"}
        </span>
      </td>
    </tr>
  );
}
