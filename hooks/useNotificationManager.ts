import { useAccount, useProvider } from "@starknet-react/core";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useEffect } from "react";
import { hexToDecimal } from "../utils/feltService";
import { NotificationType } from "../utils/constants";
import {
  RejectedTransactionReceiptResponse,
  RevertedTransactionReceiptResponse,
} from "starknet";

const notificationsAtom = atomWithStorage<SIDNotification<NotificationData>[]>(
  "userNotifications_SID",
  []
);

export function useNotificationManager() {
  const { provider } = useProvider();
  const { address } = useAccount();
  const [notifications, setNotifications] = useAtom(notificationsAtom);

  useEffect(() => {
    const checkTransactionStatus = async (
      notification: SIDNotification<NotificationData>,
      index: number
    ) => {
      if (notification.type !== NotificationType.TRANSACTION) return;
      if (notification.address !== hexToDecimal(address)) return;
      if (notification.data.status === "pending") {
        const transaction = notification.data;
        const transactionReceipt = await provider.waitForTransaction(
          transaction.hash
        );
        const updatedTransactions = [...notifications];

        if (
          transactionReceipt.isRejected() ||
          transactionReceipt.isReverted() ||
          transactionReceipt.isError()
        ) {
          updatedTransactions[index].data.status = "error";
          transactionReceipt.match({
            rejected: (txR: RejectedTransactionReceiptResponse) => {
              updatedTransactions[index].data.txStatus = txR.status;
            },
            reverted: (txR: RevertedTransactionReceiptResponse) => {
              updatedTransactions[index].data.txStatus = txR.status;
            },
            error: (err: Error) => {
              console.log("Error while fetching transaction receipt", err);
              updatedTransactions[index].data.txStatus = undefined;
            },
            success: () => {},
          });
          setNotifications(updatedTransactions);
        } else if (transactionReceipt.isSuccess()) {
          updatedTransactions[index].data.txStatus =
            transactionReceipt.finality_status;
          updatedTransactions[index].data.status = "success";
          setNotifications(updatedTransactions);
        }
      }
    };

    const intervalId = setInterval(() => {
      notifications.forEach(checkTransactionStatus);
    }, 5000);

    return () => clearInterval(intervalId);
  }, [notifications, address, provider, setNotifications]);

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
