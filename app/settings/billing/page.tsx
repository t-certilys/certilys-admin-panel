"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  InvoiceIcon,
  InformationCircleIcon,
  Calendar03Icon,
  DollarCircleIcon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

import { PaymentMethods } from "@/components/certilys-ui/settings/billing/payment-methods";

export default function BillingPage() {
  // Simulated data
  const currentPlan = {
    name: "Starter Plan",
    status: "active",
    price: "$19/month",
    nextBilling: "May 12, 2026",
  };

  const invoices = []; 

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 max-w-4xl mx-auto w-full pb-24">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight">Billing & Subscriptions</h1>
        <p className="text-muted-foreground">
          Manage your subscription plans, payment methods, and billing history.
        </p>
      </div>

      <div className="grid gap-8">
        {/* CURRENT PLAN SECTION */}
        <Card className="border border-border/50 bg-muted/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="grid gap-1.5">
              <CardTitle className="text-lg">Current Plan</CardTitle>
              <CardDescription>
                You are currently on the {currentPlan.name}.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors uppercase text-[10px] font-bold tracking-wider">
              {currentPlan.status}
            </Badge>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="flex flex-wrap gap-8 items-center justify-between rounded-xl border border-border/40 bg-background/50 p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                  <HugeiconsIcon icon={DollarCircleIcon} size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Price</p>
                  <p className="text-2xl font-bold">{currentPlan.price}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-muted p-3 text-muted-foreground">
                  <HugeiconsIcon icon={Calendar03Icon} size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Next Billing Date</p>
                  <p className="text-lg font-semibold">{currentPlan.nextBilling}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline">Manage Billing</Button>
              <Button className="shadow-lg shadow-primary/20">Upgrade Plan</Button>
            </div>
          </CardContent>
        </Card>

        {/* NEW PAYMENT METHODS SUITE */}
        <PaymentMethods />

        {/* BILLING HISTORY (RULE A10) */}
        <div className="grid gap-4">
          <h2 className="text-xl font-semibold tracking-tight">Billing History</h2>
          {invoices.length === 0 ? (
            <Empty className="rounded-xl border bg-muted/10 py-14">
              <EmptyHeader>
                <EmptyMedia className="rounded-2xl bg-muted/50 p-5 text-muted-foreground mb-4">
                  <HugeiconsIcon icon={InvoiceIcon} size={32} strokeWidth={1.5} />
                </EmptyMedia>
                <EmptyTitle className="text-lg font-semibold tracking-tight">No invoices found</EmptyTitle>
                <EmptyDescription className="max-w-[300px] text-sm">
                  You don&apos;t have any billing history or previous invoices yet.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  <HugeiconsIcon icon={InformationCircleIcon} size={16} strokeWidth={2} />
                  Learn more about billing
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="rounded-xl border border-border/40 overflow-hidden">
               {/* Table implementation would go here if invoices exist */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
