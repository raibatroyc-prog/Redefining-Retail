import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Panel, StockBar, StatusPill } from "@/components/ui-parts";
import { statusOf, hoursUntil } from "@/lib/inventory-data";
import { useState, useMemo } from "react";
import { Filter, Loader2 } from "lucide-react";
import { useCurrentOrg } from "@/hooks/use-current-org";
import { useProducts } from "@/hooks/use-products";
