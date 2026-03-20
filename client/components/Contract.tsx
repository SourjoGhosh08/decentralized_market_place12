"use client";

import { useState, useCallback } from "react";
import {
  createListing,
  buyItem,
  cancelListing,
  confirmDelivery,
  raiseDispute,
  resolveDispute,
  getListing,
  getActiveListings,
  getSellerListings,
  getBuyerListings,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function ShoppingCartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
    </svg>
  );
}

function ScaleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

function Textarea({
  label,
  ...props
}: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
        <textarea
          {...props}
          rows={3}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none resize-none"
        />
      </div>
    </div>
  );
}

// ── Method Signature ─────────────────────────────────────────

function MethodSignature({
  name,
  params,
  returns,
  color,
}: {
  name: string;
  params: string;
  returns?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
      <span style={{ color }} className="font-semibold">fn</span>
      <span className="text-white/70">{name}</span>
      <span className="text-white/20 text-xs">{params}</span>
      {returns && (
        <span className="ml-auto text-white/15 text-[10px]">{returns}</span>
      )}
    </div>
  );
}

// ── Status Config ────────────────────────────────────────────

type ListingStatus = "Active" | "Sold" | "Delivered" | "Cancelled" | "Disputed" | "Refunded";

const STATUS_CONFIG: Record<ListingStatus, { color: string; bg: string; border: string; dot: string; variant: "success" | "warning" | "info" }> = {
  Active: { color: "text-[#34d399]", bg: "bg-[#34d399]/10", border: "border-[#34d399]/20", dot: "bg-[#34d399]", variant: "success" },
  Sold: { color: "text-[#7c6cf0]", bg: "bg-[#7c6cf0]/10", border: "border-[#7c6cf0]/20", dot: "bg-[#7c6cf0]", variant: "info" },
  Delivered: { color: "text-[#4fc3f7]", bg: "bg-[#4fc3f7]/10", border: "border-[#4fc3f7]/20", dot: "bg-[#4fc3f7]", variant: "info" },
  Cancelled: { color: "text-white/40", bg: "bg-white/[0.05]", border: "border-white/[0.1]", dot: "bg-white/30", variant: "info" },
  Disputed: { color: "text-[#fbbf24]", bg: "bg-[#fbbf24]/10", border: "border-[#fbbf24]/20", dot: "bg-[#fbbf24]", variant: "warning" },
  Refunded: { color: "text-[#f87171]", bg: "bg-[#f87171]/10", border: "border-[#f87171]/20", dot: "bg-[#f87171]", variant: "warning" },
};

interface ListingData {
  title: string;
  description: string;
  price: string;
  seller: string;
  buyer: string | null;
  status: ListingStatus;
  dispute_reason: string | null;
}

// ── Main Component ───────────────────────────────────────────

type Tab = "browse" | "create" | "my-listings" | "my-purchases";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("browse");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // Create listing
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Browse / view
  const [browseTab, setBrowseTab] = useState<"all" | "mine">("all");
  const [listings, setListings] = useState<{ id: number; data: ListingData }[]>([]);
  const [isLoadingListings, setIsLoadingListings] = useState(false);

  // Detail view
  const [selectedListing, setSelectedListing] = useState<{ id: number; data: ListingData } | null>(null);

  // Dispute resolve
  const [buyerWins, setBuyerWins] = useState(true);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const loadActiveListings = useCallback(async () => {
    setIsLoadingListings(true);
    setError(null);
    try {
      const ids = await getActiveListings();
      const items: { id: number; data: ListingData }[] = [];
      for (const id of ids as unknown as number[]) {
        const listing = await getListing(id);
        if (listing && typeof listing === "object") {
          const mapped = listing as Record<string, unknown>;
          items.push({
            id,
            data: {
              title: String(mapped.title || ""),
              description: String(mapped.description || ""),
              price: String(mapped.price || "0"),
              seller: String(mapped.seller || ""),
              buyer: mapped.buyer ? String(mapped.buyer) : null,
              status: (String(mapped.status || "Active") as ListingStatus) || "Active",
              dispute_reason: mapped.dispute_reason ? String(mapped.dispute_reason) : null,
            },
          });
        }
      }
      setListings(items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load listings");
    } finally {
      setIsLoadingListings(false);
    }
  }, []);

  const loadMyListings = useCallback(async () => {
    if (!walletAddress) return;
    setIsLoadingListings(true);
    setError(null);
    try {
      const ids = await getSellerListings(walletAddress);
      const items: { id: number; data: ListingData }[] = [];
      for (const id of ids as unknown as number[]) {
        const listing = await getListing(id);
        if (listing && typeof listing === "object") {
          const mapped = listing as Record<string, unknown>;
          items.push({
            id,
            data: {
              title: String(mapped.title || ""),
              description: String(mapped.description || ""),
              price: String(mapped.price || "0"),
              seller: String(mapped.seller || ""),
              buyer: mapped.buyer ? String(mapped.buyer) : null,
              status: (String(mapped.status || "Active") as ListingStatus) || "Active",
              dispute_reason: mapped.dispute_reason ? String(mapped.dispute_reason) : null,
            },
          });
        }
      }
      setListings(items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load listings");
    } finally {
      setIsLoadingListings(false);
    }
  }, [walletAddress]);

  const loadMyPurchases = useCallback(async () => {
    if (!walletAddress) return;
    setIsLoadingListings(true);
    setError(null);
    try {
      const ids = await getBuyerListings(walletAddress);
      const items: { id: number; data: ListingData }[] = [];
      for (const id of ids as unknown as number[]) {
        const listing = await getListing(id);
        if (listing && typeof listing === "object") {
          const mapped = listing as Record<string, unknown>;
          items.push({
            id,
            data: {
              title: String(mapped.title || ""),
              description: String(mapped.description || ""),
              price: String(mapped.price || "0"),
              seller: String(mapped.seller || ""),
              buyer: mapped.buyer ? String(mapped.buyer) : null,
              status: (String(mapped.status || "Active") as ListingStatus) || "Active",
              dispute_reason: mapped.dispute_reason ? String(mapped.dispute_reason) : null,
            },
          });
        }
      }
      setListings(items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load listings");
    } finally {
      setIsLoadingListings(false);
    }
  }, [walletAddress]);

  const handleCreateListing = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!title.trim() || !description.trim() || !price.trim()) return setError("Fill in all fields");
    setError(null);
    setIsCreating(true);
    setTxStatus("Awaiting signature...");
    try {
      const priceBigInt = BigInt(price);
      await createListing(walletAddress, title.trim(), description.trim(), priceBigInt);
      setTxStatus("Listing created on-chain!");
      setTitle("");
      setDescription("");
      setPrice("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsCreating(false);
    }
  }, [walletAddress, title, description, price]);

  const handleBuyItem = useCallback(async (listingId: number) => {
    if (!walletAddress) return setError("Connect wallet first");
    setError(null);
    setTxStatus("Awaiting signature...");
    try {
      await buyItem(walletAddress, listingId);
      setTxStatus("Item purchased! Awaiting delivery.");
      setSelectedListing(null);
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    }
  }, [walletAddress]);

  const handleCancelListing = useCallback(async (listingId: number) => {
    if (!walletAddress) return setError("Connect wallet first");
    setError(null);
    setTxStatus("Awaiting signature...");
    try {
      await cancelListing(walletAddress, listingId);
      setTxStatus("Listing cancelled.");
      setSelectedListing(null);
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    }
  }, [walletAddress]);

  const handleConfirmDelivery = useCallback(async (listingId: number) => {
    if (!walletAddress) return setError("Connect wallet first");
    setError(null);
    setTxStatus("Awaiting signature...");
    try {
      await confirmDelivery(walletAddress, listingId);
      setTxStatus("Delivery confirmed! Transaction complete.");
      setSelectedListing(null);
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    }
  }, [walletAddress]);

  const handleRaiseDispute = useCallback(async (listingId: number) => {
    if (!walletAddress) return setError("Connect wallet first");
    setError(null);
    setTxStatus("Awaiting signature...");
    try {
      await raiseDispute(walletAddress, listingId);
      setTxStatus("Dispute raised.");
      setSelectedListing(null);
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    }
  }, [walletAddress]);

  const handleResolveDispute = useCallback(async (listingId: number) => {
    if (!walletAddress) return setError("Connect wallet first");
    setError(null);
    setTxStatus("Awaiting signature...");
    try {
      await resolveDispute(walletAddress, listingId, buyerWins);
      setTxStatus(buyerWins ? "Dispute resolved: Buyer refunded." : "Dispute resolved: Seller wins.");
      setSelectedListing(null);
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    }
  }, [walletAddress, buyerWins]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "browse", label: "Browse", icon: <SearchIcon />, color: "#4fc3f7" },
    { key: "create", label: "Create", icon: <PlusIcon />, color: "#7c6cf0" },
    { key: "my-listings", label: "My Listings", icon: <UserIcon />, color: "#fbbf24" },
    { key: "my-purchases", label: "My Purchases", icon: <ShoppingCartIcon />, color: "#34d399" },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("on-chain") || txStatus.includes("confirmed") || txStatus.includes("complete") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c6cf0]/20 to-[#4fc3f7]/20 border border-white/[0.06]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7c6cf0]">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">Marketplace</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="info" className="text-[10px]">Soroban</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => {
                  setActiveTab(t.key);
                  setError(null);
                  setSelectedListing(null);
                  if (t.key === "browse") loadActiveListings();
                  else if (t.key === "my-listings") loadMyListings();
                  else if (t.key === "my-purchases") loadMyPurchases();
                }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Browse */}
            {activeTab === "browse" && !selectedListing && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <MethodSignature name="get_active_listings" params="() -> Vec<u64>" color="#4fc3f7" />
                  <button onClick={loadActiveListings} disabled={isLoadingListings} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
                    <RefreshIcon /> Refresh
                  </button>
                </div>

                {isLoadingListings ? (
                  <div className="flex items-center justify-center py-8">
                    <SpinnerIcon />
                    <span className="ml-2 text-sm text-white/40">Loading listings...</span>
                  </div>
                ) : listings.length === 0 ? (
                  <div className="text-center py-8 text-white/30 text-sm">No active listings</div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {listings.map((item) => {
                      const cfg = STATUS_CONFIG[item.data.status];
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedListing(item)}
                          className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left hover:border-white/[0.1] transition-all"
                        >
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-white/80 truncate">{item.data.title}</span>
                                <Badge variant={cfg.variant}><span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />{item.data.status}</Badge>
                              </div>
                              <p className="text-xs text-white/30 mt-1 truncate">{item.data.description}</p>
                              <p className="text-[10px] text-white/20 mt-1 font-mono">Seller: {truncate(item.data.seller)}</p>
                            </div>
                            <span className="text-[#34d399] font-mono text-sm ml-3">{item.data.price} XLM</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Create Listing */}
            {activeTab === "create" && (
              <div className="space-y-5">
                <MethodSignature name="create_listing" params="(seller, title, description, price)" returns="-> u64" color="#7c6cf0" />
                <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Vintage Watch" />
                <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your item..." />
                <Input label="Price (in XLM stroops)" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 100000000 (1 XLM)" type="number" />
                {walletAddress ? (
                  <ShimmerButton onClick={handleCreateListing} disabled={isCreating} shimmerColor="#7c6cf0" className="w-full">
                    {isCreating ? <><SpinnerIcon /> Creating...</> : <><PlusIcon /> Create Listing</>}
                  </ShimmerButton>
                ) : (
                  <button onClick={onConnect} disabled={isConnecting} className="w-full rounded-xl border border-dashed border-[#7c6cf0]/20 bg-[#7c6cf0]/[0.03] py-4 text-sm text-[#7c6cf0]/60 hover:border-[#7c6cf0]/30 hover:text-[#7c6cf0]/80 active:scale-[0.99] transition-all disabled:opacity-50">
                    Connect wallet to create listing
                  </button>
                )}
              </div>
            )}

            {/* My Listings */}
            {activeTab === "my-listings" && !selectedListing && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <MethodSignature name="get_seller_listings" params="(seller: Address)" color="#fbbf24" />
                  {walletAddress && (
                    <button onClick={loadMyListings} disabled={isLoadingListings} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
                      <RefreshIcon /> Refresh
                    </button>
                  )}
                </div>
                {!walletAddress ? (
                  <button onClick={onConnect} disabled={isConnecting} className="w-full rounded-xl border border-dashed border-[#fbbf24]/20 bg-[#fbbf24]/[0.03] py-4 text-sm text-[#fbbf24]/60 hover:border-[#fbbf24]/30 hover:text-[#fbbf24]/80 active:scale-[0.99] transition-all disabled:opacity-50">
                    Connect wallet to view your listings
                  </button>
                ) : isLoadingListings ? (
                  <div className="flex items-center justify-center py-8"><SpinnerIcon /><span className="ml-2 text-sm text-white/40">Loading...</span></div>
                ) : listings.length === 0 ? (
                  <div className="text-center py-8 text-white/30 text-sm">No listings found</div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {listings.map((item) => {
                      const cfg = STATUS_CONFIG[item.data.status];
                      return (
                        <button key={item.id} onClick={() => setSelectedListing(item)} className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left hover:border-white/[0.1] transition-all">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-white/80 truncate">{item.data.title}</span>
                                <Badge variant={cfg.variant}><span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />{item.data.status}</Badge>
                              </div>
                              <p className="text-xs text-white/30 mt-1 truncate">{item.data.description}</p>
                              {item.data.buyer && <p className="text-[10px] text-[#7c6cf0] mt-1 font-mono">Buyer: {truncate(item.data.buyer)}</p>}
                            </div>
                            <span className="text-[#34d399] font-mono text-sm ml-3">{item.data.price} XLM</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* My Purchases */}
            {activeTab === "my-purchases" && !selectedListing && (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <MethodSignature name="get_buyer_listings" params="(buyer: Address)" color="#34d399" />
                  {walletAddress && (
                    <button onClick={loadMyPurchases} disabled={isLoadingListings} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors">
                      <RefreshIcon /> Refresh
                    </button>
                  )}
                </div>
                {!walletAddress ? (
                  <button onClick={onConnect} disabled={isConnecting} className="w-full rounded-xl border border-dashed border-[#34d399]/20 bg-[#34d399]/[0.03] py-4 text-sm text-[#34d399]/60 hover:border-[#34d399]/30 hover:text-[#34d399]/80 active:scale-[0.99] transition-all disabled:opacity-50">
                    Connect wallet to view your purchases
                  </button>
                ) : isLoadingListings ? (
                  <div className="flex items-center justify-center py-8"><SpinnerIcon /><span className="ml-2 text-sm text-white/40">Loading...</span></div>
                ) : listings.length === 0 ? (
                  <div className="text-center py-8 text-white/30 text-sm">No purchases found</div>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {listings.map((item) => {
                      const cfg = STATUS_CONFIG[item.data.status];
                      return (
                        <button key={item.id} onClick={() => setSelectedListing(item)} className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left hover:border-white/[0.1] transition-all">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm text-white/80 truncate">{item.data.title}</span>
                                <Badge variant={cfg.variant}><span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />{item.data.status}</Badge>
                              </div>
                              <p className="text-xs text-white/30 mt-1 truncate">{item.data.description}</p>
                              <p className="text-[10px] text-white/20 mt-1 font-mono">Seller: {truncate(item.data.seller)}</p>
                            </div>
                            <span className="text-[#34d399] font-mono text-sm ml-3">{item.data.price} XLM</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Listing Detail */}
            {selectedListing && (
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedListing(null)} className="text-white/30 hover:text-white/60 transition-colors"><XIcon /></button>
                  <span className="text-sm text-white/50 font-mono">Listing #{selectedListing.id}</span>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="flex items-start justify-between mb-4">
                    <h4 className="text-lg font-semibold text-white/90">{selectedListing.data.title}</h4>
                    {(() => { const cfg = STATUS_CONFIG[selectedListing.data.status]; return <Badge variant={cfg.variant}><span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />{selectedListing.data.status}</Badge>; })()}
                  </div>
                  <p className="text-sm text-white/50 mb-4">{selectedListing.data.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/30">Price</span>
                    <span className="text-[#34d399] font-mono font-semibold">{selectedListing.data.price} XLM</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-white/30">Seller</span>
                    <span className="text-white/60 font-mono text-xs">{selectedListing.data.seller}</span>
                  </div>
                  {selectedListing.data.buyer && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-white/30">Buyer</span>
                      <span className="text-[#7c6cf0] font-mono text-xs">{selectedListing.data.buyer}</span>
                    </div>
                  )}
                  {selectedListing.data.dispute_reason && (
                    <div className="mt-3 rounded-lg bg-[#fbbf24]/5 border border-[#fbbf24]/20 p-3">
                      <p className="text-[10px] text-[#fbbf24]/60 uppercase tracking-wider">Dispute Reason</p>
                      <p className="text-xs text-[#fbbf24]/80 mt-1">{selectedListing.data.dispute_reason}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  {/* Can buy: Active, wallet != seller, no buyer */}
                  {selectedListing.data.status === "Active" && walletAddress && walletAddress !== selectedListing.data.seller && (
                    <ShimmerButton onClick={() => handleBuyItem(selectedListing.id)} shimmerColor="#34d399" className="w-full">
                      <ShoppingCartIcon /> Buy Item
                    </ShimmerButton>
                  )}

                  {/* Can cancel: Active, wallet == seller */}
                  {selectedListing.data.status === "Active" && walletAddress === selectedListing.data.seller && (
                    <ShimmerButton onClick={() => handleCancelListing(selectedListing.id)} shimmerColor="#fbbf24" className="w-full">
                      <XIcon /> Cancel Listing
                    </ShimmerButton>
                  )}

                  {/* Can confirm: Sold, wallet == buyer */}
                  {selectedListing.data.status === "Sold" && walletAddress === selectedListing.data.buyer && (
                    <ShimmerButton onClick={() => handleConfirmDelivery(selectedListing.id)} shimmerColor="#34d399" className="w-full">
                      <CheckIcon /> Confirm Delivery
                    </ShimmerButton>
                  )}

                  {/* Can dispute: Sold, wallet == buyer or seller */}
                  {selectedListing.data.status === "Sold" && walletAddress && (walletAddress === selectedListing.data.buyer || walletAddress === selectedListing.data.seller) && (
                    <ShimmerButton onClick={() => handleRaiseDispute(selectedListing.id)} shimmerColor="#fbbf24" className="w-full">
                      <FlagIcon /> Raise Dispute
                    </ShimmerButton>
                  )}

                  {/* Can resolve: Disputed, wallet == buyer or seller */}
                  {selectedListing.data.status === "Disputed" && walletAddress && (walletAddress === selectedListing.data.buyer || walletAddress === selectedListing.data.seller) && (
                    <div className="space-y-3">
                      <p className="text-[11px] text-white/40 uppercase tracking-wider">Resolve Dispute</p>
                      <div className="flex gap-2">
                        <button onClick={() => setBuyerWins(true)} className={cn("flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all", buyerWins ? "border-[#f87171]/30 bg-[#f87171]/10 text-[#f87171]" : "border-white/[0.06] bg-white/[0.02] text-white/35")}>
                          Buyer Refunded
                        </button>
                        <button onClick={() => setBuyerWins(false)} className={cn("flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all", !buyerWins ? "border-[#34d399]/30 bg-[#34d399]/10 text-[#34d399]" : "border-white/[0.06] bg-white/[0.02] text-white/35")}>
                          Seller Wins
                        </button>
                      </div>
                      <ShimmerButton onClick={() => handleResolveDispute(selectedListing.id)} shimmerColor="#7c6cf0" className="w-full">
                        <ScaleIcon /> Resolve Dispute
                      </ShimmerButton>
                    </div>
                  )}

                  {!walletAddress && (
                    <button onClick={onConnect} disabled={isConnecting} className="w-full rounded-xl border border-dashed border-white/10 bg-white/[0.02] py-4 text-sm text-white/40 hover:border-white/20 hover:text-white/60 active:scale-[0.99] transition-all disabled:opacity-50">
                      Connect wallet to interact
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">Marketplace &middot; Soroban</p>
            <div className="flex items-center gap-2">
              {(["Active", "Sold", "Delivered"] as ListingStatus[]).map((s, i) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className={cn("h-1 w-1 rounded-full", STATUS_CONFIG[s]?.dot ?? "bg-white/20")} />
                  <span className="font-mono text-[9px] text-white/15">{s}</span>
                  {i < 2 && <span className="text-white/10 text-[8px]">&rarr;</span>}
                </span>
              ))}
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}
