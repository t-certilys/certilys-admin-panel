"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  CreditCardIcon,
  PlusSignIcon,
} from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PaymentMethods() {
  const paymentMethods = [
    {
      id: 1,
      type: "Visa",
      last4: "4242",
      expiry: "12/28",
      isDefault: true,
    },
  ];

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Payment Methods</h2>
        <Button variant="outline" size="sm" className="gap-2">
          <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2} />
          Add Payment Method
        </Button>
      </div>
      
      {paymentMethods.length === 0 ? (
        <Card className="border border-border/50 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-2xl bg-muted/50 p-5 text-muted-foreground mb-4">
              <HugeiconsIcon icon={CreditCardIcon} size={32} strokeWidth={1.5} />
            </div>
            <p className="text-sm text-muted-foreground">No payment methods added yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {paymentMethods.map((method) => (
            <Card key={method.id} className="border border-border/50 bg-muted/20">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                    <HugeiconsIcon icon={CreditCardIcon} size={24} strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{method.type}</p>
                      {method.isDefault && (
                        <Badge variant="secondary" className="text-[10px]">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      •••• {method.last4} • Expires {method.expiry}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
