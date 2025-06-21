import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import CustomerKycForm from "./CustomerKycForm";
import CompletedKyc from "./CompletedKyc";
import CustomerKycStatus from "./CustomerKycStatus";
import useTabs from "../customHooks/useTabs";
import ViewDrafts from "./ViewDrafts";
import HodApprovalPending from "./HodApprovalPending";
import RevisionList from "./RevisionList";
import { UserContext } from "../contexts/UserContext";
import { useNavigation } from "../contexts/NavigationContext";
import { Paper, Typography, Chip } from "@mui/material";
import { 
  PersonAdd, 
  DraftsOutlined, 
  Edit, 
  HourglassEmpty, 
  CheckCircle,
  AdminPanelSettings,
  Assessment
} from "@mui/icons-material";
import BackButton from "./BackButton";

function CustomerKyc() {
  const { user } = React.useContext(UserContext);
  const { saveTabState, getTabState } = useNavigation();
  const [value, setValue] = React.useState(() => getTabState('/customer-kyc'));
  const { a11yProps, CustomTabPanel } = useTabs();
  
  const handleChange = (event, newValue) => {
    setValue(newValue);
    saveTabState('/customer-kyc', newValue);
  };

  // Save scroll position when component unmounts
  React.useEffect(() => {
    const handleBeforeUnload = () => {
      saveTabState('/customer-kyc', value);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveTabState('/customer-kyc', value);
    };
  }, [value, saveTabState]);

  const getTabIcon = (index) => {
    const icons = [
      <PersonAdd />,
      <Assessment />,
      <DraftsOutlined />,
      <Edit />,
      <HourglassEmpty />,
      <CheckCircle />
    ];
    return icons[index];
  };

  const getTabLabel = (label, count = null) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      {count !== null && (
        <Chip 
          label={count} 
          size="small" 
          color="primary" 
          sx={{ 
            height: '20px', 
            fontSize: '0.7rem',
            minWidth: '20px'
          }} 
        />
      )}
    </Box>
  );

  return (
    <Box 
      sx={{ 
        width: "100%",
        //  bgcolor:"red",
        padding: { xs: 1, sm: 2, md: 3 },
      }}
    >
      {user.role === "Admin" ? (
        <Paper
          elevation={0}
          sx={{
            background: '#ffffff',
            borderRadius: '8px',
            border: '2px solid #000000',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Clean Header Section */}
          <Box sx={{
            background: '#ffffff',
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 500, 
                color: '#1f2937',
                marginBottom: '4px',
                wordWrap: 'break-word',
                whiteSpace: 'normal',
                lineHeight: 1.2,
                fontSize: '1.75rem'
              }}>
                KYC Management Dashboard
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#6b7280',
                fontSize: '1rem',
                wordWrap: 'break-word',
                whiteSpace: 'normal',
                lineHeight: 1.4
              }}>
                Customer verification and compliance management
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            borderBottom: 1, 
            borderColor: "#e5e7eb",
            overflowX: 'auto',
          }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="KYC Management tabs"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              background: '#ffffff',
              minWidth: 'max-content',
              '& .MuiTabs-flexContainer': {
                justifyContent: 'center',
                gap: 0,
              },
              '& .MuiTab-root': {
                fontWeight: 500,
                textTransform: 'none',
                padding: '16px 24px',
                minHeight: '64px',
                minWidth: '200px',
                transition: 'all 0.2s ease',
                borderRadius: '0',
                whiteSpace: 'nowrap',
                color: '#6b7280',
                borderBottom: '2px solid transparent',
                '&:hover': {
                  background: '#f9fafb',
                  color: '#374151',
                },
                '&.Mui-selected': {
                  background: '#ffffff',
                  color: '#1f2937',
                  borderBottom: '2px solid #3b82f6',
                  fontWeight: 600,
                },
              },
    '& .MuiTabs-indicator': {
      display: 'none',
    },
    '& .MuiTabs-scrollButtons': {
      color: '#ed6c02',
      '&.Mui-disabled': {
        opacity: 0.3,
      },
    },
  }}
>
              <Tab 
                // icon={getTabIcon(0)}
                iconPosition="start"
                label="New Application" 
                {...a11yProps(0)} 
              />
              <Tab 
                icon={getTabIcon(1)}
                iconPosition="start"
                label="Customer KYC Status" 
                {...a11yProps(1)} 
              />
              <Tab 
                icon={getTabIcon(2)}
                iconPosition="start"
                label="Draft Applications" 
                {...a11yProps(2)} 
              />
              <Tab 
                icon={getTabIcon(3)}
                iconPosition="start"
                label="Revisions Required" 
                {...a11yProps(3)} 
              />
              <Tab 
                icon={getTabIcon(4)}
                iconPosition="start"
                label="Pending Approval" 
                {...a11yProps(4)} 
              />
              <Tab 
                icon={getTabIcon(5)}
                iconPosition="start"
                label="Completed KYC" 
                {...a11yProps(5)} 
              />
            </Tabs>
          </Box>

          <Box sx={{ 
            padding: { xs: '16px', sm: '24px', md: '32px' },
            minHeight: '60vh',
            background: '#fffefe',
            border: '1px solid rgb(6, 7, 7)',
          }}>
            <CustomTabPanel value={value} index={0}>
              <CustomerKycForm />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              <CustomerKycStatus />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
              <ViewDrafts />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={3}>
              <RevisionList />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={4}>
              <HodApprovalPending />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={5}>
              <CompletedKyc />
            </CustomTabPanel>
          </Box>
        </Paper>
      ) : (
        <Paper
          elevation={0}
          sx={{
            background: '#ffffff',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Clean Header Section for Non-Admin */}
          <Box sx={{
            background: '#ffffff',
            padding: '24px',
            borderBottom: '1px solid #e5e7eb',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <BackButton />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 500, 
                color: '#1f2937',
                marginBottom: '4px',
                wordWrap: 'break-word',
                whiteSpace: 'normal',
                lineHeight: 1.2,
                fontSize: '1.75rem'
              }}>
                Customer KYC Portal
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#6b7280',
                fontSize: '1rem',
                wordWrap: 'break-word',
                whiteSpace: 'normal',
                lineHeight: 1.4
              }}>
                Submit and manage your KYC applications
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            borderBottom: 1, 
            borderColor: "#e5e7eb",
            overflowX: 'auto',
          }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="Customer KYC tabs"
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                background: '#fffefe',
                minWidth: 'max-content',
                '& .MuiTab-root': {
                  fontWeight: 500,
                  textTransform: 'none',
                  padding: '16px 24px',
                  minHeight: '64px',
                  minWidth: '180px',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                  color: '#6b7280',
                  borderBottom: '2px solid transparent',
                  '&:hover': {
                    background: '#f9fafb',
                    color: '#374151',
                  },
                  '&.Mui-selected': {
                    background: '#fffefe',
                    color: '#000000',
                    borderBottom: '2px solid #2171c2',
                    fontWeight: 600,
                  },
                },
                '& .MuiTabs-indicator': {
                  display: 'none',
                },
                '& .MuiTabs-scrollButtons': {
                  color: '#2171c2',
                  '&.Mui-disabled': {
                    opacity: 0.3,
                  },
                },
              }}
            >
              <Tab 
                icon={getTabIcon(0)}
                iconPosition="start"
                label="New Application" 
                {...a11yProps(0)} 
              />
              <Tab 
                icon={getTabIcon(1)}
                iconPosition="start"
                label="My Drafts" 
                {...a11yProps(1)} 
              />
              <Tab 
                icon={getTabIcon(2)}
                iconPosition="start"
                label="Revisions" 
                {...a11yProps(2)} 
              />
            </Tabs>
          </Box>

          <Box sx={{ 
            padding: { xs: '16px', sm: '24px', md: '32px' },
            minHeight: '60vh',
            background: '#fffefe'
          }}>
            <CustomTabPanel value={value} index={0}>
              <CustomerKycForm />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              <ViewDrafts />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
              <RevisionList />
            </CustomTabPanel>
          </Box>
        </Paper>
      )}
    </Box>
  );
}

export default React.memo(CustomerKyc);
