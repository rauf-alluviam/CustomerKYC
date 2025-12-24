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
      'Approved': { 
        style: { 
          backgroundColor: '#f0f9ff', 
          color: '#2171c2',
          border: '1px solid #2171c2'
        }
      },
      'Approved by HOD': { 
        style: { 
          backgroundColor: '#f0f9ff', 
          color: '#2171c2',
          border: '1px solid #2171c2'
        }
      },
      'Pending': { 
        style: { 
          backgroundColor: '#fff9f6', 
          color: '#e87538',
          border: '1px solid #e87538'
        }
      },
      'Sent for revision': { 
        style: { 
          backgroundColor: '#f9fafb', 
          color: '#6b7280',
          border: '1px solid #6b7280'
        }
      }
    };
    
    const config = statusConfig[status] || { style: { backgroundColor: '#f3f4f6', color: '#6b7280', border: 'none' } };
    
    return (
      <span
        style={{
          ...config.style,
          padding: '4px 10px',
          borderRadius: '4px',
          fontSize: '0.75rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'inline-block'
        }}
      >
        {status}
      </span>
    );
  };

  const getCategoryChip = (category) => {
    return (
      <span style={{
        fontSize: '0.875rem',
        color: '#4b5563',
        fontWeight: 400
      }}>
        {category}
      </span>
    );
  };

  const StatCard = ({ title, value, icon, color, bgColor }) => (
    <Card sx={{ 
      background: '#fffefe',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      height: '100%',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
      transition: 'all 0.2s ease',
      '&:hover': {
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
        transform: 'none',
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h3" sx={{ 
              fontWeight: 600, 
              color: '#000000',
              marginBottom: '4px',
              fontSize: '2rem'
            }}>
              {value}
            </Typography>
            <Typography variant="body2" sx={{ 
              color: '#6b7280',
              fontWeight: 400,
              fontSize: '0.875rem'
            }}>
              {title}
            </Typography>
          </Box>
          <Box sx={{ 
            color: '#9ca3af',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {React.cloneElement(icon, { sx: { fontSize: 24 } })}
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
      header: "Category",
      enableSorting: true,
      size: 180,
      Cell: ({ cell }) => getCategoryChip(cell.getValue()),
    },
    { 
      accessorKey: "iec_no", 
      header: "IEC Code", 
      enableSorting: true, 
      size: 200,
      Cell: ({ cell }) => (
        <Box sx={{ 
          fontFamily: 'monospace', 
          fontSize: '0.85rem',
          color: '#374151',
          fontWeight: 500
        }}>
          {cell.getValue() || 'N/A'}
        </Box>
      ),
    },
    { 
      accessorKey: "pan_no", 
      header: "PAN Number", 
      enableSorting: true, 
      size: 200,
      Cell: ({ cell }) => (
        <Box sx={{ 
          fontFamily: 'monospace', 
          fontSize: '0.85rem',
          color: '#374151',
          fontWeight: 500
        }}>
          {cell.getValue() || 'N/A'}
        </Box>
      ),
    },
    { 
      accessorKey: "permanent_address_telephone", 
      header: "Mobile", 
      enableSorting: true, 
      size: 180,
      Cell: ({ cell }) => (
        <Box sx={{ 
          fontSize: '0.875rem',
          color: '#374151'
        }}>
          {cell.getValue() || 'N/A'}
        </Box>
      ),
    },
    { 
      accessorKey: "permanent_address_email", 
      header: "Email", 
      enableSorting: true, 
      size: 220,
      Cell: ({ cell }) => (
        <Box sx={{ 
          fontSize: '0.875rem',
          color: '#374151',
          wordBreak: 'break-word'
        }}>
          {cell.getValue() || 'N/A'}
        </Box>
      ),
    },
    {
      accessorKey: "approval",
      header: "Status",
      enableSorting: true,
      size: 150,
      Cell: ({ cell }) => getStatusChip(cell.getValue()),
    },
    {
      accessorKey: "approved_by",
      header: "Processed By",
      enableSorting: true,
      size: 180,
      Cell: ({ cell }) => (
        <Box sx={{ 
          fontSize: '0.875rem',
          color: '#6b7280',
          fontStyle: cell.getValue() ? 'normal' : 'italic'
        }}>
          {cell.getValue() || 'Pending Review'}
        </Box>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      enableSorting: false,
      size: 100,
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
              color: '#6b7280',
              '&:hover': {
                backgroundColor: '#f3f4f6',
                color: '#374151',
              }
            }}
          >
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  const table = useTableConfig(filteredData, columns);    return (
      <Box sx={{
        padding: '24px',
        background: '#fffefe',
        borderRadius: '8px',
        minHeight: '400px'
      }}>
        {/* Clean Header */}
        <Box sx={{
          marginBottom: '32px',
          textAlign: 'center',
        }}>
          <h2 style={{
            color: '#000000',
            fontWeight: 500,
            fontSize: '1.75rem',
            marginBottom: '8px',
            margin: 0,
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

      {/* Clean Filters */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: '8px',
        background: '#fffefe',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
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
                startAdornment: <Search sx={{ color: '#6b7280', mr: 1 }} />,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #d1d5db',
                  '&:hover': {
                    backgroundColor: '#ffffff',
                    borderColor: '#9ca3af',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#fffefe',
                    borderColor: '#2171c2',
                    boxShadow: '0 0 0 3px rgba(33, 113, 194, 0.1)',
                  }
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
                  borderRadius: '6px',
                  backgroundColor: '#f9fafb',
                  border: '1px solid #d1d5db',
                  '&:hover': {
                    backgroundColor: '#ffffff',
                    borderColor: '#9ca3af',
                  },
                  '&.Mui-focused': {
                    backgroundColor: '#fffefe',
                    borderColor: '#2171c2',
                  }
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
      <div className="clean-table">
        <MaterialReactTable table={table} />
      </div>
    </Box>
  );
}

export default React.memo(CustomerKycStatus);
