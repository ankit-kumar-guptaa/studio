'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Briefcase, User } from "lucide-react";

interface RoleSelectionDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onRoleSelect: (role: 'job-seeker' | 'employer') => void;
}

export function RoleSelectionDialog({ isOpen, onOpenChange, onRoleSelect }: RoleSelectionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>One last step!</DialogTitle>
          <DialogDescription>
            To personalize your experience, please tell us who you are.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
          <Button
            variant="outline"
            className="h-24 flex-col gap-2"
            onClick={() => onRoleSelect('job-seeker')}
          >
            <User className="h-8 w-8 text-primary" />
            <span className="font-semibold">I'm a Job Seeker</span>
          </Button>
          <Button
            variant="outline"
            className="h-24 flex-col gap-2"
            onClick={() => onRoleSelect('employer')}
          >
            <Briefcase className="h-8 w-8 text-accent" />
            <span className="font-semibold">I'm an Employer</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
