import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { Button } from "../components/Button";
import { UpsertPayrollSettingModal } from "../components/modules/UpsertPayrollSettingModal";
import {
  CalendarDays,
  CalendarClock,
  Edit,
  Plus,
  CheckCircle2,
  XCircle,
  Lock,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";
import Loader from "../components/Loader";

const PayrollSettings = () => {
  const [payrollSetting, setPayrollSetting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [upsertLoading, setUpsertLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPayrollSetting = async () => {
    setLoading(true);

    try {
      const res = await api.get("/payroll-settings");

      if (res.data.success) {
        setPayrollSetting(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching payroll settings:", error);
      toast.error(
        error.response?.data?.message || "Failed to fetch payroll settings.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollSetting();
  }, []);

  const handleUpsertSubmit = async (formData) => {
    setUpsertLoading(true);

    try {
      if (payrollSetting?._id) {
        const res = await api.put(
          `/payroll-settings/${payrollSetting._id}`,
          formData,
        );

        if (res.data.success) {
          toast.success("Payroll settings updated successfully.");
        }
      } else {
        const res = await api.post("/payroll-settings/add", formData);

        if (res.data.success) {
          toast.success("Payroll settings created successfully.");
        }
      }

      setIsModalOpen(false);
      await fetchPayrollSetting();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Something went wrong.");
    } finally {
      setUpsertLoading(false);
    }
  };

  const renderStatus = (value) => (
    <div className="flex items-center gap-2">
      {value ? (
        <>
          <CheckCircle2 className="w-4 h-4 text-success" />
          <span className="font-medium text-success">Enabled</span>
        </>
      ) : (
        <>
          <XCircle className="w-4 h-4 text-destructive" />
          <span className="font-medium text-destructive">Disabled</span>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Payroll Settings
        </h2>

        <Button
          rightIcon={
            payrollSetting ? (
              <Edit className="w-3.5 h-3.5" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )
          }
          onClick={() => setIsModalOpen(true)}
        >
          {payrollSetting ? "Edit Settings" : "Create Settings"}
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        {loading ? (
          <Loader />
        ) : payrollSetting ? (
          <>
            <div className="border-b border-border px-6 py-4">
              <h3 className="font-semibold text-foreground">
                Payroll Configuration
              </h3>

              <p className="text-sm text-muted-foreground mt-1">
                Configure company-wide payroll processing preferences.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  <h4 className="font-medium text-foreground">
                    Payroll Closing Day
                  </h4>
                </div>

                <p className="text-2xl font-bold text-foreground">
                  {payrollSetting.payrollClosingDay}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarClock className="w-5 h-5 text-primary" />
                  <h4 className="font-medium text-foreground">
                    Salary Pay Day
                  </h4>
                </div>

                <p className="text-2xl font-bold text-foreground">
                  {payrollSetting.salaryPayDay}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Provident Fund (PF)
                </p>

                {renderStatus(payrollSetting.pfEnabled)}
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Employee State Insurance (ESI)
                </p>

                {renderStatus(payrollSetting.esiEnabled)}
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Professional Tax
                </p>

                {renderStatus(payrollSetting.professionalTaxEnabled)}
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground mb-3">Income Tax</p>

                {renderStatus(payrollSetting.incomeTaxEnabled)}
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-2 mb-3">
                  {payrollSetting.payrollLocked ? (
                    <Lock className="w-5 h-5 text-destructive" />
                  ) : (
                    <Unlock className="w-5 h-5 text-success" />
                  )}

                  <p className="font-medium text-foreground">Payroll Status</p>
                </div>

                <span
                  className={`font-semibold ${
                    payrollSetting.payrollLocked
                      ? "text-destructive"
                      : "text-success"
                  }`}
                >
                  {payrollSetting.payrollLocked ? "Locked" : "Unlocked"}
                </span>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground mb-2">Remarks</p>

                <p className="text-foreground whitespace-pre-wrap">
                  {payrollSetting.remarks || "--"}
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="py-20 px-8 text-center">
            <h3 className="text-lg font-semibold text-foreground">
              No Payroll Settings Found
            </h3>

            <p className="text-muted-foreground mt-2 mb-6">
              Create your payroll configuration to begin managing payroll
              preferences.
            </p>

            <Button
              rightIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setIsModalOpen(true)}
            >
              Create Payroll Settings
            </Button>
          </div>
        )}
      </div>

      <UpsertPayrollSettingModal
        open={isModalOpen}
        payrollSetting={payrollSetting}
        loading={upsertLoading}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleUpsertSubmit}
      />
    </div>
  );
};

export default PayrollSettings;
