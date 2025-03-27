import React, { useState } from "react";

interface CancelSubscriptionProps {
  onCancel: () => void; // Callback function when subscription is canceled
}

const CancelSubscription: React.FC<CancelSubscriptionProps> = ({ onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);

    try {
      // Call backend API or blockchain function here
      // Example: await fetch("/api/cancel-subscription", { method: "POST" });

      // Simulating an API call delay
      setTimeout(() => {
        setLoading(false);
        alert("Subscription canceled successfully!");
        onCancel();
      }, 2000);
    } catch (error) {
      setLoading(false);
      alert("Failed to cancel subscription. Please try again.");
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className={`bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition 
        ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-red-700"}
      `}
    >
      {loading ? "Cancelling..." : "Cancel Subscription"}
    </button>
  );
};

export default CancelSubscription;
