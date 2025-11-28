import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { MaterialReactTable } from "material-react-table";
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
  Grid,
} from "@mui/material";
import {
  Visibility,
  CheckCircle,
  Edit,
  Search,
  Group,
  HourglassEmpty,
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
    sentForRevision: 0,
  });
  const { user } = useContext(UserContext);
  const { navigateWithRef } = useNavigation();

  useEffect(() => {
    async function getData() {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_API_STRING}/view-all-customer-kyc`
        );
        const data = res.data || [];
        setData(data);
        setFilteredData(data);
        calculateStats(data);
      } catch (error) {
        console.error("Error fetching KYC status data:", error);
        setData([]);
        setFilteredData([]);
      }
    }
    getData();
  }, []);

  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      pending: data.filter((item) => item.approval === "Pending").length,
      approved: data.filter(
        (item) =>
          item.approval === "Approved" || item.approval === "Approved by HOD"
      ).length,
      sentForRevision: data.filter(
        (item) => item.approval === "Sent for revision"
      ).length,
    };
    setStats(stats);
  };

  useEffect(() => {
    let filtered = data;

    // Apply status filter
    if (statusFilter !== "All") {
      filtered = filtered.filter((item) => item.approval === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name_of_individual?.toLowerCase().includes(query) ||
          item.iec_no?.toLowerCase().includes(query) ||
          item.pan_no?.toLowerCase().includes(query)
      );
    }

    setFilteredData(filtered);
  }, [data, statusFilter, searchQuery]);

  const getStatusChip = (status) => {
    const statusConfig = {
      Approved: {
        style: {
          backgroundColor: "#f0f9ff",
          color: "#2171c2",
          border: "1px solid #2171c2",
        },
      },
      "Approved by HOD": {
        style: {
          backgroundColor: "#f0f9ff",
          color: "#2171c2",
          border: "1px solid #2171c2",
        },
      },
      Pending: {
        style: {
          backgroundColor: "#fff9f6",
          color: "#e87538",
          border: "1px solid #e87538",
        },
      },
      "Sent for revision": {
        style: {
          backgroundColor: "#f9fafb",
          color: "#6b7280",
          border: "1px solid #6b7280",
        },
      },
    };

    const config = statusConfig[status] || {
      style: { backgroundColor: "#f3f4f6", color: "#6b7280", border: "none" },
    };

    return (
      <span
        style={{
          ...config.style,
          padding: "4px 10px",
          borderRadius: "4px",
          fontSize: "0.75rem",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
          display: "inline-block",
        }}
      >
        {status}
      </span>
    );
  };

  // Compact StatCard component
  const StatCard = ({ title, value, icon, color }) => (
    <Card
      sx={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        height: "100%",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.03)",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#111827",
                marginBottom: "2px",
                fontSize: "1.5rem",
                lineHeight: 1.2,
              }}
            >
              {value}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                // color: "#6b7280",
                fontWeight: 400,
                fontSize: "0.8rem",
              }}
            >
              {title}
            </Typography>
          </Box>
          <Box
            sx={{
              // color: color || "#6b7280",
              backgroundColor: "#f8fafc",
              borderRadius: "6px",
              p: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ml: 1,
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: 18 } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  // Define columns directly without the hook
  const columns = React.useMemo(
    () => [
      {
        accessorKey: "name_of_individual",
        header: "Customer Name",
        enableSorting: true,
        size: 250,
        Cell: ({ cell }) => (
          <Box
            sx={{
              fontWeight: 600,
              color: "#1976d2",
              fontSize: "0.9rem",
              cursor: "pointer",
              "&:hover": {
                color: "#0d47a1",
                textDecoration: "underline",
              },
            }}
            onClick={() => {
              const status = cell.row.original.approval;
              if (status === "Pending") {
                navigateWithRef(`/view-customer-kyc/${cell.row.original._id}`);
              } else if (
                status === "Approved" ||
                status === "Approved by HOD"
              ) {
                navigateWithRef(`/view-completed-kyc/${cell.row.original._id}`);
              } else if (status === "Sent for revision") {
                navigateWithRef(
                  `/revise-customer-kyc/${cell.row.original._id}`
                );
              }
            }}
          >
            {cell.getValue() || "N/A"}
          </Box>
        ),
      },
      {
        accessorKey: "category",
        header: "Category",
        enableSorting: true,
        size: 180,
        Cell: ({ cell }) => (
          <span
            style={{
              fontSize: "0.875rem",
              color: "#4b5563",
              fontWeight: 400,
            }}
          >
            {cell.getValue() || "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "iec_no",
        header: "IEC Code",
        enableSorting: true,
        size: 200,
        Cell: ({ cell }) => (
          <Box
            sx={{
              fontFamily: "monospace",
              fontSize: "0.85rem",
              color: "#374151",
              fontWeight: 500,
            }}
          >
            {cell.getValue() || "N/A"}
          </Box>
        ),
      },
      {
        accessorKey: "pan_no",
        header: "PAN Number",
        enableSorting: true,
        size: 200,
        Cell: ({ cell }) => (
          <Box
            sx={{
              fontFamily: "monospace",
              fontSize: "0.85rem",
              color: "#374151",
              fontWeight: 500,
            }}
          >
            {cell.getValue() || "N/A"}
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
          <Box
            sx={{
              fontSize: "0.875rem",
              color: "#6b7280",
              fontStyle: cell.getValue() ? "normal" : "italic",
            }}
          >
            {cell.getValue() || "Pending Review"}
          </Box>
        ),
      },
      // {
      //   accessorKey: "actions",
      //   header: "Actions",
      //   enableSorting: false,
      //   size: 100,
      //   Cell: ({ row }) => (
      //     <Tooltip title="View Details" arrow>
      //       <IconButton
      //         onClick={() => {
      //           const status = row.original.approval;
      //           if (status === "Pending") {
      //             navigateWithRef(`/view-customer-kyc/${row.original._id}`);
      //           } else if (
      //             status === "Approved" ||
      //             status === "Approved by HOD"
      //           ) {
      //             navigateWithRef(`/view-completed-kyc/${row.original._id}`);
      //           } else if (status === "Sent for revision") {
      //             navigateWithRef(`/revise-customer-kyc/${row.original._id}`);
      //           }
      //         }}
      //         size="small"
      //         sx={{
      //           color: "#6b7280",
      //           "&:hover": {
      //             backgroundColor: "#f3f4f6",
      //             color: "#374151",
      //           },
      //         }}
      //       >
      //         <Visibility fontSize="small" />
      //       </IconButton>
      //     </Tooltip>
      //   ),
      // },
    ],
    [navigateWithRef]
  );

  // Safe table configuration without the problematic hook
  const tableConfig = React.useMemo(
    () => ({
      columns: columns,
      data: filteredData,
      enableColumnOrdering: false,
      enableColumnResizing: true,
      enablePagination: true,
      enableSorting: true,
      enableDensityToggle: false,
      enableFullScreenToggle: false,
      enableHiding: false,
      enableColumnFilters: false,
      enableGlobalFilter: false,
      enableRowSelection: false,
      enableStickyHeader: true,
      muiTableBodyRowProps: {
        sx: {
          "&:hover": {
            backgroundColor: "#f8fafc",
          },
        },
      },
    }),
    [columns, filteredData]
  );

  return (
    <Box
      sx={{
        padding: "14px",
        background: "#ffffff",
        borderRadius: "8px",
        minHeight: "400px",
      }}
    >
      {/* Compact Header */}
      <Box
        sx={{
          marginBottom: "14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              color: "#000000",
              fontWeight: 600,
              fontSize: "1.5rem",
              margin: 0,
            }}
          >
            Customer KYC Status
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: "#6b7280",
              marginTop: "4px",
            }}
          >
            Manage and track customer KYC applications
          </Typography>
        </Box>

        {/* Quick Stats - Horizontal */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            justifyContent: { xs: "flex-start", md: "flex-end" },
          }}
        >
          <Chip
            label={`Total: ${stats.total}`}
            size="small"
            variant="outlined"
            sx={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}
          />
          <Chip
            label={`Pending: ${stats.pending}`}
            size="small"
            sx={{ backgroundColor: "#fff7ed", color: "#ea580c" }}
          />
          <Chip
            label={`Approved: ${stats.approved}`}
            size="small"
            sx={{ backgroundColor: "#f0f9ff", color: "#0ea5e9" }}
          />
          <Chip
            label={`Revisions: ${stats.sentForRevision}`}
            size="small"
            sx={{ backgroundColor: "#fafafa", color: "#6b7280" }}
          />
        </Box>
      </Box>

      {/* Compact Statistics Cards */}
      <Grid container spacing={2} sx={{ marginBottom: "24px" }}>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="Total"
            value={stats.total}
            icon={<Group />}
            color="#4b5563"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="Pending"
            value={stats.pending}
            icon={<HourglassEmpty />}
            color="#e87538"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="Approved"
            value={stats.approved}
            icon={<CheckCircle />}
            color="#2171c2"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            title="Revisions"
            value={stats.sentForRevision}
            icon={<Edit />}
            color="#6b7280"
          />
        </Grid>
      </Grid>

      {/* Compact Filters */}

      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            size="small"
            variant="outlined"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <Search sx={{ color: "#020202ff", mr: 1, fontSize: 18 }} />
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "6px",
                backgroundColor: "#f9fafb",
                border: "1px solid #d1d5db",
                fontSize: "0.875rem",
              },
            }}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontSize: "0.875rem" }}>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{
                borderRadius: "6px",
                backgroundColor: "#f9fafb",
                border: "1px solid #d1d5db",
                fontSize: "0.875rem",
              }}
            >
              <MenuItem value="All">All Statuses</MenuItem>
              <MenuItem value="Pending">Pending</MenuItem>
              <MenuItem value="Approved">Approved</MenuItem>
              <MenuItem value="Sent for revision">Sent for Revision</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Compact Results Summary */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="body2"
          sx={{
            color: "#6b7280",
            fontSize: "0.8rem",
            fontStyle: "italic",
          }}
        >
          Showing {filteredData.length} of {data.length} customers
          {statusFilter !== "All" && ` • ${statusFilter}`}
          {searchQuery && ` • "${searchQuery}"`}
        </Typography>
      </Box>

      {/* Data Table with safe configuration */}
      <Box>
        <MaterialReactTable
          {...tableConfig}
          initialState={{
            density: "compact",
            pagination: { pageSize: 10 },
          }}
          muiTablePaperProps={{
            elevation: 0,
            sx: {
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            },
          }}
          muiTableContainerProps={{
            sx: { maxHeight: "500px" },
          }}
        />
      </Box>
    </Box>
  );
}

export default React.memo(CustomerKycStatus);
