import { DataTable, type Column } from "@tesera/ui";
import { applyTableState, dataColumns, type TableParams } from "@/src/tesera/table";
import { SortHeader, TablePagination, TableToolbar } from "./TableControls";

/**
 * A table with search, sorting, paging and export. All of it runs on the server
 * from URL state, so pages stay server-rendered: a page hands over its columns,
 * rows and search params, and gets the whole behaviour.
 */
export function DataPanel<T extends { id?: string | number }>({
  columns,
  rows,
  params,
  filename,
  empty,
}: {
  columns: Column<T>[];
  rows: T[];
  params: TableParams;
  /** Base name of the exported file. */
  filename: string;
  empty?: string;
}) {
  const view = applyTableState(columns, rows, params);
  const sortable = new Set(dataColumns(columns, rows[0]).map((column) => column.key));

  return (
    <DataTable
      columns={columns}
      rows={view.rows}
      empty={view.q ? "Ничего не найдено" : empty}
      toolbar={
        <TableToolbar
          q={view.q}
          total={view.total}
          grandTotal={view.grandTotal}
          csv={view.csv}
          filename={filename}
        />
      }
      headerCell={(column) =>
        sortable.has(column.key) && typeof column.header === "string" ? (
          <SortHeader
            columnKey={column.key}
            label={column.header}
            active={view.sort === column.key}
            dir={view.dir}
            align={column.align}
          />
        ) : (
          column.header
        )
      }
      footer={<TablePagination page={view.page} pages={view.pages} total={view.total} />}
    />
  );
}
