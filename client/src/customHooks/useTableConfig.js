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
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.8)',
          '&:hover': {
            background: '#ffffff',
            boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
          },
          '&.Mui-focused': {
            background: '#ffffff',
            boxShadow: '0 0 0 3px rgba(237, 108, 2, 0.1)',
          }
        }
      },
      variant: 'outlined',
    },
    muiTableContainerProps: {
      sx: { 
        maxHeight: '70vh', 
        overflowY: 'auto',
        borderRadius: '16px',
        border: '1px solid rgba(243, 163, 16, 0.1)',
        background: '#ffffff',
        '& .MuiTableCell-root': {
          borderBottom: '1px solid rgba(243, 163, 16, 0.1)',
          fontSize: '0.875rem',
        }
      },
    },
    muiTableHeadCellProps: {
      sx: {
        background: 'linear-gradient(135deg, rgba(243, 163, 16, 0.1) 0%, rgba(160, 160, 160, 0.1) 100%)',
        fontWeight: 600,
        color: '#2c3e50',
        borderBottom: '2px solid rgba(237, 108, 2, 0.2)',
        fontSize: '0.9rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        padding: '16px',
        '&:hover': {
          background: 'linear-gradient(135deg, rgba(243, 163, 16, 0.15) 0%, rgba(160, 160, 160, 0.15) 100%)',
        }
      }
    },
    muiTableBodyCellProps: {
      sx: {
        padding: '12px 16px',
        '&:hover': {
          background: 'rgba(243, 163, 16, 0.05)',
        }
      }
    },
    muiTableBodyRowProps: ({ row }) => ({
      sx: {
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: 'rgba(243, 163, 16, 0.05)',
          transform: 'scale(1.001)',
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        },
        '&:nth-of-type(even)': {
          backgroundColor: 'rgba(248, 249, 250, 0.5)',
        }
      },
    }),
    muiTablePaginationProps: {
      rowsPerPageOptions: [5, 10, 20, 50, 100],
      showFirstButton: true,
      showLastButton: true,
      sx: {
        background: 'rgba(243, 163, 16, 0.05)',
        borderTop: '1px solid rgba(243, 163, 16, 0.1)',
        '& .MuiTablePagination-toolbar': {
          padding: '16px',
        },
        '& .MuiIconButton-root': {
          borderRadius: '8px',
          '&:hover': {
            background: 'rgba(237, 108, 2, 0.1)',
          }
        }
      }
    },
    muiTopToolbarProps: {
      sx: {
        background: 'linear-gradient(135deg, rgba(243, 163, 16, 0.08) 0%, rgba(160, 160, 160, 0.08) 100%)',
        borderTopLeftRadius: '16px',
        borderTopRightRadius: '16px',
        borderBottom: '1px solid rgba(243, 163, 16, 0.1)',
        padding: '16px',
      }
    },
    muiBottomToolbarProps: {
      sx: {
        background: 'rgba(243, 163, 16, 0.03)',
        borderBottomLeftRadius: '16px',
        borderBottomRightRadius: '16px',
      }
    },
  });

  return table;
};

export default useTableConfig;
