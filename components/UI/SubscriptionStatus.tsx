import React from "react";
import Button from "./button";

const SubscriptionStatus = () => {
  const isSubscriptionActive = false; // Change this based on actual subscription status

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg shadow-md max-w-sm mx-auto md:max-w-md lg:max-w-lg">
      <h2 className="text-lg font-bold text-gray-900">YOUR SUBSCRIPTION IS INACTIVE</h2>
      <p className="text-gray-500 mt-2">No upcoming payments</p>
      {!isSubscriptionActive && (
        <Button
          onClick={() => alert("Activating subscription...")}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold mt-4 px-6 py-2 rounded-lg"
          variation="success"
        >
          ACTIVE SUBSCRIPTION
        </Button>
      )}
    </div>
  );
};

export default SubscriptionStatus;