import { Card, CardContent } from "@/components/ui/card"
import { Package, RotateCcw, Building, Wallet, FileText } from "lucide-react"

interface DashboardStatsProps {
  stats: {
    revenue: number | null
    orders: number | null
    returns: number | null
    products: number | null
    categories: number | null
  }
}

const DashboardStats = ({ stats }: DashboardStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Revenue - Non-clickable */}
      <Card className="bg-teal-600 border-teal-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-teal-100">Total Revenue</h3>
            <div className="p-2 rounded-md bg-amber-500/10 text-amber-500/20">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold">₹{stats.revenue?.toLocaleString() || 0}</div>
          <p className="text-xs text-teal-200 mt-1">Revenue generated today</p>
        </CardContent>
      </Card>

      {/* Total Orders */}
      <Card className="bg-blue-600 border-blue-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-blue-100">Total Orders</h3>
            <div className="p-2 rounded-md bg-sky-500/10 text-sky-500 border-sky-500/20">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold">{stats.orders?.toLocaleString() || 0}</div>
          <p className="text-xs text-blue-200 mt-1">Orders placed today</p>
        </CardContent>
      </Card>

      {/* Total Returns */}
      <Card className="bg-orange-600 border-orange-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-orange-100">Total Returns</h3>
            <div className="p-2 rounded-md bg-orange-500/10 text-orange-500 border-orange-500/20">
              <RotateCcw className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold">{stats.returns?.toLocaleString() || 0}</div>
          <p className="text-xs text-orange-200 mt-1">Returns processed today</p>
        </CardContent>
      </Card>

      {/* Total Products */}
      <Card className="bg-purple-600 border-purple-600">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-purple-100">Total Products</h3>
            <div className="p-2 rounded-md bg-violet-500/10 text-violet-500 border-violet-500/20">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold">{stats.products?.toLocaleString() || 0}</div>
          <p className="text-xs text-purple-200 mt-1">Products available</p>
        </CardContent>
      </Card>

      {/* Total Categories */}
      <Card className="bg-gray-700 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-100">Total Categories</h3>
            <div className="p-2 rounded-md bg-zinc-500/10 text-zinc-500 border-zinc-500/20">
              <Building className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold">{stats.categories?.toLocaleString() || 0}</div>
          <p className="text-xs text-gray-200 mt-1">Active categories</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default DashboardStats
