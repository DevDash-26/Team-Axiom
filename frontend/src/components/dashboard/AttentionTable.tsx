import { StatusBadge, toneForStatus } from "@/components/feedback/StatusBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AttentionRow } from "@/lib/fixtures/dashboards";

type AttentionTableProps = {
  rows: AttentionRow[];
};

export function AttentionTable({ rows }: AttentionTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Item</TableHead>
          <TableHead>Details</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id} className="hover:bg-[#fafafa]">
            <TableCell className="font-medium">
              <span className="mr-2 text-xs text-muted-foreground">{row.id}</span>
              {row.title}
            </TableCell>
            <TableCell className="text-muted-foreground">{row.meta}</TableCell>
            <TableCell>
              <StatusBadge label={row.status} tone={toneForStatus(row.status)} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
