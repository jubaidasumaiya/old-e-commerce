import React from "react";

const OrderTracking = ({ currentStatus }) => {
  const steps = ["Pending", "Processing", "Shipped", "Delivered"];
const displayStatus = currentStatus === "Paid" ? "Pending" : currentStatus;
const currentStepIndex = steps.indexOf(displayStatus);
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "20px 0", backgroundColor: "#f8fafc", padding: "15px", borderRadius: "8px" }}>
      {steps.map((step, index) => {
        const isCompleted = index <= currentStepIndex;
        const isCurrent = index === currentStepIndex;

        return (
          <div key={step} style={{ textAlign: "center", flex: 1, position: "relative" }}>
            <div style={{
              width: "30px", height: "30px", borderRadius: "50%",
              backgroundColor: isCompleted ? "#28a745" : "#cbd5e1", 
              color: "white", display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto", fontWeight: "bold",
              border: isCurrent ? "3px solid #155724" : "none",
              transition: "all 0.3s ease"
            }}>
              {isCompleted ? "✓" : index + 1}
            </div>
            <p style={{ fontSize: "12px", marginTop: "5px", fontWeight: isCurrent ? "bold" : "normal", color: isCompleted ? "#28a745" : "#64748b" }}>
              {step}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default OrderTracking;