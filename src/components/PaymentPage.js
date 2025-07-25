import React, { useState } from "react";
import {
  Box, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, CircularProgress, Alert, Typography
} from "@mui/material";

const paymentMethods = [
  { key: "credit", label: "Credit Card" },
  { key: "debit", label: "Debit Card" },
  { key: "upi", label: "UPI" },
];

export default function PaymentPage({ location }) {
  // If you passed plan info via react-router (state), get it like this:
  const plan = location?.state?.plan || { name: "Demo Plan", price: 199 };

  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [paymentDetails, setPaymentDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  const handleChange = (e) => {
    setPaymentDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePayment = (e) => {
    e.preventDefault();
    setLoading(true);
    setPaymentSuccess(null);
    setTimeout(() => {
      setLoading(false);
      setPaymentSuccess(true);
    }, 2000); // simulate payment processing
  };

  const renderPaymentForm = () => {
    if (paymentMethod === "credit" || paymentMethod === "debit") {
      return (
        <>
          <TextField
            margin="dense"
            label="Card Number"
            name="cardNumber"
            required
            fullWidth
            variant="outlined"
            size="small"
            value={paymentDetails.cardNumber || ""}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Cardholder Name"
            name="cardName"
            required
            fullWidth
            variant="outlined"
            size="small"
            value={paymentDetails.cardName || ""}
            onChange={handleChange}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              margin="dense"
              label="Expiry (MM/YY)"
              name="expiry"
              required
              variant="outlined"
              size="small"
              value={paymentDetails.expiry || ""}
              onChange={handleChange}
            />
            <TextField
              margin="dense"
              label="CVV"
              name="cvv"
              required
              variant="outlined"
              size="small"
              type="password"
              value={paymentDetails.cvv || ""}
              onChange={handleChange}
            />
          </Box>
        </>
      );
    }
    if (paymentMethod === "upi") {
      return (
        <TextField
          margin="dense"
          label="UPI ID"
          name="upiId"
          required
          fullWidth
          variant="outlined"
          size="small"
          value={paymentDetails.upiId || ""}
          onChange={handleChange}
        />
      );
    }
    return null;
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 6, p: 3, boxShadow: 2, borderRadius: 2, bgcolor: "#fff" }}>
      <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
        Pay for {plan.name}
      </Typography>
      <Typography variant="h6" sx={{ mb: 3, textAlign: "center", color: "#0056b3" }}>
        ₹{plan.price}
      </Typography>
      <form onSubmit={handlePayment}>
        <TextField
          select
          fullWidth
          label="Payment Method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          margin="dense"
          variant="outlined"
          size="small"
        >
          {paymentMethods.map((method) => (
            <MenuItem key={method.key} value={method.key}>
              {method.label}
            </MenuItem>
          ))}
        </TextField>
        {renderPaymentForm()}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <CircularProgress />
          </Box>
        )}
        {paymentSuccess === true && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Payment successful!
          </Alert>
        )}
        {paymentSuccess === false && (
          <Alert severity="error" sx={{ mt: 2 }}>
            Payment failed. Please try again.
          </Alert>
        )}
        <DialogActions sx={{ p: 0, pt: 2 }}>
          <Button type="submit" variant="contained" fullWidth disabled={loading}>
            {loading ? "Processing..." : "Pay"}
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
}