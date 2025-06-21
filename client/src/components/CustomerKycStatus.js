import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { MaterialReactTable } from "material-react-table";
import useTableConfig from "../customHooks/useTableConfig";
import { UserContext } from "../contexts/UserContext";
import { useNavigation } from "../contexts/NavigationContext";
import { 
  Box, 
  Chip, 
  IconButton, 
  Tooltip, 
  TextField, 
  FormControl, 
  Select, 
  MenuItem, 
  InputLabel,
  Paper,
  Typography,
  Card,
  CardContent,
  Grid
} from "@mui/material";
import { 
  Visibility, 
  CheckCircle, 
  Cancel, 
  PendingOutlined, 
  Edit, 
  Search,
  Assessment,
  Group,
  HourglassEmpty,
  TrendingUp
} from "@mui/icons-material";

function CustomerKycStatus() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    sentForRevision: 0
  });
  const { user } = useContext(UserContext);
  const { navigateWithRef } = useNavigation();

  useEffect(() => {
    async function getData() {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_STRING}/view-all-customer-kyc`
        );
        setData(res.data);
        setFilteredData(res.data);
        calculateStats(res.data);
      } catch (error) {
        console.error("Error fetching KYC status data:", error);
      }
    }
    getData();
  }, []);

  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      pending: data.filter(item => item.approval === "Pending").length,
      approved: data.filter(item => item.approval === "Approved" || item.approval === "Approved by HOD").length,
      sentForRevision: data.filter(item => item.approval === "Sent for revision").length
    };
    setStats(stats);
  };

  useEffect(() => {
    let filtered = data;

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter(item => item.approval === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name_of_individual?.toLowerCase().includes(query) ||
        item.iec_no?.toLowerCase().includes(query) ||
        item.pan_no?.toLowerCase().includes(query)
      );
    }

    setFilteredData(filtered);
  }, [data, statusFilter, searchQuery]);

  const getStatusChip = (status) => {
    const statusConfig = {
      'Approved': { color: 'success', icon: <CheckCircle sx={{ fontSize: 16 }} /> },
      'Approved by HOD': { color: 'success', icon: <CheckCircle sx={{ fontSize: 16 }} /> },
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

  const StatCard = ({ title, value, icon, color, bgColor }) => (
    <Card sx={{ 
      background: `linear-gradient(135deg, ${bgColor}15 0%, ${bgColor}05 100%)`,
      border: `1px solid ${bgColor}30`,
      borderRadius: '16px',
      height: '100%',
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)'
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 700, 
              color: color,
              marginBottom: '4px',
              fontSize: '2.5rem'
            }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: '#6c757d',
              fontWeight: 500,
              fontSize: '0.9rem'
            }}>
              {title}
            </Typography>
          </Box>
          <Box sx={{ 
            color: color,
            backgroundColor: `${color}15`,
            borderRadius: '50%',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {React.cloneElement(icon, { sx: { fontSize: 32 } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const columns = [
    {
      accessorKey: "name_of_individual",
      header: "Customer Name",
      enableSorting: true,
      size: 250,
      Cell: ({ cell }) => (
        <Box 
          sx={{ 
            fontWeight: 600, 
            color: '#1976d2',
            fontSize: '0.9rem',
            cursor: 'pointer',
            '&:hover': {
              color: '#0d47a1',
              textDecoration: 'underline',
            }
          }}
          onClick={() => {
            const status = cell.row.original.approval;
            if (status === "Pending") {
              navigateWithRef(`/view-customer-kyc/${cell.row.original._id}`);
            } else if (status === "Approved" || status === "Approved by HOD") {
              navigateWithRef(`/view-completed-kyc/${cell.row.original._id}`);
            } else if (status === "Sent for revision") {
              navigateWithRef(`/revise-customer-kyc/${cell.row.original._id}`);
            }
          }}
        >
          {cell.getValue() || 'N/A'}
        </Box>
      ),
    },
    {
      accessorKey: "category",
      header: "🏢 Category",
      enableSorting: true,
      size: 200,
      Cell: ({ cell }) => getCategoryChip(cell.getValue()),
    },
    { 
      accessorKey: "iec_no", 
      header: " IEC Code", 
      enableSorting: true, 
      size: 250,
      Cell: ({ cell }) => (
        <Box sx={{ 
          fontFamily: 'monospace', 
          fontSize: '0.85rem',
          backgroundColor: '#f5f5f5',
          padding: '4px 8px',
          borderRadius: '6px',
          display: 'inline-block',
          fontWeight: 600
        }}>
          {cell.getValue() || 'N/A'}
        </Box>
      ),
    },
    { 
      accessorKey: "pan_no", 
      header: " PAN Number", 
      enableSorting: true, 
      size: 250,
      Cell: ({ cell }) => (
        <Box sx={{ 
          fontFamily: 'monospace', 
          fontSize: '0.85rem',
          backgroundColor: '#f0f8ff',
          padding: '4px 8px',
          borderRadius: '6px',
          display: 'inline-block',
          fontWeight: 600
        }}>
          {cell.getValue() || 'N/A'}
        </Box>
      ),
    },
    { 
      accessorKey: "permanent_address_telephone", 
      header: " Mobile", 
      enableSorting: true, 
      size: 250,
      Cell: ({ cell }) => (
        <Box sx={{ 
          fontFamily: 'monospace', 
          fontSize: '0.85rem',
          color: '#2c3e50'
        }}>
          {cell.getValue() || 'N/A'}
        </Box>
      ),
    },
    { 
      accessorKey: "permanent_address_email", 
      header: " Email", 
      enableSorting: true, 
      size: 200,
      Cell: ({ cell }) => (
        <Box sx={{ 
          fontSize: '0.85rem',
          color: '#2c3e50',
          wordBreak: 'break-word'
        }}>
          {cell.getValue() || 'N/A'}
        </Box>
      ),
    },
    {
      accessorKey: "approval",
      header: " KYC Status",
      enableSorting: true,
      size: 250,
      Cell: ({ cell }) => getStatusChip(cell.getValue()),
    },
    {
      accessorKey: "approved_by",
      header: " Processed By",
      enableSorting: true,
      size: 250,
      Cell: ({ cell }) => (
        <Box sx={{ 
          fontSize: '0.85rem',
          color: '#6c757d',
          fontStyle: cell.getValue() ? 'normal' : 'italic'
        }}>
          {cell.getValue() || 'Pending Review'}
        </Box>
      ),
    },
    {
      accessorKey: "actions",
      header: " Actions",
      enableSorting: false,
      size: 250,
      Cell: ({ cell }) => (
        <Tooltip title="View Details" arrow>
          <IconButton
            onClick={() => {
              const status = cell.row.original.approval;
              if (status === "Pending") {
                navigateWithRef(`/view-customer-kyc/${cell.row.original._id}`);
              } else if (status === "Approved" || status === "Approved by HOD") {
                navigateWithRef(`/view-completed-kyc/${cell.row.original._id}`);
              } else if (status === "Sent for revision") {
                navigateWithRef(`/revise-customer-kyc/${cell.row.original._id}`);
              }
            }}
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

  const table = useTableConfig(filteredData, columns);

  return (
    <Box sx={{
      padding: '24px',
      background: 'linear-gradient(135deg, rgba(243, 163, 16, 0.05) 0%, rgba(160, 160, 160, 0.05) 100%)',
      borderRadius: '16px',
      minHeight: '400px'
    }}>
      {/* Header */}
      <Box sx={{
        marginBottom: '32px',
        textAlign: 'center',
      }}>
        <h2 style={{
          color: '#2c3e50',
          fontWeight: 600,
          fontSize: '2rem',
          marginBottom: '8px',
          background: 'linear-gradient(135deg, rgba(243, 163, 16, 0.94) 0%, rgb(160, 160, 160) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Customer KYC Status 
        </h2>
        
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ marginBottom: '32px' }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Total Customers"
            value={stats.total}
            icon={<Group />}
            color="#2c3e50"
            bgColor="#34495e"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Pending KYC"
            value={stats.pending}
            icon={<HourglassEmpty />}
            color="#f39c12"
            bgColor="#f39c12"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Approved KYC"
            value={stats.approved}
            icon={<CheckCircle />}
            color="#27ae60"
            bgColor="#27ae60"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Revisions Required"
            value={stats.sentForRevision}
            icon={<Edit />}
            color="#3498db"
            bgColor="#3498db"
          />
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: '12px',
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(243, 163, 16, 0.1)'
      }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="Search by customer name, IEC code, or PAN number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ color: '#6c757d', mr: 1 }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                label="Filter by Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                }}
              >
                <MenuItem value="All">All Statuses</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                {/* <MenuItem value="Approved by HOD">Approved by HOD</MenuItem> */}
                <MenuItem value="Sent for revision">Sent for Revision</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Summary */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" sx={{ color: '#6c757d', fontStyle: 'italic' }}>
          Showing {filteredData.length} of {data.length} customers
          {statusFilter !== "All" && ` with status: ${statusFilter}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </Typography>
      </Box>

      {/* Data Table */}
      <MaterialReactTable table={table} />
    </Box>
  );
}

export default React.memo(CustomerKycStatus);
