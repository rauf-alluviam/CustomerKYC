import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { MaterialReactTable } from "material-react-table";
import useTableConfig from "../customHooks/useTableConfig";
import { Link } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { useNavigation } from "../contexts/NavigationContext";
import { Box, Chip, IconButton, Tooltip } from "@mui/material";
import { Visibility, Edit, CheckCircle, Cancel, PendingOutlined } from "@mui/icons-material";
import BackButton from "./BackButton";

function CompletedKyc() {
  const [data, setData] = useState([]);
  const { user } = useContext(UserContext);
  const { navigateWithRef } = useNavigation();

  useEffect(() => {
    async function getData() {
      const res = await axios.get(
        `${process.env.REACT_APP_API_STRING}/view-completed-kyc`
      );
      setData(res.data);
    }
    getData();
  }, []);

  const getStatusChip = (status) => {
    const statusConfig = {
      'Approved': { color: 'success', icon: <CheckCircle sx={{ fontSize: 16 }} /> },
      'Approved by HOD': { color: 'success', icon: <CheckCircle sx={{ fontSize: 16 }} /> },
      'Rejected': { color: 'error', icon: <Cancel sx={{ fontSize: 16 }} /> },
      'Pending': { color: 'warning', icon: <PendingOutlined sx={{ fontSize: 16 }} /> },
      'Sent for revision': { color: 'info', icon: <Edit sx={{ fontSize: 16 }} /> }
    };
    
    const config = statusConfig[status] || { color: 'default', icon: null };
    
    return (
      <Chip
        label={status}
        color={config.color}
        icon={config.icon}
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
    );
  };

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
      size: 250,
      Cell: ({ cell }) => (
        <Box sx={{ fontWeight: 500, color: '#2c3e50' }}>
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
          {cell.getValue() || 'N/A'}
        </Box>
      ),
    },
    {
      accessorKey: "approval",
      header: "✅ Approval Status",
      enableSorting: true,
      size: 250,
      Cell: ({ cell }) => getStatusChip(cell.getValue()),
    },
    {
      accessorKey: "approved_by",
      header: "👨‍💼 Approved By",
      enableSorting: true,
      size: 250,
      Cell: ({ cell }) => (
        <Box sx={{ 
          fontStyle: cell.getValue() ? 'normal' : 'italic',
          color: cell.getValue() ? '#2c3e50' : '#6c757d'
        }}>
          {cell.getValue() || 'Not Assigned'}
        </Box>
      ),
    },
    {
      accessorKey: "remarks",
      header: "💬 Remarks",
      enableSorting: false,
      size: 220,
      Cell: ({ cell }) => (
        <Tooltip title={cell.getValue() || 'No remarks'} arrow>
          <Box sx={{ 
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontSize: '0.85rem',
            color: '#6c757d'
          }}>
            {cell.getValue() || 'No remarks'}
          </Box>
        </Tooltip>
      ),
    },
    {
      accessorKey: "view",
      header: "👁️ Actions",
      enableSorting: false,
      size: 250,
      Cell: ({ cell }) =>
        user.role === "Admin" ? (
          <Tooltip title="View Details" arrow>
            <IconButton
              onClick={() => navigateWithRef(`/view-completed-kyc/${cell.row.original._id}`)}
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
        ) : (
          <Box sx={{ color: '#ccc', fontSize: '0.75rem' }}>No Access</Box>
        ),
    },
    ...(user.role === "Admin"
      ? [
          {
            accessorKey: "edit",
            header: "✏️ Edit",
            enableSorting: false,
            size: 100,
            Cell: ({ cell }) => (
              <Tooltip title="Edit KYC" arrow>
                <IconButton
                  onClick={() => navigateWithRef(`/revise-customer-kyc/${cell.row.original._id}`)}
                  size="small"
                  sx={{
                    color: '#ed6c02',
                    '&:hover': {
                      backgroundColor: 'rgba(237, 108, 2, 0.1)',
                      transform: 'scale(1.1)',
                    }
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            ),
          },
        ]
      : []),
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
          ✅ Completed KYC
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
          ✅ Completed KYC Records
        </h2>
        <p style={{
          color: '#6c757d',
          fontSize: '1rem',
          margin: 0
        }}>
          Manage and review all completed customer KYC applications
        </p>
      </Box>
      <MaterialReactTable table={table} />
    </Box>
  );
}

export default React.memo(CompletedKyc);
