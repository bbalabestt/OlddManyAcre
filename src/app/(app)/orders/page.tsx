
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Truck, Clock, TrendingUp } from "lucide-react";
import { getOrders } from "@/lib/data";
import type { Order, OrderStatus, ServiceType } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Orders — Widing" };

const STATUS_STYLES: Record<OrderStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  Draft:          { label: "Draft",           variant: "secondary" },
  Pending:        { label: "Pending",         variant: "outline" },
  Confirmed:      { label: "Confirmed",       variant: "default" },
  Active:         { label: "Active",          variant: "default" },
  AwaitingReturn: { label: "Awaiting Return", variant: "outline" },
  Completed:      { label: "Completed",       variant: "secondary" },
  Cancelled:      { label: "Cancelled",       variant: "destructive" },
};

const SERVICE_TYPE_STYLES: Record<ServiceType, { icon: React.ReactNode; label: string; labelTH: string }> = {
  Storage:  { icon: <Package className="h-3 w-3" />, label: "Storage",  labelTH: "ฝากของ" },
  Delivery: { icon: <Truck className="h-3 w-3" />,   label: "Delivery", labelTH: "ขนส่ง" },
};

export default function OrdersPage() {
  const orders = getOrders();

  const stats = {
    total:    orders.length,
    active:   orders.filter(o => o.status === "Active").length,
    pending:  orders.filter(o => o.status === "Pending").length,
    storage:  orders.filter(o => o.serviceType === "Storage").length,
    delivery: orders.filter(o => o.serviceType === "Delivery").length,
    revenue:  orders.filter(o => o.status === "Active").reduce((s, o) => s + (o.monthlyRate ?? 0), 0),
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ออเดอร์ทั้งหมด</h1>
          <p className="text-sm text-muted-foreground">Orders — Storage &amp; Delivery services</p>
        </div>
        <Button asChild>
          <Link href="/orders/new">
            <Plus className="mr-2 h-4 w-4" /> สร้างออเดอร์ใหม่
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm font-medium">ออเดอร์ทั้งหมด</p>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50/50">
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-green-700">{stats.active}</p>
            <p className="text-sm font-medium">กำลังใช้งาน</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-yellow-700">{stats.pending}</p>
            <p className="text-sm font-medium">รอดำเนินการ</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-2xl font-bold text-green-700">
              ฿{stats.revenue.toLocaleString()}
            </p>
            <p className="text-sm font-medium">รายได้/เดือน</p>
            <p className="text-xs text-muted-foreground">Monthly Revenue (Active)</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick type split */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            <CardTitle className="text-base">Storage Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{stats.storage}</span>
            <span className="text-sm text-muted-foreground ml-2">ออเดอร์ฝากของ</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center gap-2">
            <Truck className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-base">Delivery Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{stats.delivery}</span>
            <span className="text-sm text-muted-foreground ml-2">ออเดอร์ขนส่ง</span>
          </CardContent>
        </Card>
      </div>

      {/* Orders table */}
      <Card>
        <CardHeader>
          <CardTitle>รายการออเดอร์</CardTitle>
          <CardDescription>จัดการออเดอร์ฝากของและขนส่งทั้งหมด</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-muted-foreground">
                  <th className="text-left px-4 py-3 font-medium">Order ID</th>
                  <th className="text-left px-4 py-3 font-medium">ลูกค้า</th>
                  <th className="text-left px-4 py-3 font-medium">ประเภท</th>
                  <th className="text-left px-4 py-3 font-medium">รายการ</th>
                  <th className="text-left px-4 py-3 font-medium">ปริมาณ</th>
                  <th className="text-left px-4 py-3 font-medium">วันที่</th>
                  <th className="text-left px-4 py-3 font-medium">สาขา</th>
                  <th className="text-left px-4 py-3 font-medium">สถานะ</th>
                  <th className="text-left px-4 py-3 font-medium">e-Contract</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const svc = SERVICE_TYPE_STYLES[order.serviceType];
                  const sts = STATUS_STYLES[order.status];
                  return (
                    <tr key={order.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold">{order.id}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{order.clientName}</p>
                        <p className="text-xs text-muted-foreground">{order.clientPhone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="flex items-center gap-1 w-fit">
                          {svc.icon} {svc.labelTH}
                        </Badge>
                        {order.storageSubType && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {order.storageSubType === "DocumentBox" ? "📁 กล่องเอกสาร" : "🏠 พื้นที่จัดเก็บ"}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 max-w-[180px]">
                        <p className="truncate text-xs">{order.itemsDescription}</p>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {order.quantity ? `${order.quantity} ${order.quantityUnit ?? ""}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {new Date(order.serviceDate).toLocaleDateString("th-TH", { day:"2-digit", month:"short", year:"2-digit" })}
                      </td>
                      <td className="px-4 py-3 text-xs">{order.branchName ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={sts.variant}>{sts.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {order.eContractStatus ? (
                          <Badge variant={order.eContractStatus === "Signed" ? "default" : order.eContractStatus === "Sent" ? "outline" : "secondary"}>
                            {order.eContractStatus}
                          </Badge>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/orders/${order.id}`}>ดู</Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
