import React from "react";
import { Modal } from "../Modal";
import StatItem from "./StatItem";

const leaveConfig = {
  PL: {
    className: "text-success",
  },
  SL: {
    className: "text-warning",
  },
  CL: {
    className: "text-primary",
  },
};

const LeaveBalanceModal = ({ open, onOpenChange, leaveBalances = [] }) => {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Leave Balance"
      showFooter={false}
      size="lg"
    >
      {leaveBalances.length === 0 ? (
        <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
          No leave balances available.
        </div>
      ) : (
        <div className="space-y-6">
          {leaveBalances.map((leave) => {
            const config = leaveConfig[leave.leaveType.code] ?? {};
            const remaining = Math.max(leave.allocatedDays - leave.usedDays, 0);

            return (
              <div
                key={leave._id}
                className="rounded-lg border border-border p-2.5 space-y-1.5"
              >
                <StatItem
                  label={leave.leaveType.name}
                  value={`${remaining} / ${leave.allocatedDays} Days`}
                  valueClassName={config.className}
                />

                <StatItem label="Used" value={`${leave.usedDays} Days`} />
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
};

export default LeaveBalanceModal;
