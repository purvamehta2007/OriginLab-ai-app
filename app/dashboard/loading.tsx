import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function DashboardLoading() {
  return (
    <div className="space-y-8 p-8">
      {/* Header skeleton */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-4 w-52" />
        </div>
        <Skeleton className="h-11 w-40 rounded-md" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-9 w-12 mb-1" />
              <Skeleton className="h-3 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Experiments section skeleton */}
      <div>
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="w-6 h-6 rounded" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-5 w-20 rounded-full" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-9 w-full rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
