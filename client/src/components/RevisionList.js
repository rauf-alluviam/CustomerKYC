import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { MaterialReactTable } from "material-react-table";
import useTableConfig from "../customHooks/useTableConfig";
import { Link } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { useNavigation } from "../contexts/NavigationContext";
import { Box, Chip, IconButton, Tooltip, Alert } from "@mui/material";
import { Edit, Warning, PersonOutline } from "@mui/icons-material";
import BackButton from "./BackButton";

function RevisionList() {
  const [data, setData] = useState([]);
  const { user } = useContext(UserContext);
  const { navigateWithRef } = useNavigation();
  
  useEffect(() => {
    async function getData() {
      const res = await axios.get(
        `${process.env.REACT_APP_API_STRING}/view-revision-list`
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
        <Box sx={{ 
          fontWeight: 500, 
          color: '#2c3e50',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <PersonOutline sx={{ fontSize: 16, color: '#f57c00' }} />
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
      accessorKey: "approval",
      header: "⚠️ Status",
      enableSorting: true,
      size: 250,
      Cell: ({ cell }) => (
        <Chip
          label={cell.getValue()}
          color="warning"
          icon={<Warning sx={{ fontSize: 16 }} />}
          size="small"
          sx={{
            fontWeight: 500,
            fontSize: '0.75rem',
            height: '24px',
            '& .MuiChip-icon': {
              fontSize: '16px'
            }
          }}
        />
      ),
    },
    {
      accessorKey: "approved_by",
      header: "👨‍💼 Reviewed By",
      enableSorting: true,
      size: 250,
      Cell: ({ cell }) => (
        <Box sx={{ 
          fontStyle: cell.getValue() ? 'normal' : 'italic',
          color: cell.getValue() ? '#2c3e50' : '#6c757d'
        }}>
          {cell.getValue() || 'System'}
        </Box>
      ),
    },
    {
      accessorKey: "remarks",
      header: "💬 Revision Notes",
      enableSorting: false,
      size: 220,
      Cell: ({ cell }) => (
        <Tooltip title={cell.getValue() || 'No specific remarks'} arrow>
          <Box sx={{ 
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '0.85rem',
            color: '#d32f2f',
            fontWeight: 500
          }}>
            {cell.getValue() || 'Requires attention'}
          </Box>
        </Tooltip>
      ),
    },
    {
      accessorKey: "revise",
      header: "✏️ Actions",
      enableSorting: false,
      size: 250,
      Cell: ({ cell }) =>
        user.role === "Admin" ? (
          <Tooltip title="Start Revision Process" arrow>
            <IconButton
              onClick={() => navigateWithRef(`/revise-customer-kyc/${cell.row.original._id}`)}
              size="small"
              sx={{
                color: '#d32f2f',
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.1)',
                  transform: 'scale(1.1)',
                }
              }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <Box sx={{ color: '#ccc', fontSize: '0.75rem' }}>No Access</Box>
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
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
        padding: '10px 0',
        borderBottom: '2px solid #e0e0e0'
      }}>

        <h2 style={{ 
          color: 'var(--primary-orange)', 
          margin: '0 auto',
          textAlign: 'center',
          flex: 1
        }}>
          🔄 Revision List
        </h2>
      </div>
      
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
          🔄 Applications Requiring Revision
        </h2>
        <p style={{
          color: '#6c757d',
          fontSize: '1rem',
          margin: 0
        }}>
          Customer KYC applications that need corrections and resubmission
        </p>
      </Box>
      
      {data.length > 0 && (
        <Alert 
          severity="warning" 
          sx={{ 
            marginBottom: '16px',
            borderRadius: '12px',
            '& .MuiAlert-icon': {
              fontSize: '20px'
            }
          }}
        >
          <strong>{data.length}</strong> application{data.length !== 1 ? 's' : ''} require{data.length === 1 ? 's' : ''} revision. Please review and update accordingly.
        </Alert>
      )}
      
      <MaterialReactTable table={table} />
    </Box>
  );
}

export default React.memo(RevisionList);
