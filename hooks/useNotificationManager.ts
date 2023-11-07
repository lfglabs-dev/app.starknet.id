import { useAccount, useProvider } from "@starknet-react/core";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useEffect } from "react";
import { hexToDecimal } from "../utils/feltService";
import { NotificationType } from "../utils/constants";

const notificationsAtom = atomWithStorage<SIDNotification<NotificationData>[]>(
  "userNotifications_SID",
  []
);

export function useNotificationManager() {
  const { provider } = useProvider();
  const { address } = useAccount();
  const [notifications, setNotifications] = useAtom(notificationsAtom);

  useEffect(() => {
    const intervalId = setInterval(() => {
      notifications.forEach(checkTransactionStatus);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [notifications]);

  const checkTransactionStatus = async (
    notification: SIDNotification<NotificationData>,
    index: number
  ) => {
    if (notification.type !== NotificationType.TRANSACTION) return;
    if (notification.address !== hexToDecimal(address)) return;
    if (notification.data.status === "pending") {
      const transaction = notification.data;
      const data = await provider.getTransactionReceipt(transaction.hash);
      const updatedTransactions = [...notifications];

      if (data?.status === "REJECTED" || data?.status === "REVERTED") {
        updatedTransactions[index].data.status = "error";
        updatedTransactions[index].data.txStatus = "REJECTED";
        setNotifications(updatedTransactions);
      } else if (
        data?.status === "ACCEPTED_ON_L2" ||
        data?.status === "ACCEPTED_ON_L1"
      ) {
        updatedTransactions[index].data.txStatus = data.status;
        updatedTransactions[index].data.status = "success";
        setNotifications(updatedTransactions);
      }
    }
  };

  const filteredNotifications = address
    ? notifications.filter(
        (notification) => notification.address === hexToDecimal(address)
      )
    : [];

  const addTransaction = (notification: SIDNotification<NotificationData>) => {
    setNotifications((prev) => [
      { ...notification, address: hexToDecimal(address) },
      ...prev,
    ]);
  };

  return {
    notifications: filteredNotifications,
    addTransaction,
  };
}
