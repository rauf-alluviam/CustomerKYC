import { useMaterialReactTable } from 'material-react-table';

const useTableConfig = (data, columns) => {
  const table = useMaterialReactTable({
    columns,
    data: data || [],
    enableColumnResizing: true,
    enableColumnOrdering: true,
    enableDensityToggle: true,
    enablePagination: true,
    enableBottomToolbar: true,
    enableTopToolbar: true,
    enableGlobalFilter: true,
    enableSorting: true,
    initialState: {
      density: 'comfortable',
      pagination: { pageSize: 10, pageIndex: 0 },
      showColumnFilters: false,
    },
    enableColumnPinning: true,
    enableGrouping: false,
    enableColumnFilters: true,
    enableColumnActions: true,
    enableStickyHeader: true,
    enablePinning: true,
    positionGlobalFilter: 'left',
    muiSearchTextFieldProps: {
      placeholder: 'Search all columns...',
      sx: { 
        minWidth: '300px',
        '& .MuiOutlinedInput-root': {
          borderRadius: '6px',
          background: '#fffefe',
          border: '1px solid #d1d5db',
          '&:hover': {
            background: '#fffefe',
            borderColor: '#9ca3af',
            boxShadow: 'none',
          },
          '&.Mui-focused': {
            background: '#fffefe',
            borderColor: '#2171c2',
            boxShadow: '0 0 0 3px rgba(33, 113, 194, 0.1)',
          }
        }
      },
      variant: 'outlined',
    },
    muiTableContainerProps: {
      sx: { 
        maxHeight: '70vh', 
        overflowY: 'auto',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        background: '#fffefe',
        '& .MuiTableCell-root': {
          borderBottom: '1px solid #e5e7eb',
          fontSize: '0.875rem',
        }
      },
    },
    muiTableHeadCellProps: {
      sx: {
        background: '#f9fafb',
        fontWeight: 500,
        color: '#000000',
        borderBottom: '1px solid #e5e7eb',
        fontSize: '0.875rem',
        textTransform: 'none',
        letterSpacing: 'normal',
        padding: '16px',
        '&:hover': {
          background: '#f3f4f6',
        }
      }
    },
    muiTableBodyCellProps: {
      sx: {
        padding: '12px 16px',
        '&:hover': {
          background: '#f9fafb',
        }
      }
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        transition: 'background-color 0.15s ease',
        '&:hover': {
          backgroundColor: '#f9fafb',
          transform: 'none',
          boxShadow: 'none',
        },
        '&:nth-of-type(even)': {
          backgroundColor: '#fffefe',
        }
      },
    }),
    muiTablePaginationProps: {
      rowsPerPageOptions: [5, 10, 20, 50, 100],
      showFirstButton: true,
      showLastButton: true,
      sx: {
        background: '#fffefe',
        borderTop: '1px solid #e5e7eb',
        '& .MuiTablePagination-toolbar': {
          padding: '16px',
        },
        '& .MuiIconButton-root': {
          borderRadius: '6px',
          '&:hover': {
            background: '#f3f4f6',
          }
        }
      }
    },
    muiTopToolbarProps: {
      sx: {
        background: '#f9fafb',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px',
      }
    },
    muiBottomToolbarProps: {
      sx: {
        background: '#fffefe',
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
      }
    },
  });

  return table;
};

export default useTableConfig;
