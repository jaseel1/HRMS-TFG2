import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import { format } from "date-fns";
import { FileText, Search, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const ACTION_COLORS: Record<string, string> = {
  INSERT: "bg-green-500/10 text-green-700 dark:text-green-400",
  UPDATE: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  DELETE: "bg-red-500/10 text-red-700 dark:text-red-400",
};

export function AuditLogViewer() {
  const { data: logs, isLoading, refetch, isRefetching } = useAuditLogs(100);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = logs?.filter((log) => {
    const query = searchQuery.toLowerCase();
    return (
      log.table_name.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      log.user_email?.toLowerCase().includes(query)
    );
  });

  const formatTableName = (name: string) => {
    return name
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Audit Log
            </CardTitle>
            <CardDescription>
              View all system changes and user actions
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by table, action, or user..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filteredLogs?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No audit logs found
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Table</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs?.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-mono text-sm">
                      {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      {log.user_email || (
                        <span className="text-muted-foreground">System</span>
                      )}
                    </TableCell>
                    <TableCell>{formatTableName(log.table_name)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={ACTION_COLORS[log.action] || ""}
                      >
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Audit Log Details</DialogTitle>
                            <DialogDescription>
                              {log.action} on {formatTableName(log.table_name)} at{" "}
                              {format(new Date(log.created_at), "PPpp")}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <p className="text-sm font-medium mb-1">User</p>
                              <p className="text-sm text-muted-foreground">
                                {log.user_email || "System"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium mb-1">Record ID</p>
                              <p className="text-sm text-muted-foreground font-mono">
                                {log.record_id || "N/A"}
                              </p>
                            </div>
                            {log.old_values && (
                              <div>
                                <p className="text-sm font-medium mb-1">Previous Values</p>
                                <ScrollArea className="h-32 rounded-md border p-2">
                                  <pre className="text-xs">
                                    {JSON.stringify(log.old_values, null, 2)}
                                  </pre>
                                </ScrollArea>
                              </div>
                            )}
                            {log.new_values && (
                              <div>
                                <p className="text-sm font-medium mb-1">New Values</p>
                                <ScrollArea className="h-32 rounded-md border p-2">
                                  <pre className="text-xs">
                                    {JSON.stringify(log.new_values, null, 2)}
                                  </pre>
                                </ScrollArea>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
