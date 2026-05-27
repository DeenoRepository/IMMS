import React from 'react';

export interface ColumnConfig<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  sortable?: boolean;
}

export interface TableProps<T> {
  columns: ColumnConfig<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  hoverable?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  emptyMessage?: string;
}

export function Table<T>({
  columns,
  data,
  onRowClick,
  hoverable = true,
  sortBy,
  sortDirection,
  onSort,
  emptyMessage = 'No records found.',
}: TableProps<T>) {
  const handleSortClick = (key: string, sortable?: boolean) => {
    if (sortable && onSort) {
      onSort(key);
    }
  };

  return (
    <div className="mech-table-container">
      <table className="mech-table">
        <thead>
          <tr>
            {columns.map((col) => {
              const isSorted = sortBy === col.key;
              const classes = [
                'mech-th',
                col.sortable ? 'mech-th-sortable' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <th
                  key={col.key}
                  className={classes}
                  onClick={() => handleSortClick(col.key, col.sortable)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{col.header}</span>
                    {col.sortable && isSorted && (
                      <span style={{ fontSize: '10px' }}>
                        {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="mech-td" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const trClasses = [
                'mech-tr',
                hoverable ? 'mech-tr-hoverable' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <tr
                  key={rowIndex}
                  className={trClasses}
                  onClick={() => onRowClick && onRowClick(row)}
                  style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="mech-td">
                      {col.render ? col.render(row, rowIndex) : (row as any)[col.key]}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
