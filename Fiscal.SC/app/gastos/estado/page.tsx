import type { Metadata } from "next";
import StateExecutiveView from "@/components/executive/views/state-executive-view";

export const metadata: Metadata = { title: "Executivo de Santa Catarina" };

export default function StateExecutivePage() {
  return (
    <StateExecutiveView
      name="Santa Catarina"
      revenue="R$ 12,48 bi"
      expenses="R$ 11,11 bi"
      contracts="1.248"
      bids="87"
    />
  );
}
