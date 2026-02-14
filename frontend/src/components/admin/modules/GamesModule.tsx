import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Search, RefreshCw, Plus, Download, Gamepad2, Layers, Server } from 'lucide-react';
import { type UserRole } from '@/config/adminRoles';

interface GamesModuleProps {
  role: UserRole;
  type: 'games' | 'game-categories' | 'game-providers';
}

export default function GamesModule({ role, type }: GamesModuleProps) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);

  const configs = {
    games: { title: 'Games', singular: 'Game', icon: Gamepad2 },
    'game-categories': { title: 'Game Categories', singular: 'Category', icon: Layers },
    'game-providers': { title: 'Game Providers', singular: 'Provider', icon: Server },
  };
  const { title, singular, icon: TitleIcon } = configs[type];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <TitleIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-muted-foreground text-sm">Manage {title.toLowerCase()}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="w-4 h-4 mr-2" />Add {singular}</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add {singular}</DialogTitle>
                <DialogDescription>Create a new {singular.toLowerCase()}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div><Label>Name</Label><Input placeholder={`${singular} name`} /></div>
                {type === 'game-providers' && <div><Label>Code</Label><Input placeholder="Provider code" /></div>}
                {type === 'game-categories' && <div><Label>SVG Icon</Label><Input placeholder="SVG markup or URL" /></div>}
                {type === 'games' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Provider</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="none">—</SelectItem></SelectContent></Select></div>
                      <div><Label>Category</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="none">—</SelectItem></SelectContent></Select></div>
                    </div>
                    <div><Label>Game UID</Label><Input placeholder="Unique game identifier" /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Min Bet</Label><Input type="number" placeholder="0" /></div>
                      <div><Label>Max Bet</Label><Input type="number" placeholder="0" /></div>
                    </div>
                    <div><Label>Image URL</Label><Input placeholder="https://..." /></div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button>Create {singular}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={`Search ${title.toLowerCase()}...`} className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-border/50">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Name</TableHead>
                {type === 'games' && <TableHead>Provider</TableHead>}
                {type === 'games' && <TableHead>Category</TableHead>}
                {type === 'games' && <TableHead>Min/Max Bet</TableHead>}
                {type === 'games' && <TableHead>Game UID</TableHead>}
                {type === 'game-providers' && <TableHead>Code</TableHead>}
                {type === 'game-categories' && <TableHead>Icon</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={type === 'games' ? 8 : 5} className="text-center py-12">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <TitleIcon className="w-10 h-10 mb-3 opacity-20" />
                    <p className="font-medium">No {title.toLowerCase()} found</p>
                    <p className="text-sm">Click "Refresh" to load data from API</p>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
