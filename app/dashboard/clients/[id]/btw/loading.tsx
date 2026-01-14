import { DashboardHeader } from "@/components/dashboard-header"
import { Breadcrumbs } from "@/components/breadcrumbs"
import { BTWCalculationSkeleton } from "@/components/loading-skeletons"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: "Klanten", href: "/dashboard" }, { label: "BTW Aangifte" }]} />
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <Card className="mb-6">
          <CardContent className="p-4">
            <Skeleton className="h-10 w-48" />
          </CardContent>
        </Card>
        <BTWCalculationSkeleton />
      </main>
    </div>
  )
}
