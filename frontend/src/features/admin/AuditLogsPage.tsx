import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { ScrollText, Filter } from 'lucide-react';
import { searchAuditLogs } from '@/api/auditApi';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Loader } from '@/components/shared/Loader';
import { EmptyState } from '@/components/shared/EmptyState';

// §26's audit log viewer. Deliberately dense/tabular rather than
// card-based like every other list page in this app — audit logs are a
// scan-many-rows-quickly interface, not a browse-and-click one; a card
// per entry would waste vertical space for what's fundamentally a table
// of short structured facts.
const ACTION_COLORS: Record<string, string> = {
  MEDICAL_RECORD_LOCKED: 'bg-teal-50 text-teal-600',
  APPOINTMENT_BOOKED: 'bg-sage-50 text-sage-500',
  APPOINTMENT_CANCELLED: 'bg-danger-50 text-danger-700',
  DOCTOR_VERIFIED: 'bg-success-50 text-success-700',
  DOCTOR_REJECTED: 'bg-danger-50 text-danger-700',
  LOGIN: 'bg-cream-200 text-ink-400',
  FILE_UPLOADED: 'bg-lavender-50 text-lavender-400',
  AMENDMENT_SUBMITTED: 'bg-warning-50 text-warning-700',
  AMENDMENT_APPROVED: 'bg-success-50 text-success-700',
  AMENDMENT_REJECTED: 'bg-danger-50 text-danger-700',
};

export default function AuditLogsPage() {
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'audit-logs', actionFilter, entityTypeFilter],
    queryFn: () =>
      searchAuditLogs({
        action: actionFilter || undefined,
        entityType: entityTypeFilter || undefined,
        size: 50,
      }),
  });

  if (isLoading) return <Loader />;

  const logs = data?.content ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-5 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-ink">Audit Logs</h1>
        <p className="text-ink-400 mt-1 text-sm sm:text-base">
          A permanent record of security-relevant actions across the system.
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3 text-sm text-ink-600 font-medium">
          <Filter className="w-4 h-4 shrink-0" />
          <span>Filters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Action"
            placeholder="e.g. MEDICAL_RECORD_LOCKED"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value.toUpperCase())}
          />

          <Input
            label="Entity Type"
            placeholder="e.g. Consultation"
            value={entityTypeFilter}
            onChange={(e) => setEntityTypeFilter(e.target.value)}
          />
        </div>
      </Card>

      {/* Results */}
      {logs.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          message="No matching audit entries"
          subtext="Try adjusting your filters."
        />
      ) : (
        <Card className="overflow-hidden">
          {/* 
            Keep the audit log as a table on mobile, but allow the table
            itself to scroll horizontally instead of squeezing columns.
          */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-line bg-cream-100/60 text-left">
                  <th className="px-4 py-3 font-medium text-ink-400 whitespace-nowrap">
                    When
                  </th>

                  <th className="px-4 py-3 font-medium text-ink-400 whitespace-nowrap">
                    Action
                  </th>

                  <th className="px-4 py-3 font-medium text-ink-400 hidden sm:table-cell whitespace-nowrap">
                    Entity
                  </th>

                  <th className="px-4 py-3 font-medium text-ink-400 hidden sm:table-cell whitespace-nowrap">
                    User
                  </th>

                  <th className="px-4 py-3 font-medium text-ink-400 hidden md:table-cell">
                    Details
                  </th>
                </tr>
              </thead>

              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-line last:border-0 hover:bg-cream-100/40"
                  >
                    {/* When */}
                    <td className="px-4 py-3 text-ink-400 whitespace-nowrap">
                      {format(parseISO(log.createdAt), 'MMM d, HH:mm')}
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${
                          ACTION_COLORS[log.action] ??
                          'bg-cream-200 text-ink-600'
                        }`}
                      >
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>

                    {/* Entity */}
                    <td className="px-4 py-3 text-ink-600 hidden sm:table-cell whitespace-nowrap">
                      {log.entityType
                        ? `${log.entityType} #${log.entityId}`
                        : '—'}
                    </td>

                    {/* User */}
                    <td className="px-4 py-3 text-ink-600 hidden sm:table-cell whitespace-nowrap">
                      {log.userId ? `User #${log.userId}` : '—'}{' '}
                      <span className="text-ink-400">
                        ({log.role ?? 'unknown'})
                      </span>
                    </td>

                    {/* Details */}
                    <td
                      className="px-4 py-3 text-ink-400 max-w-xs truncate hidden md:table-cell"
                      title={log.details ?? ''}
                    >
                      {log.details ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}