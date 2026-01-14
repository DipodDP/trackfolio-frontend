"use client";

import { Row } from "@tanstack/react-table";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TablePosition } from "@/types/position";

interface PositionRowActionsProps {
  row: Row<TablePosition>;
}

export function PositionRowActions({ row }: PositionRowActionsProps) {
  const position = row.original;
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleCopyTicker = () => {
    navigator.clipboard.writeText(position.ticker);
    // TODO: Add toast notification
  };

  const handleEdit = () => {
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 data-[state=open]:bg-primary/10"
          >
            <span className="sr-only">Open menu</span>
            <span className="material-symbols-outlined text-lg">more_vert</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={handleEdit}>
            <span className="material-symbols-outlined text-sm mr-2">edit</span>
            Edit Targets
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyTicker}>
            <span className="material-symbols-outlined text-sm mr-2">
              content_copy
            </span>
            Copy Ticker
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <span className="material-symbols-outlined text-sm mr-2">
              visibility
            </span>
            View Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* TODO: Add PositionEditDialog component */}
      {/* <PositionEditDialog
        position={position}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      /> */}
    </>
  );
}
