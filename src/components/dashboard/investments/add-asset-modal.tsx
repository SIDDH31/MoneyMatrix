'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2 } from 'lucide-react';
import { AssetCategory } from '@prisma/client';
import { addAsset } from '@/actions/investments';

export function AddAssetModal() {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await addAsset(formData);

    setIsPending(false);

    if (result?.error) {
      setError(result.error);
    } else {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Investment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Investment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">{error}</div>}
          
          <div className="space-y-2">
            <Label htmlFor="category">Asset Category</Label>
            <Select name="category" required defaultValue={AssetCategory.INVESTMENT}>
              <SelectTrigger>
                <SelectValue placeholder="Select asset category" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(AssetCategory).map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Asset Name or Ticker</Label>
            <Input id="name" name="name" placeholder="e.g. AAPL, Vanguard S&P 500" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="investedAmount">Total Invested Amount ($)</Label>
            <Input id="investedAmount" name="investedAmount" type="number" step="0.01" min="0" placeholder="0.00" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentValue">Current Market Value ($)</Label>
            <Input id="currentValue" name="currentValue" type="number" step="0.01" min="0" placeholder="0.00" required />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Asset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
