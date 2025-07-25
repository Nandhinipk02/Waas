import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

function PlanDetails() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Plan Details
        </Typography>
        <Typography>
          <strong>Plan Name:</strong> Silver
        </Typography>
        <Typography>
          <strong>Model:</strong> Bolt
        </Typography>
        <Typography>
          <strong>Water Limit:</strong> 150 Ltr
        </Typography>
        <Typography>
          <strong>Plan Amount:</strong> ₹429/month
        </Typography>
        <Typography>
          <strong>Plan Start:</strong> 02/09/2024
        </Typography>
      </CardContent>
    </Card>
  );
}

export default PlanDetails;