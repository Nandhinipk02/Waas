import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";

function WaterConsumption() {
  const consumedWater = 1.5; // Example: 1.5 liters consumed today
  const targetWater = 2; // Daily target in liters

  return (
    <Box sx={{ padding: "20px", background: "linear-gradient(to bottom, #0056b3, #007bff)", minHeight: "100vh", color: "#fff", textAlign: "center" }}>
      <Typography variant="h4" gutterBottom>

        
        Water Consumption
      </Typography>
      <motion.div
        style={{
          width: "150px",
          height: "150px",
          margin: "20px auto",
          background: "rgba(255, 255, 255, 0.9)",
          borderRadius: "50%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      >
        <Typography variant="h6" style={{ color: "#0056b3", fontWeight: "bold" }}>
          {consumedWater} / {targetWater} L
        </Typography>
      </motion.div>
      <Typography variant="body1" style={{ marginTop: "20px" }}>
        {consumedWater < targetWater
          ? `Please drink ${(targetWater - consumedWater).toFixed(1)} L more to complete your goal.`
          : "Great Job! You've completed your daily water intake goal!"}
      </Typography>
      <Button variant="contained" style={{ marginTop: "20px", background: "#fff", color: "#0056b3" }} href="/">
        Back to Dashboard
      </Button>
    </Box>
  );
}

export default WaterConsumption;