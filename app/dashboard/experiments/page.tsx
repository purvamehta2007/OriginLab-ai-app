'use client';

import { Button } from '@/components/ui/button';
import { Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { ExperimentsGrid } from '@/components/experiments-grid';

export default function ExperimentsPage() {
  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-foreground">My Experiments</h1>
          </div>
          <p className="text-muted-foreground">View and manage all your scientific experiments</p>
        </div>
        <Link href="/dashboard/experiment/new">
          <Button className="gap-2" size="lg">
            <Plus className="w-5 h-5" />
            New Experiment
          </Button>
        </Link>
      </div>

      {/* Grid */}
      <ExperimentsGrid />
    </div>
  );
}
