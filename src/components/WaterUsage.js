import React from "react";
import { CircularProgress, Typography, Card, CardContent } from "@mui/material";

function WaterUsage() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Water Usage Details
        </Typography>
        <CircularProgress variant="determinate" value={0} size={120} />
        <Typography>
          <strong>0 / 150 Litres</strong> Water Purified
        </Typography>
        <button style={{ marginTop: "10px", padding: "10px 20px", background: "#6200ea", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Add More Water
        </button>
      </CardContent>
    </Card>
  );
}

export default WaterUsage;