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
        // bgcolor:"red",
        padding: { xs: 1, sm: 2, md: 3 },
      }}
    >
      {user.role === "Admin" ? (
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(243, 163, 16, 0.1)',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Header Section */}
          <Box sx={{
            background: 'linear-gradient(135deg, rgba(243, 163, 16, 0.1) 0%, rgba(160, 160, 160, 0.1) 100%)',
            padding: '24px',
            borderBottom: '1px solid rgba(243, 163, 16, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>

            <AdminPanelSettings sx={{ fontSize: 32, color: '#ed6c02' }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: '#2c3e50',
                marginBottom: '4px',
                wordWrap: 'break-word',
                whiteSpace: 'normal',
                lineHeight: 1.2
              }}>
                KYC Management Dashboard
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#6c757d',
                fontSize: '1.1rem',
                wordWrap: 'break-word',
                whiteSpace: 'normal',
                lineHeight: 1.4
              }}>
                Comprehensive customer verification and compliance management
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            borderBottom: 1, 
            borderColor: "rgba(243, 163, 16, 0.1)",
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(243, 163, 16, 0.1)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(243, 163, 16, 0.5)',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: 'rgba(243, 163, 16, 0.7)',
              },
            },
          }}>
          <Tabs
  value={value}
  onChange={handleChange}
  aria-label="KYC Management tabs"
  // variant="scrollable"
  scrollButtons="auto"
  allowScrollButtonsMobile
  sx={{
    background: 'rgba(255, 255, 255, 0.8)',
    minWidth: 'max-content',
    '& .MuiTabs-flexContainer': {
      justifyContent: 'center',
      gap: 7,
    },
    '& .MuiTab-root': {
      fontWeight: 500,
      textTransform: 'none',
      padding: '16px 24px',
      minHeight: '64px',
      minWidth: '200px',
      transition: 'all 0.3s ease-in-out',
      borderRadius: '0',
      whiteSpace: 'nowrap',
      '&:hover': {
        background: 'rgba(243, 163, 16, 0.08)',
        transform: 'translateY(-2px)',
      },
      '&.Mui-selected': {
        background: 'linear-gradient(135deg, rgba(243, 163, 16, 0.94) 0%, rgb(160, 160, 160) 100%)',
        color: '#ffffff',
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
                icon={getTabIcon(0)}
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
            background: 'rgba(255, 255, 255, 0.5)'
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
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 249, 250, 0.9) 100%)',
            borderRadius: '20px',
            border: '1px solid rgba(243, 163, 16, 0.1)',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Header Section for Non-Admin */}
          <Box sx={{
            background: 'linear-gradient(135deg, rgba(243, 163, 16, 0.1) 0%, rgba(160, 160, 160, 0.1) 100%)',
            padding: '24px',
            borderBottom: '1px solid rgba(243, 163, 16, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <BackButton />
            <PersonAdd sx={{ fontSize: 32, color: '#ed6c02' }} />
            <Box sx={{ flex: 1 }}>
              <Typography variant="h4" sx={{ 
                fontWeight: 700, 
                color: '#2c3e50',
                marginBottom: '4px',
                wordWrap: 'break-word',
                whiteSpace: 'normal',
                lineHeight: 1.2
              }}>
                Customer KYC Portal
              </Typography>
              <Typography variant="body1" sx={{ 
                color: '#6c757d',
                fontSize: '1.1rem',
                wordWrap: 'break-word',
                whiteSpace: 'normal',
                lineHeight: 1.4
              }}>
                Submit and manage your Know Your Customer applications
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            borderBottom: 1, 
            borderColor: "rgba(243, 163, 16, 0.1)",
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(243, 163, 16, 0.1)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(243, 163, 16, 0.5)',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: 'rgba(243, 163, 16, 0.7)',
              },
            },
          }}>
            <Tabs
              value={value}
              onChange={handleChange}
              aria-label="Customer KYC tabs"
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                background: 'rgba(255, 255, 255, 0.8)',
                minWidth: 'max-content',
                '& .MuiTab-root': {
                  fontWeight: 500,
                  textTransform: 'none',
                  padding: '16px 24px',
                  minHeight: '64px',
                  minWidth: '180px',
                  transition: 'all 0.3s ease-in-out',
                  whiteSpace: 'nowrap',
                  '&:hover': {
                    background: 'rgba(243, 163, 16, 0.08)',
                  },
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, rgba(243, 163, 16, 0.94) 0%, rgb(160, 160, 160) 100%)',
                    color: '#ffffff',
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
            background: 'rgba(255, 255, 255, 0.5)'
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
