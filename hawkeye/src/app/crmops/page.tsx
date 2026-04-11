"use client";

import { Button } from "@/components/base/buttons/button";
import { LinkExternal01 } from "@untitledui/icons";

const TWENTY_DIRECT_URL = "http://35.200.208.76";

export default function CrmOpsPage() {
  return (
    <div className="flex h-screen w-screen flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-secondary bg-primary px-4 py-2">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-primary">CRM Operations</h1>
          <span className="rounded-full bg-utility-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700">
            Admin Panel
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            color="secondary"
            iconLeading={LinkExternal01}
            onClick={() => window.open(TWENTY_DIRECT_URL, "_blank")}
          >
            Open in new tab
          </Button>
          <Button
            size="sm"
            color="secondary"
            onClick={() => window.history.back()}
          >
            Back to Hawkeye
          </Button>
        </div>
      </div>

      {/* Twenty UI iframe */}
      <iframe
        src={TWENTY_DIRECT_URL}
        className="flex-1 border-0"
        title="Twenty CRM Operations"
        allow="clipboard-read; clipboard-write"
      />
    </div>
  );
}
