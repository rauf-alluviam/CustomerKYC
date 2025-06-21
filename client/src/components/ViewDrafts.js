import React, { useEffect, useState } from "react";
import axios from "axios";
import { MaterialReactTable } from "material-react-table";
import useTableConfig from "../customHooks/useTableConfig";
import { Link } from "react-router-dom";
import { useNavigation } from "../contexts/NavigationContext";
import { Box, Chip, IconButton, Tooltip } from "@mui/material";
import { Visibility, DraftsOutlined } from "@mui/icons-material";
import BackButton from "./BackButton";

function ViewDrafts() {
  const [data, setData] = useState([]);
  const { navigateWithRef } = useNavigation();

  useEffect(() => {
    async function getData() {
      const res = await axios.get(
        `${process.env.REACT_APP_API_STRING}/view-customer-kyc-drafts`
      );
      setData(res.data);
    }
    getData();
  }, []);

  const getCategoryChip = (category) => {
    const categoryColors = {
      'Individual/ Proprietary Firm': 'primary',
      'Partnership Firm': 'secondary',
      'Company': 'success',
      'Trust Foundations': 'info'
    };
    
    return (
      <Chip
        label={category}
        color={categoryColors[category] || 'default'}
        variant="outlined"
        size="small"
        sx={{
          fontWeight: 500,
          fontSize: '0.75rem',
          height: '24px'
        }}
      />
    );
  };

  const columns = [
    {
      accessorKey: "name_of_individual",
      header: "👤 Customer Name",
      enableSorting: true,
      size: 280,
      Cell: ({ cell }) => (
        <Box 
          sx={{ 
            fontWeight: 500, 
            color: '#1976d2',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'pointer',
            '&:hover': {
              color: '#0d47a1',
              textDecoration: 'underline',
            }
          }}
          onClick={() => navigateWithRef(`/view-draft-details/${cell.row.original._id}`)}
        >
          <DraftsOutlined sx={{ fontSize: 16, color: '#ff9800' }} />
          {cell.getValue()}
        </Box>
      ),
    },
    {
      accessorKey: "category",
      header: "🏢 Category",
      enableSorting: true,
      size: 250,
      Cell: ({ cell }) => getCategoryChip(cell.getValue()),
    },
    {
      accessorKey: "status",
      header: "📊 Business Type",
      enableSorting: true,
      size: 250,
      Cell: ({ cell }) => (
        <Chip
          label={cell.getValue()}
          variant="filled"
          size="small"
          sx={{
            backgroundColor: cell.getValue() === 'Manufacturer' ? '#e8f5e8' : '#e3f2fd',
            color: cell.getValue() === 'Manufacturer' ? '#2e7d32' : '#1976d2',
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      ),
    },
    {
      accessorKey: "iec_no",
      header: "🆔 IEC Number",
      enableSorting: true,
      size: 250,
      Cell: ({ cell }) => (
        <Box sx={{ 
          fontFamily: 'monospace', 
          fontSize: '0.85rem',
          backgroundColor: '#f5f5f5',
          padding: '4px 8px',
          borderRadius: '6px',
          display: 'inline-block'
        }}>
          {cell.getValue() || 'Pending'}
        </Box>
      ),
    },
    {
      accessorKey: "action",
      header: "👁️ Actions",
      enableSorting: false,
      size: 250,
      Cell: ({ cell }) => (
        <Tooltip title="View Draft Details" arrow>
          <IconButton
            onClick={() => navigateWithRef(`/view-draft-details/${cell.row.original._id}`)}
            size="small"
            sx={{
              color: '#1976d2',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                transform: 'scale(1.1)',
              }
            }}
          >
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const table = useTableConfig(data, columns);

  return (
    <Box sx={{
      padding: '24px',
      background: 'linear-gradient(135deg, rgba(243, 163, 16, 0.05) 0%, rgba(160, 160, 160, 0.05) 100%)',
      borderRadius: '16px',
      minHeight: '400px'
    }}>
      {/* Header with Back Button */}
   
      
      <Box sx={{
        marginBottom: '24px',
        textAlign: 'center',
      }}>
        <h2 style={{
          color: '#2c3e50',
          fontWeight: 600,
          fontSize: '1.75rem',
          marginBottom: '8px',
          background: 'linear-gradient(135deg, rgba(243, 163, 16, 0.94) 0%, rgb(160, 160, 160) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Draft Applications
        </h2>
       
      </Box>
      <MaterialReactTable table={table} />
    </Box>
  );
}

export default React.memo(ViewDrafts);
