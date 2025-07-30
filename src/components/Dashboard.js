import React, { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { ReportGmailerrorred, WaterDrop } from '@mui/icons-material';
import { useNavigate } from "react-router-dom";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';

import { 
  Box, Typography, Grid, Card, Button, TextField,Dialog,DialogTitle,DialogActions,
  LinearProgress, Avatar, Divider, IconButton,DialogContent,
  List, ListItem, ListItemIcon, ListItemText,Snackbar,Alert,
  Badge, Chip, useMediaQuery, Menu, MenuItem
} from "@mui/material";

import AddIcon from '@mui/icons-material/Add';

import {
  Opacity as OpacityIcon,
  WaterDrop as WaterIcon,
  Update as UpdateIcon,
  BatteryFull as TankIcon,
  GppGood as UvIcon,
  LocalDrink as WaterConsumedIcon,
  WaterDrop as TDSIcon
} from '@mui/icons-material';


import { motion, useAnimation } from "framer-motion";
import {
  WaterDrop as WaterDropIcon,
  LocalDrink as LocalDrinkIcon,
  FilterAlt as FilterIcon,
  Notifications as NotificationsIcon,
  Replay as RechargeIcon,
  CheckCircle as CheckIcon,
  EmojiEvents as GiftIcon,
  Settings as SettingsIcon,
  ArrowBack as ArrowBackIcon,
  Person as ProfileIcon,
  History as HistoryIcon,
  CreditCard as SubscriptionIcon,
  Autorenew as AutopayIcon,
  Report as ReportIcon,
  Description as DocumentationIcon,
  Help as FAQIcon,
  ExitToApp as LogoutIcon
} from "@mui/icons-material";


// Water-themed color palette
const colors = {
  primary: "#00A3E0",
  secondary: "#0077B6",
  lightBlue: "#CAF0F8",
  accent: "#48CAE4",
  darkBlue: "#023E8A",
  success: "#4CAF50"
};

const Dashboard = () => {
  const location = useLocation();
  const userId = location.state?.userId || localStorage.getItem("userId") || "Guest";
  const [waterIntake, setWaterIntake] = useState(650); // in ml
  const [filterHealth, setFilterHealth] = useState(92); // percentage
  const [activeTab, setActiveTab] = useState("dashboard");
  const [glassFill, setGlassFill] = useState(0);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [menuContent, setMenuContent] = useState(null);
  const controls = useAnimation();
  const isMobile = useMediaQuery('(max-width:600px)');
  const navigate = useNavigate();
  const plan = { name: "Basic Plan", price: 199 }; // example plan
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userData, setUserData] = useState({});
  const [waterReminders, setWaterReminders] = useState([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [newReminderTime, setNewReminderTime] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [lowWaterAlertOpen, setLowWaterAlertOpen] = useState(false);
  const [planExpiryAlertOpen, setPlanExpiryAlertOpen] = useState(false);
  const [daysLeft, setDaysLeft] = useState(null);
  const [lowWaterDialogOpen, setLowWaterDialogOpen] = useState(false);
  const [remainingLiters, setRemainingLiters] = useState(0);
  const [showExpiryReminder, setShowExpiryReminder] = useState(false);
  const [showFilterDetails, setShowFilterDetails] = useState(false);




const handleSaveReminder = () => {
  if (!newReminderTime) return;

  const newReminder = {
    time: newReminderTime, // already in "HH:mm" format
    completed: false,
  };

  setWaterReminders([...waterReminders, newReminder]);
  setShowTimePicker(false);
  setNewReminderTime("");
};

  const cardStyle = {
  borderRadius: 2,
  p: 2,
  height: "100%",
  background: "white",
  boxShadow: "0 4px 12px rgba(0, 86, 179, 0.1)"
};

const valueStyle = {
  fontWeight: "bold",
  color: "#2196f3"
};



const handleDownloadInvoice = (item, index) => {
  const doc = new jsPDF();

  const marginX = 20;
  const marginY = 20;
  const pageWidth = doc.internal.pageSize.getWidth();

  // ✅ Company Name - Centered in Black
  const companyText = "Hoags Technologies India Private Limited";
  const companyTextWidth = doc.getTextWidth(companyText);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0); // black
  doc.text(companyText, (pageWidth - companyTextWidth) / 2, marginY);

  // ✅ Invoice Title - Left aligned in Black, spaced below company name
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice", marginX, marginY + 15); // spaced 15px below

  // ✅ Plan Details Table with blue borders
  autoTable(doc, {
    startY: marginY + 25,
    margin: { left: marginX, right: marginX },
    head: [["Field", "Value"]],
    body: [
      ["Plan Name", item.plan_name?.toUpperCase()],
      ["Plan Amount", `Rs. ${item.plan_amount}`],
      ["Water Limit", item.water_limit],
      ["Product Version", item.prod_version],
      ["Start Date", new Date(item.start_date).toLocaleDateString()],
      ["End Date", new Date(item.end_date).toLocaleDateString()],
    ],
    styles: {
      font: "helvetica",
      fontSize: 12,
      cellPadding: 4,
      lineColor: [41, 128, 185], // blue
      lineWidth: 0.5,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
    },
    tableLineColor: [41, 128, 185],
    tableLineWidth: 0.5,
  });

  // ✅ Save PDF
  doc.save(`Invoice_${item.plan_name}_${index + 1}.pdf`);
};

// Add this state at the top of your component with other state declarations
const [lastEmailSent, setLastEmailSent] = useState(null);

useEffect(() => {
  if (userId && userId !== "Guest") {
    axios
      .post("https://diag.hoags.in/waas/usercredential/details", { id: userId })
      .then((response) => {
        const user = response.data.user_data || {};
        const history = response.data.recharge_history || [];
        const deviceData = response.data.device_list?.[0] || {};
        const user_mail = user.emailid;
        const paymentStarted = localStorage.getItem("paymentStarted");
        
        // Extract BLE device data
        const bleData = deviceData.ble_received_data?.[0] || {};
        
        // Calculate total water consumption from water_consumption array
        const waterConsumption = deviceData.water_consumption || [];
        const totalConsumed = waterConsumption.reduce(
          (sum, item) => sum + (parseFloat(item.water_consumption) || 0), 
          0
        );
        
        const latestPlan = history.length > 0 ? history.at(-1) : null;
        const waterLimit = latestPlan?.water_limit ? 
                         parseFloat(latestPlan.water_limit.replace('L', '')) : 
                         100;
        const planEndDate = latestPlan?.end_date;

        // Low water alert logic
       const remaining = waterLimit - totalConsumed;
console.log("Remaining water:", remaining, "L");

if (remaining <= 10) {
  setRemainingLiters(remaining);
  setLowWaterDialogOpen(true);

  const now = new Date();
  if (!lastEmailSent || (now - new Date(lastEmailSent)) > 24 * 60 * 60 * 1000) {
    sendLowWaterEmail(user_mail, remaining);
    setLastEmailSent(now.toISOString());

  }
}

// Plan expiry logic//

// ⏳ TEMPORARY FAKE EXPIRY DATE — 2 days from now

if (latestPlan) {
  latestPlan.end_date = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();
}
 
if (latestPlan?.end_date) {
  const today = new Date();
  const expiry = new Date(latestPlan.end_date);
  const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

 
 

  if (diffDays <= 3 && diffDays >= 0) {
    setDaysLeft(diffDays); 
    setShowExpiryReminder(true);
  }
}


        // Set user data with raw values (units will be added in UI)
        setUserData({
          user_data: {
            ...user,
            // Return raw numbers without units
            temperature: bleData.temperature ? parseInt(bleData.temperature, 16) : 0,
            tank_status: getTankStatus(bleData.tank_status) || "Unknown",
            uv_status: bleData.uv_status === "01" ? "Active" : "Inactive",
            total_water_consumed: parseFloat(totalConsumed.toFixed(1)),
            total_water_purified: bleData.water_consumed 
              ? parseFloat((parseInt(bleData.water_consumed, 16) / 10).toFixed(1))
              : 0,
            inlet_tds: bleData.inlet_tds ? parseInt(bleData.inlet_tds, 16) : 0,
            last_updated: bleData.local_time || "--",
            filter_life: calculateFilterHealth(bleData.filter_life),
            water_quality: getWaterQuality(bleData.water_quality_status),

            
            // Plan details
            planName: latestPlan?.plan_name || "No Plan",
            planModel: latestPlan?.prod_version || "N/A",
            waterLimit: waterLimit,
            planAmount: latestPlan?.plan_amount || "N/A",
            planStartDate: latestPlan?.start_date || "N/A",
            planEndDate: planEndDate || "N/A"
          },
          recharge_history: history,
          device_list: [deviceData]
        });
      })
      .catch((error) => {
        console.error("Failed to fetch user details:", error);
      });
  }
}, [userId, lastEmailSent,]);

// Helper functions
const getTankStatus = (code) => {
  const statusMap = {
    "01": "Full",
    "02": "3/4 Full",
    "03": "Half Full",
    "04": "1/4 Full",
    "05": "Empty"
  };
  return statusMap[code] || "Unknown";
};

const calculateFilterHealth = (hexValue) => {
  if (!hexValue || hexValue.length < 12) return [];

  try {
    const percentages = [];
    for (let i = 0; i < 12; i += 2) {
      const hex = hexValue.substring(i, i + 2);
      const percent = parseInt(hex, 16) / 255 * 100;
      percentages.push(Math.round(percent));
    }
    return percentages;
  } catch {
    return [];
  }
};


const getWaterQuality = (code) => {
  const qualityMap = {
    "0000": "Excellent",
    "0001": "Good",
    "0010": "Fair",
    "0011": "Poor"
  };
  return qualityMap[code] || "Unknown";
};



const sendLowWaterEmail = async (email, remainingLiters) => {
  try {
    const response = await axios.post('https://diag.hoags.in/waas/send-email', {
      to: email,
      subject: 'Low Water Alert',
      text: `Dear user,\n\nYour purifier has only ${remainingLiters}L water left.\nPlease recharge soon.\n\n- Hoags`
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    console.log("✅ Email sent. Response:", response.data);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
};




  // Plan details
const currentPlan = {
  name: userData?.user_data?.planName || "No Plan",
  model: userData?.user_data?.planModel || "N/A",
  waterLimit: userData?.user_data?.waterLimit || "N/A",
  amount: userData?.user_data?.planAmount || "N/A",
  startDate: userData?.user_data?.planStartDate
    ? new Date(userData.user_data.planStartDate).toLocaleDateString()
    : "N/A",
expiryDate: userData?.user_data?.planEndDate
    ? new Date(userData.user_data.planEndDate).toLocaleDateString()
    : "N/A"


};

  const availablePlans = [
    { id: 1, name: "Basic", price: "₹299", validity: "1 Month", waterLimit: "100L" },
    { id: 2, name: "Silver", price: "₹429", validity: "3 Months", waterLimit: "150L" },
    { id: 3, name: "Gold", price: "₹699", validity: "6 Months", waterLimit: "250L" }
  ];

 
  //useEffect(() => {
    // Calculate glass fill percentage based on water intake
    //setGlassFill(Math.min((waterIntake / 2000) * 100, 100));
 // }, [waterIntake]);

  const handleAddWater = async (amount) => {
    const newAmount = Math.min(waterIntake + amount, 2000);
    
    // Animate water filling
    await controls.start({
      y: [0, -20, 0],
      opacity: [1, 0.5, 1],
      transition: { duration: 0.5 }
    });
    
    setWaterIntake(newAmount);
  };

  // Open settings menu
  const handleSettingsClick = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleProceedToPayment = () => {
    navigate("/payment", { state: { plan } });
  };

  // Close settings menu
  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  // Handle menu item click
  const handleMenuItemClick = (item) => {
    handleSettingsClose();
    switch(item) {
case 'profile':
  setMenuContent(
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>My Profile</Typography>

      {!userData?.user_data ? (
        <Typography color="text.secondary">Loading profile...</Typography>
      ) : (
        <Card sx={{ p: 3, borderRadius: 3, bgcolor: '#f0f9ff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ width: 56, height: 56, mr: 2, bgcolor: '#2b7ec1' }}>
              {userData.user_data.username?.[0]?.toUpperCase() || 'U'}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {userData.user_data.username || 'Unnamed User'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {userData.user_data.planName
                  ? `${userData.user_data.planName} Plan User`
                  : 'Plan not assigned'}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>📧 Email:</strong> {userData.user_data.emailid || 'Not Provided'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>📱 Phone:</strong> {userData.user_data.phoneno || 'Not Provided'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>📍 Location:</strong> {userData.user_data.location || 'Not Provided'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>🧑 Username:</strong> {userData.user_data.username || 'Not Provided'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>💧 Plan:</strong> {userData.user_data.planName || 'Not Assigned'}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            <Button
              variant="contained"
              sx={{
                textTransform: 'none',
                bgcolor: '#2b7ec1',
                color: '#fff',
                borderRadius: 2,
                fontWeight: 600
              }}
              onClick={() => alert('Edit Profile clicked!')}
            >
              Edit Profile
            </Button>
          </Box>
        </Card>
      )}
    </Box>
  );
  break;



        case 'logout':
          localStorage.removeItem('userId');
          window.location.href = '/.components/Login';
          break;




case 'recharge':
  setMenuContent(
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Recharge History
      </Typography>

      {userData?.recharge_history?.length > 0 ? (
        userData.recharge_history.map((item, index) => {
          const statusColor =
            item.status === 'active'
              ? 'success'
              : item.status === 'expired'
              ? 'default'
              : 'warning';

          return (
            <Card key={index} sx={{ mb: 3, p: 2, borderRadius: 3, bgcolor: '#f0f9ff' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WaterDrop sx={{ color: '#2b7ec1', mr: 1 }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 600, flexGrow: 1 }}>
                  {item.plan_name?.toUpperCase()} Plan
                </Typography>
                <Chip label={item.status} color={statusColor} size="small" />
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Typography variant="body2"><strong>Amount:</strong> ₹{item.plan_amount}</Typography>
              <Typography variant="body2"><strong>Water Limit:</strong> {item.water_limit}</Typography>
              <Typography variant="body2"><strong>Product Version:</strong> {item.prod_version}</Typography>
              <Typography variant="body2"><strong>Start Date:</strong> {new Date(item.start_date).toLocaleDateString()}</Typography>
            <Typography variant="body2"><strong>End Date:</strong> {new Date(item.end_date).toLocaleDateString()}</Typography>


              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <Button
  variant="contained"
  size="small"
  onClick={() => handleDownloadInvoice(item, index)}
  sx={{
    textTransform: 'none',
    bgcolor: '#2b7ec1',
    color: '#fff',
    '&:hover': { bgcolor: '#012a60' }
  }}
>
  Download Invoice
</Button>


              </Box>
            </Card>
          );
        })
      ) : (
        <Typography variant="body2" color="text.secondary">
          No recharge history found.
        </Typography>
      )}
    </Box>
  );
  break;



case 'subscription':
  const current = userData?.user_data || {};
  const isExpired = current.planEndDate && new Date(current.planEndDate) < new Date();

  setMenuContent(
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        My Subscription
      </Typography>

      <Card sx={{ mb: 3, p: 2, borderRadius: 3, bgcolor: '#f0f9ff' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <WaterDrop sx={{ color: '#2b7ec1', mr: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, flexGrow: 1 }}>
            {current.planName?.toUpperCase() || "NO PLAN"} Plan
          </Typography>
          <Chip
            label={isExpired ? "expired" : "active"}
            color={isExpired ? "error" : "success"}
            size="small"
          />
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="body2"><strong>💰 Amount:</strong> ₹{current.planAmount || "N/A"}</Typography>
        <Typography variant="body2"><strong>💧 Water Limit:</strong> {current.waterLimit || "N/A"}</Typography>
        <Typography variant="body2"><strong>📅 Start Date:</strong> {current.planStartDate ? new Date(current.planStartDate).toLocaleDateString() : "N/A"}</Typography>
        <Typography variant="body2"><strong>⏳ Expiry Date:</strong> {current.planEndDate ? new Date(current.planEndDate).toLocaleDateString() : "N/A"}</Typography>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            size="small"
            onClick={() => setActiveTab("plans")} // ✅ Navigate to plan selection
            sx={{
              textTransform: 'none',
              bgcolor: '#2b7ec1',
              color: '#fff',
              '&:hover': { bgcolor: '#012a60' }
            }}
          >
            Renew Subscription
          </Button>
        </Box>
      </Card>
    </Box>
  );
  break;



      case 'autopay':
      case 'report':
      case 'docs':
      case 'faq':
        setMenuContent(
          <Box sx={{ 
            p: 2, 
            textAlign: 'center', 
            height: '200px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <Typography variant="h6">Coming Soon</Typography>
          </Box>
        );
        break;
      default:
        setMenuContent(null);
    }
    setActiveTab("menu");
  };

  const WaterGlassAnimation = () => (
    <Box sx={{ 
      position: "relative", 
      width: isMobile ? 120 : 150,
      height: isMobile ? 180 : 220,
      margin: "0 auto",
      mb: 3
    }}>
      {/* Glass outline */}
      <Box sx={{
        position: "absolute",
        width: "100%",
        height: "100%",
        border: "4px solid #00A3E0",
        borderRadius: "0 0 30px 30px",
        zIndex: 1,
        overflow: "hidden"
      }}>
        {/* Water fill */}
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${glassFill}%` }}
          transition={{ duration: 1 }}
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            background: "linear-gradient(to top, #00A3E0, #48CAE4)",
            borderRadius: "0 0 26px 26px"
          }}
        />
      </Box>
      
      {/* Water droplets animation */}
      <motion.div
        animate={controls}
        style={{
          position: "absolute",
          top: 20,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2
        }}
      >
        <WaterDropIcon sx={{ fontSize: 40, color: colors.accent }} />
      </motion.div>
      
      {/* Measurement markers */}
      <Box sx={{
        position: "absolute",
        right: -30,
        top: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between"
      }}>
        {[0, 25, 50, 75, 100].map((percent) => (
          <Box key={percent} sx={{ 
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              right: 0,
              top: "50%",
              width: 10,
              height: 1,
              backgroundColor: "#666",
              transform: "translateX(100%)"
            }
          }}>
            <Typography variant="caption" sx={{ color: "#666" }}>
              {2000 * (1 - percent/100)}ml
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );

  const WaterPipeAnimation = () => (
    <Box sx={{ 
      position: "relative",
      width: "100%",
      height: 100,
      mb: 3,
      overflow: "hidden"
    }}>
      {/* Pipe */}
      <Box sx={{
        position: "absolute",
        top: 40,
        left: 0,
        right: 0,
        height: 20,
        backgroundColor: "#BDBDBD",
        borderRadius: 10,
        "&::before": {
          content: '""',
          position: "absolute",
          top: -10,
          left: "20%",
          width: 60,
          height: 40,
          backgroundColor: "#BDBDBD",
          borderRadius: "20px 20px 0 0",
          transform: "rotate(10deg)"
        }
      }} />
      
      {/* Flowing water */}
      <motion.div
        animate={{
          x: ["-100%", "100%"],
          transition: {
            repeat: Infinity,
            duration: 3,
            ease: "linear"
          }
        }}
        style={{
          position: "absolute",
          top: 45,
          left: 0,
          width: "100%",
          height: 10,
          background: "linear-gradient(to right, transparent, #00A3E0, transparent)"
        }}
      />
    </Box>
  );

  const renderDashboard = () => (
    <Box sx={{ p: 2, background: "#fafafaff", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#0056b3" }}>
          Waas
        </Typography>
        <IconButton onClick={handleSettingsClick}>
          <SettingsIcon sx={{ color: "#0056b3" }} />
        </IconButton>
        
        {/* Settings Menu */}
        <Menu
          anchorEl={settingsAnchorEl}
          open={Boolean(settingsAnchorEl)}
          onClose={handleSettingsClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
              '&:before': {
                content: '""',
                display: 'block',
                position: 'absolute',
                top: 0,
                right: 14,
                width: 10,
                height: 10,
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) rotate(45deg)',
                zIndex: 0,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem onClick={() => handleMenuItemClick('profile')}>
            <ListItemIcon>
              <ProfileIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>My Profile</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleMenuItemClick('recharge')}>
            <ListItemIcon>
              <HistoryIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Recharge History</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleMenuItemClick('subscription')}>
            <ListItemIcon>
              <SubscriptionIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>My Subscription</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleMenuItemClick('autopay')}>
            <ListItemIcon>
              <AutopayIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Autopay Settings</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleMenuItemClick('report')}>
            <ListItemIcon>
              <ReportIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Report a Problem</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleMenuItemClick('docs')}>
            <ListItemIcon>
              <DocumentationIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Documentation</ListItemText>
          </MenuItem>
          <MenuItem onClick={() => handleMenuItemClick('faq')}>
            <ListItemIcon>
              <FAQIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>FAQ</ListItemText>
          </MenuItem>
          <Divider />
          <MenuItem onClick={() => handleMenuItemClick('logout')}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Log Out</ListItemText>
          </MenuItem>
          <Box sx={{ px: 2, py: 1 }}>
            <Typography variant="caption" color="text.secondary">
              App Ver. 4.3.8v
            </Typography>
          </Box>
        </Menu>
      </Box>

      <Typography variant="body2" sx={{ color: "#666", mb: 3 }}>
        Connect water purifier with app
      </Typography>

 {/* Current Plan Card with Dynamic Water Animation */}
<Card sx={{ 
  borderRadius: 2, 
  mb: 3,
  background: "linear-gradient(135deg, #e0f7ff 0%, #80d8ff 100%)",
  boxShadow: "0 4px 12px rgba(0, 105, 192, 0.25)",
  position: "relative",
  overflow: "hidden",
  borderLeft: "4px solid #0091ea"
}}>
  {/* Animated Water Background */}
  <Box sx={{
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "40%",
    background: "linear-gradient(180deg, rgba(0, 145, 234, 0.4) 0%, rgba(0, 105, 192, 0.6) 100%)",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "100%",
      background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)",
      animation: "fastFlow 1.5s linear infinite",
      "@keyframes fastFlow": {
        "0%": { transform: "translateX(-100%)" },
        "100%": { transform: "translateX(100%)" }
      }
    },
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: "30%",
      background: "linear-gradient(180deg, rgba(255,255,255,0.4) 0%, transparent 100%)",
      animation: "fastRipple 2s ease-in-out infinite alternate",
      "@keyframes fastRipple": {
        "0%": { transform: "scaleX(1) translateY(-5px)" },
        "100%": { transform: "scaleX(1.2) translateY(0)" }
      }
    }
  }} />

  {/* Floating Water Bubbles */}
  {[...Array(8)].map((_, i) => (
    <Box key={i} sx={{
      position: "absolute",
      width: `${Math.random() * 10 + 5}px`,
      height: `${Math.random() * 10 + 5}px`,
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.3)",
      bottom: `${Math.random() * 30}%`,
      left: `${Math.random() * 100}%`,
      animation: `bubbleUp ${Math.random() * 2 + 3}s infinite`,
      animationDelay: `${Math.random() * 2}s`,
      "@keyframes bubbleUp": {
        "0%": { transform: "translateY(0) scale(0.8)", opacity: 0 },
        "20%": { opacity: 0.6 },
        "100%": { transform: "translateY(-100px) scale(1.2)", opacity: 0 }
      }
    }} />
  ))}

  <Box sx={{ p: 2, position: "relative", zIndex: 1 }}>
    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
      <WaterDropIcon sx={{ 
        color: "#0066cc", 
        mr: 1, 
        fontSize: 22,
        animation: "dripPulse 2s infinite",
        "@keyframes dripPulse": {
          "0%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(2px)" },
          "100%": { transform: "translateY(0)" }
        }
      }} />
      <Typography variant="subtitle2" sx={{ 
        color: "#0066cc", 
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.5px"
      }}>
        Current Plan
      </Typography>
    </Box>
    
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#003366" }}>
          {currentPlan.name}
        </Typography>
        <Typography variant="body2" sx={{ color: "#4a6b8a" }}>
          Model: {currentPlan.model}
        </Typography>
      </Box>
      <Chip 
        label={`${currentPlan.waterLimit}ml`} 
        sx={{ 
          backgroundColor: "rgba(0, 102, 204, 0.15)",
          color: "#0066cc",
          fontWeight: "bold",
          border: "1px solid rgba(0, 102, 204, 0.3)",
          fontSize: "0.875rem",
          px: 1.5,
          py: 1
        }} 
      />
    </Box>
    
    <Divider sx={{ 
      my: 2, 
      borderColor: "rgba(0, 102, 204, 0.2)",
      borderBottomWidth: "2px",
      borderStyle: "dashed"
    }} />

    <Grid container spacing={2}>
      <Grid item xs={6}>
        <Typography variant="body2" sx={{ color: "#5a7a9a", fontWeight: 500 }}>
          Plan Amount
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: "bold", color: "#00264d" }}>
          {currentPlan.amount}
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="body2" sx={{ color: "#5a7a9a", fontWeight: 500 }}>
          Plan Start
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: "bold", color: "#00264d" }}>
          {currentPlan.startDate}
        </Typography>
      </Grid>
    </Grid>
  </Box>
</Card>

  {/* Recharge Section */}
<Card sx={{ 
  borderRadius: 2, 
  mb: 3,
  background: "white",
  boxShadow: "0 4px 12px rgba(179, 0, 0, 0.1)" // Adjusted shadow color to a red tone
}}>
  <Box sx={{ p: 2 }}>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
      <Typography variant="subtitle2" sx={{ color: "#666" }}>
        RECHARGE
      </Typography>
      <Chip 
        label={`Expires on: ${currentPlan.expiryDate}`} 
        size="small"
        sx={{ backgroundColor: "#ffebee", color: "#d32f2f" }} // Updated to red shades
      />
    </Box>

<Dialog
  open={showExpiryReminder}
  onClose={() => setShowExpiryReminder(false)}
  disableEscapeKeyDown
  PaperProps={{
    sx: { borderRadius: 2, p: 2, minWidth: 320 }
  }}
>
  <DialogTitle sx={{ color: "#d32f2f", fontWeight: 'bold' }}>
    ⏳ Plan Expiry Alert
  </DialogTitle>
  <DialogContent sx={{ color: "#333", fontSize: "16px" }}>
    Your plan will expire in {daysLeft} day(s).<br />
    Please recharge soon to avoid service interruption.
  </DialogContent>
  <DialogActions>
    <Button 
      variant="contained" 
      color="error" 
      onClick={() => setShowExpiryReminder(false)}
    >
      Close
    </Button>
  </DialogActions>
</Dialog>







    
    

    {/* Animated Text */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, loop: Infinity }}
      style={{
        textAlign: "center",
        marginTop: "8px",
        color: "#b30000", // Red color
        fontWeight: "bold",
        fontSize: "0.9rem",
      }}
    >
      Recharge Soon!
    </motion.div>
    
    <Button 
      fullWidth 
      variant="outlined" 
      startIcon={<RechargeIcon />}
      sx={{
        mt: 1,
        borderRadius: 1,
        borderColor: "#b30000", // Red border color
        color: "#b30000", // Text color
        textTransform: "none",
        justifyContent: "space-between",
        "&:hover": {
          borderColor: "#ff0000", // A brighter red on hover
          backgroundColor: "#ffebee" // Slight red background on hover
        }
      }}
      onClick={() => setActiveTab("plans")}
    >
      Change Plan
      <Typography variant="body2">
        Switch your water plan
      </Typography>
    </Button>
  </Box>
</Card>

<Grid container spacing={3} justifyContent="center" sx={{ mb: 3 }}>
  {/* Filter Health - Left aligned on mobile */}
  <Grid item xs={12} sm={6} md={4}>
  <motion.div whileHover={{ scale: 1.03 }}>
    <Card
      onClick={() => setShowFilterDetails(prev => !prev)}
      sx={{
        cursor: 'pointer',
        borderRadius: 2,
        p: 2,
        minHeight: 100,
        width: "85%",
        background: "white",
        boxShadow: "0 4px 12px rgba(0, 86, 179, 0.1)"
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
        <FilterIcon sx={{ color: "#0056b3", mr: 1 }} />
        <Typography variant="subtitle2">Filter Health</Typography>
      </Box>

      <Box sx={{ mb:3}}/>

      {!showFilterDetails ? (() => {
        const avg = Math.round(
          (userData?.user_data?.filter_life?.reduce((a, b) => a + b, 0) || 0) /
          (userData?.user_data?.filter_life?.length || 1)
        );
     let statusLabel = "Poor";
let barColor = "#f44336";
if (avg >= 80) {
  statusLabel = "Excellent";
  barColor = "#4caf50";
} else if (avg >= 45) { 
  statusLabel = "Good";
  barColor = "#ff9800";
}


        return (
          <>
            <LinearProgress
              variant="determinate"
              value={avg}
              sx={{
                height: 6,
                borderRadius: 3,
                mb:4,
                backgroundColor: "#e3f2fd",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: barColor,
                },
              }}
            />
            <Typography variant="body2" sx={{ color: barColor, fontWeight: "bold" }}>
              {statusLabel} ({avg}%)
            </Typography>
          </>
        );
      })() : (
        <>
          {["Sediment Filter", "Carbon Filter", "RO Filter", "Copper Value Filter", "Alkaline Filter", "Mineral Filter"].map((label, index) => (
            <Box key={label} sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                {label}: {userData?.user_data?.filter_life?.[index] ?? 0}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={userData?.user_data?.filter_life?.[index] ?? 0}
                sx={{
                  height: 5,
                  borderRadius: 2,
                  backgroundColor: "#e0e0e0",
                  "& .MuiLinearProgress-bar": {
                    backgroundColor: "#1976d2"
                  }
                }}
              />
            </Box>
          ))}
        </>
      )}
    </Card>
  </motion.div>
</Grid>


  {/* Water Temperature - Right aligned on mobile */}
  <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-end', sm: 'center' } }}>
    <motion.div whileHover={{ scale: 1.03 }}>
      <Card sx={{ borderRadius: 2, p: 2, minHeight: 100, width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "white", boxShadow: "0 4px 12px rgba(0, 86, 179, 0.1)" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <WaterIcon sx={{ color: "#0056b3", mr: 1 }} />
          <Typography variant="subtitle2">Water Temp</Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2196f3" }}>
          {userData?.user_data?.temperature ?? "--"}°C
        </Typography>
        <Typography variant="caption" sx={{ color: "#757575" }}>
          Current temperature
        </Typography>
      </Card>
    </motion.div>
  </Grid>

  {/* Tank Status - Left aligned on mobile */}
  <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'center' } }}>
    <motion.div whileHover={{ scale: 1.03 }}>
      <Card sx={{ borderRadius: 2, p: 2, minHeight: 100, width: "85%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "white", boxShadow: "0 4px 12px rgba(0, 86, 179, 0.1)" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <TankIcon sx={{ color: "#0056b3", mr: 1 }} />
          <Typography variant="subtitle2">Tank Status</Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#4caf50" }}>
          {userData?.user_data?.tank_status ?? "Full"}
        </Typography>
        <Typography variant="caption" sx={{ color: "#757575" }}>
          Water level status
        </Typography>
      </Card>
    </motion.div>
  </Grid>

  {/* Inlet TDS - Right aligned on mobile */}
  <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-end', sm: 'center' } }}>
    <motion.div whileHover={{ scale: 1.03 }}>
      <Card sx={{ borderRadius: 2, p: 2, minHeight: 100, width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "white", boxShadow: "0 4px 12px rgba(0, 86, 179, 0.1)" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <TDSIcon sx={{ color: "#0056b3", mr: 1 }} />
          <Typography variant="subtitle2">Inlet TDS</Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ff9800" }}>
          {userData?.user_data?.inlet_tds ?? "--"} ppm
        </Typography>
        <Typography variant="caption" sx={{ color: "#757575" }}>
          Input water quality
        </Typography>
      </Card>
    </motion.div>
  </Grid>

  {/* Water Consumed - Left aligned on mobile */}
  <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'center' } }}>
    <motion.div whileHover={{ scale: 1.03 }}>
      <Card sx={{ borderRadius: 2, p: 2, minHeight: 100, width: "85%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "white", boxShadow: "0 4px 12px rgba(0, 86, 179, 0.1)" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <WaterConsumedIcon sx={{ color: "#0056b3", mr: 1 }} />
          <Typography variant="subtitle2">Water Consumed</Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2196f3" }}>
          {userData?.user_data?.total_water_consumed ?? "0"} L
        </Typography>
        <Typography variant="caption" sx={{ color: "#757575" }}>
          Today's consumption
        </Typography>
      </Card>
    </motion.div>
  </Grid>

<Dialog
  open={lowWaterDialogOpen}
  onClose={() => {}} // disables backdrop close
  disableEscapeKeyDown
  PaperProps={{
    sx: { borderRadius: 2, p: 2, minWidth: 320 }
  }}
>
  <DialogTitle sx={{ color: "#d32f2f", fontWeight: 'bold' }}>
    🚱 Low Water Alert
  </DialogTitle>
  <DialogContent sx={{ color: "#333", fontSize: "16px" }}>
    Only {remainingLiters} liter(s) of water remaining.<br />
    Please recharge your plan soon to avoid service disruption.
  </DialogContent>
  <DialogActions>
    <Button 
      variant="contained" 
      color="error" 
      onClick={() => setLowWaterDialogOpen(false)}
    >
      Close
    </Button>
  </DialogActions>
</Dialog>




  {/* Water Quality - Right aligned on mobile */}
  <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-end', sm: 'center' } }}>
    <motion.div whileHover={{ scale: 1.03 }}>
      <Card sx={{ borderRadius: 2, p: 2, minHeight: 100, width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "white", boxShadow: "0 4px 12px rgba(0, 86, 179, 0.1)" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <CheckIcon sx={{ color: "#0056b3", mr: 1 }} />
          <Typography variant="subtitle2">Water Quality</Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#4caf50" }}>
          {userData?.user_data?.water_quality ?? "Excellent"}
        </Typography>
        <Typography variant="caption" sx={{ color: "#757575" }}>
          Last checked: Today
        </Typography>
      </Card>
    </motion.div>
  </Grid>

  {/* Water Purified - Left aligned on mobile */}
  <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'center' } }}>
    <motion.div whileHover={{ scale: 1.03 }}>
      <Card sx={{ borderRadius: 2, p: 2, minHeight: 100, width: "85%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "white", boxShadow: "0 4px 12px rgba(0, 86, 179, 0.1)" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <OpacityIcon sx={{ color: "#0056b3", mr: 1 }} />
          <Typography variant="subtitle2">Water Purified</Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#2196f3" }}>
          {userData?.user_data?.total_water_purified ?? "0"} L
        </Typography>
        <Typography variant="caption" sx={{ color: "#757575" }}>
          Today's purification
        </Typography>
      </Card>
    </motion.div>
  </Grid>

  {/* UV Sterilization - Right aligned on mobile */}
  <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-end', sm: 'center' } }}>
    <motion.div whileHover={{ scale: 1.03 }}>
      <Card sx={{ borderRadius: 2, p: 2, minHeight: 100, width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "white", boxShadow: "0 4px 12px rgba(0, 86, 179, 0.1)" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <UvIcon sx={{ color: "#0056b3", mr: 1 }} />
          <Typography variant="subtitle2">UV Status</Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#4caf50" }}>
          {userData?.user_data?.uv_status ?? "Inactive"}
        </Typography>
        <Typography variant="caption" sx={{ color: "#757575" }}>
          Purification status
        </Typography>
      </Card>
    </motion.div>
  </Grid>

  {/* Drink Water - Left aligned on mobile */}
  <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'center' } }}>
    <motion.div whileHover={{ scale: 1.03 }}>
      <Card sx={{ borderRadius: 2, p: 2, minHeight: 100, width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "white", boxShadow: "0 4px 12px rgba(0, 86, 179, 0.1)" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <WaterDropIcon sx={{ color: "#0056b3", mr: 1 }} />
          <Typography variant="subtitle2">Drink Water</Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#003366" }}>
          {waterIntake ?? "0"}ml
        </Typography>
        <Typography variant="caption" sx={{ color: "#757575" }}>
          Track every glass
        </Typography>
      </Card>
    </motion.div>
  </Grid>

  {/* Last Updated - Right aligned on mobile */}
  <Grid item xs={12} sm={6} md={4} sx={{ display: 'flex', justifyContent: { xs: 'flex-end', sm: 'center' } }}>
    <motion.div whileHover={{ scale: 1.03 }}>
      <Card sx={{ borderRadius: 2, p: 2, minHeight: 100, width: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", background: "white", boxShadow: "0 4px 12px rgba(0, 86, 179, 0.1)" }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <UpdateIcon sx={{ color: "#0056b3", mr: 1 }} />
          <Typography variant="subtitle2">Last Updated</Typography>
        </Box>
        <Box>
          <Typography variant="body2" sx={{ fontWeight: "bold", color: "#757575" }}>
            {userData?.user_data?.last_updated ? userData.user_data.last_updated.split(' ')[0] : "--"}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold", color: "#757575" }}>
            {userData?.user_data?.last_updated ? userData.user_data.last_updated.split(' ')[1] : "--"}
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: "#757575" }}>
          Recent data refresh
        </Typography>
      </Card>
    </motion.div>
  </Grid>
</Grid>

    

 {/* Water Reminders */}
  
  <Card
    sx={{
      borderRadius: 2,
      background: "white",
      boxShadow: "0 4px 12px rgba(0, 86, 179, 0.1)",
    }}
  >
    <Box sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ color: "#666", mb: 2 }}>
        TODAY'S WATER REMINDERS
      </Typography>

      <List>
        {waterReminders.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            No reminders added yet.
          </Typography>
        ) : (
          waterReminders.map((reminder, index) => (
            <ListItem
              key={index}
              sx={{
                px: 0,
                "&:not(:last-child)": {
                  borderBottom: "1px solid #eee",
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                {reminder.completed ? (
                  <CheckIcon sx={{ color: "#4caf50" }} />
                ) : (
                  <WaterDropIcon sx={{ color: "#0056b3" }} />
                )}
              </ListItemIcon>

              <ListItemText
                primary={
                  dayjs(`2023-01-01T${reminder.time}`).isValid()
                    ? dayjs(`2023-01-01T${reminder.time}`).format("hh:mm A")
                    : "Invalid Time"
                }
                primaryTypographyProps={{
                  fontWeight: reminder.completed ? "normal" : "bold",
                }}
              />

              <Button
                size="small"
                variant={reminder.completed ? "text" : "contained"}
                onClick={() => {
                  const updated = [...waterReminders];
                  updated[index].completed = true;
                  setWaterReminders(updated);
                }}
                sx={{
                  borderRadius: 1,
                  textTransform: "none",
                  fontSize: "0.75rem",
                  mr: 1,
                }}
              >
                {reminder.completed ? "Done" : "Drink Now"}
              </Button>

              <Button
                size="small"
                variant="outlined"
                sx={{ fontSize: "0.75rem", mr: 1 }}
                onClick={() => {
                  setEditIndex(index);
                  setNewReminderTime(reminder.time);
                  setShowTimePicker(true);
                }}
              >
                Edit
              </Button>

              <Button
                size="small"
                variant="outlined"
                color="error"
                sx={{ fontSize: "0.75rem" }}
                onClick={() => {
                  const updated = [...waterReminders];
                  updated.splice(index, 1);
                  setWaterReminders(updated);
                }}
              >
                Delete
              </Button>
            </ListItem>
          ))
        )}
      </List>

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={() => {
          setEditIndex(null); // Add mode
          setNewReminderTime("");
          setShowTimePicker(true);
        }}
        disabled={waterReminders.length >= 6}
        sx={{ mt: 2 }}
      >
        Add Reminder
      </Button>

      <Dialog open={showTimePicker} onClose={() => setShowTimePicker(false)}>
        <DialogTitle>{editIndex !== null ? "Edit" : "Add"} Reminder Time</DialogTitle>
        <DialogContent>
          <TextField
            type="time"
            fullWidth
            value={newReminderTime}
            onChange={(e) => setNewReminderTime(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTimePicker(false)}>Cancel</Button>
          <Button
            onClick={() => {
              const formattedTime = newReminderTime;

              const duplicate = waterReminders.some(
                (r, idx) => r.time === formattedTime && idx !== editIndex
              );

              if (duplicate) {
                alert("Reminder for this time already exists.");
                return;
              }

              if (editIndex !== null) {
                const updated = [...waterReminders];
                updated[editIndex].time = formattedTime;
                setWaterReminders(updated);
              } else {
                setWaterReminders([
                  ...waterReminders,
                  { time: formattedTime, completed: false },
                ]);
              }

              setShowTimePicker(false);
              setNewReminderTime("");
              setEditIndex(null);
            }}
            variant="contained"
            disabled={!newReminderTime}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  </Card>

</Box>
);




  const renderWaterTracker = () => (
    <Box sx={{ p: 2, background: "#f5f9ff", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => setActiveTab("dashboard")} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#0056b3" }}>
          Water Tracker
        </Typography>
      </Box>

      {/* Water pipe animation */}
      <WaterPipeAnimation />

      {/* Water glass animation */}
      <WaterGlassAnimation />

      <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
        {waterIntake}ml of 2000ml daily goal
      </Typography>

      <LinearProgress 
        variant="determinate" 
        value={(waterIntake / 2000) * 100}
        sx={{ 
          height: 10, 
          borderRadius: 5,
          mb: 3,
          backgroundColor: "#e3f2fd",
          "& .MuiLinearProgress-bar": {
            background: "linear-gradient(to right, #2196f3, #0056b3)"
          }
        }}
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[250, 500, 750].map((amount) => (
          <Grid item xs={4} key={amount}>
            <Button 
              fullWidth
              variant="outlined"
              onClick={() => handleAddWater(amount)}
              sx={{
                borderRadius: 2,
                borderColor: "#0056b3",
                color: "#0056b3",
                "&:hover": { 
                  backgroundColor: "rgba(0, 86, 179, 0.1)",
                  borderColor: "#0056b3"
                }
              }}
            >
              +{amount}ml
            </Button>
          </Grid>
        ))}
      </Grid>

      <Typography variant="subtitle2" sx={{ color: "#666", mb: 2 }}>
        TODAY'S HYDRATION
      </Typography>
      
      <Card sx={{ 
        borderRadius: 2,
        background: "white",
        boxShadow: "0 4px 12px rgba(0, 86, 179, 0.1)"
      }}>
        <Box sx={{ p: 2 }}>
          <List>
            {[
              { time: "Morning", amount: "250ml", completed: true },
              { time: "Afternoon", amount: "400ml", completed: true },
              { time: "Evening", amount: "0ml", completed: false },
              { time: "Night", amount: "0ml", completed: false }
            ].map((item, index) => (
              <ListItem 
                key={index} 
                sx={{ 
                  px: 0,
                  "&:not(:last-child)": { 
                    borderBottom: "1px solid #eee" 
                  } 
                }}
              >
                <ListItemText 
                  primary={item.time} 
                  secondary={item.amount}
                  primaryTypographyProps={{ fontWeight: "bold" }}
                  secondaryTypographyProps={{ 
                    color: item.completed ? "#4caf50" : "#f44336",
                    fontWeight: "bold"
                  }}
                />
                {item.completed ? (
                  <CheckIcon sx={{ color: "#4caf50" }} />
                ) : (
                  <Button 
                    size="small" 
                    variant="contained"
                    sx={{ 
                      borderRadius: 1,
                      textTransform: "none",
                      fontSize: "0.75rem"
                    }}
                    onClick={() => handleAddWater(parseInt(item.amount))}
                  >
                    Add
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        </Box>
      </Card>
    </Box>
  );

  const renderPlanSelection = () => (
    <Box sx={{ p: 2, background: "#f5f9ff", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => setActiveTab("dashboard")} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#0056b3" }}>
          Choose Your Plan
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ color: "#666", mb: 3 }}>
        Select the best water plan for your needs
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {availablePlans.map((plan) => (
          <Grid item xs={12} key={plan.id}>
            <motion.div whileHover={{ scale: 1.01 }}>
              <Card sx={{
                borderRadius: 2,
                p: 2,
                border: currentPlan.name === plan.name ? "2px solid #0056b3" : "1px solid #ddd",
                background: currentPlan.name === plan.name ? "#e3f2fd" : "white",
                boxShadow: "0 4px 8px rgba(0, 86, 179, 0.1)"
              }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {plan.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#666" }}>
                      {plan.waterLimit} per day
                    </Typography>
                  </Box>
                  <Chip
                    label={plan.price}
                    sx={{
                      backgroundColor: currentPlan.name === plan.name ? "#0056b3" : "#e3f2fd",
                      color: currentPlan.name === plan.name ? "white" : "#0056b3",
                      fontWeight: "bold"
                    }}
                  />
                </Box>
                <Divider sx={{ my: 2 }} />
                <Typography variant="body2" sx={{ mb: 2 }}>
                  Validity: {plan.validity}
                </Typography>
                <Button
                  fullWidth
                  variant="contained"
                  sx={{
                    borderRadius: 1,
                    textTransform: "none",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    "&:hover": {
                      backgroundColor: "#388E3C"
                    }
                  }}
                 onClick={() => {
  localStorage.setItem("paymentStarted", "true");
  const amount = encodeURIComponent(plan.price);
  window.location.href = `https://razorpay.me/@hoagstechnologiesindiaprivate?amount=EPec5evqGoRk2C8icWNJlQ%3D%3D`;
}}

                >
                  Pay Now
                </Button>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </Box>
  );



  const renderMenuContent = () => (
    <Box sx={{ p: 2, background: "#f5f9ff", minHeight: "100vh" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton onClick={() => setActiveTab("dashboard")} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: "bold", color: "#0056b3" }}>
          Menu
        </Typography>
      </Box>
      
      {menuContent || (
        <Box sx={{ 
          p: 2, 
          textAlign: 'center', 
          height: '200px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center' 
        }}>
          <Typography variant="h6">Select a menu item</Typography>
        </Box>
      )}
    </Box>
  );

  return (
    <>
    

      {activeTab === "dashboard" && renderDashboard()}
      {activeTab === "water" && renderWaterTracker()}
      {activeTab === "plans" && renderPlanSelection()}
      {activeTab === "menu" && renderMenuContent()}
      
    </>
  );

};

export default Dashboard;