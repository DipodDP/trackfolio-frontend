import { Column } from "@tanstack/react-table";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn(className)}>{title}</div>;
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-primary/10"
          >
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
              <span className="material-symbols-outlined text-sm ml-2">
                arrow_downward
              </span>
            ) : column.getIsSorted() === "asc" ? (
              <span className="material-symbols-outlined text-sm ml-2">
                arrow_upward
              </span>
            ) : (
              <span className="material-symbols-outlined text-sm ml-2">
                unfold_more
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <span className="material-symbols-outlined text-sm mr-2">
              arrow_upward
            </span>
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <span className="material-symbols-outlined text-sm mr-2">
              arrow_downward
            </span>
            Desc
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
            <span className="material-symbols-outlined text-sm mr-2">
              visibility_off
            </span>
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
