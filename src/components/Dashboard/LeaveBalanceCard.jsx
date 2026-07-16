import React from "react";
import { Card } from "../Card";
import { Button } from "../Button";
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

const LeaveBalanceCard = ({ leaveBalances = [], onViewDetails }) => {
  return (
    <Card
      title="Leave Balance"
      description="Overview of your available leaves."
      action={
        <Button size="sm" variant="outline" onClick={onViewDetails}>
          View Details
        </Button>
      }
    >
      {leaveBalances.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
          No leave balances available.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {leaveBalances.map((leave) => {
            const config = leaveConfig[leave.leaveType.code] ?? {};

            return (
              <StatItem
                key={leave._id}
                label={leave.leaveType.name}
                value={`${leave.allocatedDays - leave.usedDays} Days`}
                valueClassName={config.className}
              />
            );
          })}
        </div>
      )}
    </Card>
  );
};

export default LeaveBalanceCard;
