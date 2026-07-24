"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Building2, ChevronRight } from "lucide-react";

export interface BusinessOption {
  id: string;
  slug: string;
  businessName: string;
  role: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businesses: BusinessOption[];
  onSelect: (business: BusinessOption) => void;
}

export default function BusinessSwitcherDialog({
  open,
  onOpenChange,
  businesses,
  onSelect,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md overflow-hidden p-0"
      >
        {/* Bright gradient header band */}
        <div className="relative bg-gradient-to-br from-sky-500 via-blue-500 to-cyan-400 px-6 pt-6 pb-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
          <DialogHeader className="relative">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-white text-lg">
              Select a Business
            </DialogTitle>
            <DialogDescription className="text-sky-50/90">
              Your account belongs to multiple businesses. Choose the one you
              want to continue with.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Business list, overlapping the header slightly */}
        <div className="-mt-4 space-y-2.5 px-6 pb-6">
          {businesses.map((business) => (
            <Button
              key={business.id}
              variant="outline"
              onClick={() => onSelect(business)}
              className="group h-auto w-full justify-start gap-3 rounded-xl border-sky-100 bg-white py-3.5 pl-3.5 pr-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md hover:shadow-sky-100"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sky-100 to-cyan-50 ring-1 ring-sky-200 transition-colors group-hover:from-sky-500 group-hover:to-cyan-400">
                <Building2 className="h-5 w-5 text-sky-600 transition-colors group-hover:text-white" />
              </div>

              <div className="flex-1 text-left">
                <div className="font-semibold text-slate-800">
                  {business.slug}
                </div>
                <div className="text-xs capitalize text-sky-600/80">
                  {business.role}
                </div>
              </div>

              <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-sky-500" />
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}