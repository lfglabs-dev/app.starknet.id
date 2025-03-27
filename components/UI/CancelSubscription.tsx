import React, { useState } from "react";

interface CancelSubscriptionProps {
  onCancel: () => void; 
}

const CancelSubscription: React.FC<CancelSubscriptionProps> = ({ onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/cancel-subscription", { 
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: "12345" }), 
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to cancel subscription");
      }

      setLoading(false);
      console.log("Subscription canceled successfully!");
      onCancel(); 
    } catch (error) {
      setLoading(false);
      console.error("Cancel Subscription Error:", error);
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
