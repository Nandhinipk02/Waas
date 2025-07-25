import React from "react";
import { Box, Typography, Card, CardContent, Button } from "@mui/material";

function Recharge() {
  const plans = [
    { name: "Basic Plan", price: "₹199", duration: "30 days" },
    { name: "Standard Plan", price: "₹399", duration: "90 days" },
    { name: "Premium Plan", price: "₹599", duration: "180 days" },
  ];

  return (
    <Box sx={{ padding: "20px", background: "linear-gradient(to bottom, #0056b3, #007bff)", minHeight: "100vh", color: "#fff" }}>
      <Typography variant="h4" gutterBottom style={{ textAlign: "center" }}>
        Recharge Plans
      </Typography>
      {plans.map((plan, index) => (
        <Card key={index} style={{ marginBottom: "20px", background: "#fff", color: "#0056b3" }}>
          <CardContent>
            <Typography variant="h6">{plan.name}</Typography>
            <Typography variant="body2">{plan.price} - {plan.duration}</Typography>
          </CardContent>
          <Button variant="contained" style={{ width: "100%", background: "#0056b3", color: "#fff" }}>
            Recharge
          </Button>
        </Card>
      ))}
      <Button variant="contained" style={{ marginTop: "20px", background: "#fff", color: "#0056b3" }} href="/">
        Back to Dashboard
      </Button>
    </Box>
  );
}

export default Recharge;