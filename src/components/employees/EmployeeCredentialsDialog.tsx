import { useState } from "react";
import { Copy, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface EmployeeCredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  credentials: {
    name: string;
    email: string;
    tempPassword: string;
    emailSent: boolean;
  } | null;
}

export function EmployeeCredentialsDialog({
  open,
  onOpenChange,
  credentials,
}: EmployeeCredentialsDialogProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!credentials) return null;

  const credentialsText = `Employee: ${credentials.name}
Email: ${credentials.email}
Temporary Password: ${credentials.tempPassword}

Please change your password after first login.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(credentialsText);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Credentials copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "Please copy manually",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Employee Created Successfully
          </DialogTitle>
          <DialogDescription>
            {credentials.emailSent
              ? "A welcome email has been sent to the employee."
              : "Please share these credentials securely with the employee."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!credentials.emailSent && (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p className="text-sm">
                Email could not be sent. Please copy and share these credentials securely.
              </p>
            </div>
          )}

          <div className="rounded-md border bg-muted/50 p-4 font-mono text-sm">
            <div className="space-y-2">
              <div>
                <span className="text-muted-foreground">Name: </span>
                <span className="font-medium">{credentials.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email: </span>
                <span className="font-medium">{credentials.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Temporary Password: </span>
                <span className="font-medium text-primary">{credentials.tempPassword}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Credentials
              </>
            )}
          </Button>
          <Button className="w-full sm:w-auto" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
