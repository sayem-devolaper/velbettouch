import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  claimAdmin,
  deleteOrder,
  listOrders,
  setOrderStatus,
  updateOrder,
} from "@/lib/admin.functions";
import { AREA_LABEL, PRODUCT, type DeliveryArea } from "@/lib/product";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "অর্ডার ড্যাশবোর্ড | ম্যাজিক টিস্যু" },
      {
        name: "description",
        content: "সব অর্ডার দেখুন, স্ট্যাটাস বদলান, তথ্য এডিট করুন বা অর্ডার ক্যানসেল করুন।",
      },
      { property: "og:title", content: "অর্ডার ড্যাশবোর্ড | ম্যাজিক টিস্যু" },
      { property: "og:description", content: "অর্ডার দেখা, এডিট ও ক্যানসেল করার ড্যাশবোর্ড।" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

const STATUS_LABEL: Record<string, string> = {
  pending: "নতুন",
  confirmed: "কনফার্ম",
  shipped: "কুরিয়ারে",
  delivered: "ডেলিভারি হয়েছে",
  cancelled: "ক্যানসেল",
};
const STATUSES = Object.keys(STATUS_LABEL);

type OrderRow = {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  delivery_area: string;
  quantity: number;
  total: number;
  delivery_charge: number;
  status: string;
  note: string | null;
  created_at: string;
  utm_source: string | null;
  utm_campaign: string | null;
};

function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fetchOrders = useServerFn(listOrders);
  const saveOrder = useServerFn(updateOrder);
  const changeStatus = useServerFn(setOrderStatus);
  const removeOrder = useServerFn(deleteOrder);
  const claim = useServerFn(claimAdmin);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editing, setEditing] = useState<OrderRow | null>(null);

  const ordersQuery = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      // A brand-new store has no admin yet: the first signed-in user claims it.
      // Runs before the fetch so a fresh store never sees a "Forbidden" error.
      await claim({ data: undefined }).catch(() => undefined);
      return (await fetchOrders({ data: undefined })) as OrderRow[];
    },
    retry: false,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-orders"] });

  const statusMutation = useMutation({
    mutationFn: (vars: { id: string; status: string }) =>
      changeStatus({ data: vars as { id: string; status: never } }),
    onSuccess: () => {
      toast.success("স্ট্যাটাস আপডেট হয়েছে");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveMutation = useMutation({
    mutationFn: (vars: Record<string, unknown>) => saveOrder({ data: vars as never }),
    onSuccess: () => {
      toast.success("অর্ডার সেভ হয়েছে");
      setEditing(null);
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (vars: { id: string }) => removeOrder({ data: vars }),
    onSuccess: () => {
      toast.success("অর্ডার ডিলিট হয়েছে");
      invalidate();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  const orders = ordersQuery.data ?? [];
  const filtered = orders.filter((o) => {
    const q = search.trim().toLowerCase();
    const matchQ =
      !q ||
      o.phone.includes(q) ||
      o.customer_name.toLowerCase().includes(q) ||
      o.id.toLowerCase().startsWith(q);
    return matchQ && (statusFilter === "all" || o.status === statusFilter);
  });

  const revenue = filtered
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <main className="min-h-screen bg-surface px-4 py-6">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">অর্ডার ড্যাশবোর্ড</h1>
            <p className="text-sm text-muted-foreground">
              মোট {filtered.length} টি অর্ডার · আয় ৳{revenue}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/ads">অ্যাডস সেটআপ</Link>
            </Button>
            <Button variant="outline" onClick={() => ordersQuery.refetch()}>
              রিফ্রেশ
            </Button>
            <Button variant="outline" onClick={signOut}>
              লগআউট
            </Button>
          </div>
        </header>

        <div className="mt-4 flex flex-wrap gap-2">
          <Input
            placeholder="নাম, মোবাইল বা অর্ডার আইডি দিয়ে খুঁজুন"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs bg-background"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">সব স্ট্যাটাস</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </div>

        {ordersQuery.isLoading && <p className="mt-8 text-sm">লোড হচ্ছে...</p>}
        {ordersQuery.isError && (
          <p className="mt-8 text-sm text-primary">
            অর্ডার দেখা যাচ্ছে না। আপনার অ্যাকাউন্টে অ্যাডমিন পারমিশন আছে কিনা দেখুন।
          </p>
        )}

        <div className="mt-4 space-y-3">
          {filtered.map((o) => (
            <article
              key={o.id}
              className="rounded-xl border border-border bg-background p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-bold">
                    {o.customer_name}{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </span>
                  </p>
                  <a href={`tel:+88${o.phone}`} className="text-sm text-primary">
                    {o.phone}
                  </a>
                  <p className="mt-1 text-sm text-muted-foreground">{o.address}</p>
                  <p className="mt-1 text-sm">
                    {AREA_LABEL[o.delivery_area as DeliveryArea] ?? o.delivery_area} · পরিমাণ{" "}
                    {o.quantity} · মোট <strong>৳{o.total}</strong>
                  </p>
                  {o.note && <p className="mt-1 text-sm text-muted-foreground">নোট: {o.note}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString("bn-BD")}
                    {o.utm_source ? ` · সোর্স: ${o.utm_source}` : ""}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <select
                    value={o.status}
                    onChange={(e) => statusMutation.mutate({ id: o.id, status: e.target.value })}
                    className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(o)}>
                      এডিট
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={o.status === "cancelled"}
                      onClick={() => statusMutation.mutate({ id: o.id, status: "cancelled" })}
                    >
                      ক্যানসেল
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm("অর্ডারটি স্থায়ীভাবে ডিলিট করবেন?")) {
                          deleteMutation.mutate({ id: o.id });
                        }
                      }}
                    >
                      ডিলিট
                    </Button>
                  </div>
                </div>
              </div>
            </article>
          ))}
          {!ordersQuery.isLoading && filtered.length === 0 && (
            <p className="text-sm text-muted-foreground">কোনো অর্ডার পাওয়া যায়নি।</p>
          )}
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/50 p-0 sm:items-center sm:p-4">
          <form
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-background p-5 sm:rounded-2xl"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              saveMutation.mutate({
                id: editing.id,
                customer_name: String(fd.get("customer_name")),
                phone: String(fd.get("phone")),
                address: String(fd.get("address")),
                delivery_area: String(fd.get("delivery_area")),
                quantity: Number(fd.get("quantity")),
                status: String(fd.get("status")),
                note: String(fd.get("note") ?? ""),
              });
            }}
          >
            <h2 className="text-lg font-bold">অর্ডার এডিট</h2>
            <div className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="e-name">নাম</Label>
                <Input id="e-name" name="customer_name" defaultValue={editing.customer_name} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="e-phone">মোবাইল</Label>
                <Input id="e-phone" name="phone" defaultValue={editing.phone} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="e-address">ঠিকানা</Label>
                <Textarea id="e-address" name="address" defaultValue={editing.address} rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="e-area">ডেলিভারি এলাকা</Label>
                  <select
                    id="e-area"
                    name="delivery_area"
                    defaultValue={editing.delivery_area}
                    className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
                  >
                    {(Object.keys(PRODUCT.delivery) as DeliveryArea[]).map((a) => (
                      <option key={a} value={a}>
                        {AREA_LABEL[a]}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="e-qty">পরিমাণ</Label>
                  <Input
                    id="e-qty"
                    name="quantity"
                    type="number"
                    min={1}
                    max={50}
                    defaultValue={editing.quantity}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="e-status">স্ট্যাটাস</Label>
                <select
                  id="e-status"
                  name="status"
                  defaultValue={editing.status}
                  className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="e-note">নোট</Label>
                <Input id="e-note" name="note" defaultValue={editing.note ?? ""} />
              </div>
            </div>
            <div className="mt-5 flex gap-2">
              <Button type="submit" className="flex-1" disabled={saveMutation.isPending}>
                সেভ করুন
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                বাতিল
              </Button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}