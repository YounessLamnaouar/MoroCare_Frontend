import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
  } from "@/components/ui/card";
  import {
    Table,
    TableHeader,
    TableRow,
    TableHead,
    TableBody,
    TableCell,
  } from "@/components/ui/table";
  import { Button } from "@/components/ui/button";
  import {
    CheckCircle2,
    PackageCheck,
    Truck,
    XCircle,
    AlertCircle,
  } from "lucide-react";
  import { useState } from "react";
  
  export default function OrdersAdmin() {
    const [orders, setOrders] = useState([
      {
        id: 501,
        patient: "Imane A.",
        date: "2025-06-21",
        total: "240.00 MAD",
        status: "Pending",
      },
      {
        id: 502,
        patient: "Karim H.",
        date: "2025-06-22",
        total: "132.50 MAD",
        status: "Confirmed",
      },
      {
        id: 503,
        patient: "Soukaina T.",
        date: "2025-06-23",
        total: "89.00 MAD",
        status: "Shipped",
      },
      {
        id: 504,
        patient: "Yassine M.",
        date: "2025-06-24",
        total: "170.00 MAD",
        status: "Canceled",
      },
    ]);
  
    const getStatusColor = (status) => {
      switch (status) {
        case "Pending":
          return "bg-yellow-200 text-yellow-800";
        case "Confirmed":
          return "bg-blue-100 text-blue-800";
        case "Shipped":
          return "bg-purple-200 text-purple-800";
        case "Delivered":
          return "bg-green-200 text-green-800";
        case "Canceled":
          return "bg-red-200 text-red-800";
        default:
          return "bg-gray-200 text-gray-800";
      }
    };
  
    const updateStatus = (id, newStatus) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, status: newStatus } : order
        )
      );
    };
  
    return (
      <section className="space-y-6">
        <div className="bg-gradient-to-r from-[#155B5F]/10 to-[#96C1B9]/10 border border-[#155B5F]/20 p-6 mb-8 rounded-lg shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="bg-[#155B5F]/10 p-2 rounded-full">
              <AlertCircle className="h-6 w-6 text-[#155B5F]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-[#155B5F]">Coming Soon!</h3>
              <p className="text-[#155B5F]/80 leading-relaxed">
                This orders management system is currently under development. The data shown below is for demonstration purposes only.
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-[#155B5F] mb-6">📦 Medication Orders</h1>
  
        <Card className="border-[#96C1B9] shadow-sm">
          <CardHeader>
            <CardTitle>All Orders</CardTitle>
          </CardHeader>
  
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.patient}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>{order.total}</TableCell>
                    <TableCell>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </TableCell>
                    <TableCell className="flex justify-end gap-2">
                      {order.status === "Pending" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => updateStatus(order.id, "Confirmed")}
                          >
                            <CheckCircle2 size={16} className="mr-1" />
                            Confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatus(order.id, "Canceled")}
                          >
                            <XCircle size={16} className="mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
  
                      {order.status === "Confirmed" && (
                        <>
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                            onClick={() => updateStatus(order.id, "Shipped")}
                          >
                            <Truck size={16} className="mr-1" />
                            Ship
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatus(order.id, "Canceled")}
                          >
                            <XCircle size={16} className="mr-1" />
                            Cancel
                          </Button>
                        </>
                      )}
  
                      {order.status === "Shipped" && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => updateStatus(order.id, "Delivered")}
                        >
                          <PackageCheck size={16} className="mr-1" />
                          Delivered
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    );
  }
  