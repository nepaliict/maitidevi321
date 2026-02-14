import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, RefreshCw, Plus, Download, Edit, Eye, ToggleLeft } from 'lucide-react';
import { type UserRole } from '@/config/adminRoles';

interface GamesModuleProps {
  role: UserRole;
  type: 'games' | 'game-categories' | 'game-providers';
}

export default function GamesModule({ role, type }: GamesModuleProps) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const title = type === 'games' ? 'Games' : type === 'game-categories' ? 'Game Categories' : 'Game Providers';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground">Manage {title.toLowerCase()}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add {type === 'games' ? 'Game' : type === 'game-categories' ? 'Category' : 'Provider'}
          </Button>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                {type === 'games' && <TableHead>Provider</TableHead>}
                {type === 'games' && <TableHead>Category</TableHead>}
                {type === 'games' && <TableHead>Min/Max Bet</TableHead>}
                {type === 'game-providers' && <TableHead>Code</TableHead>}
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={type === 'games' ? 7 : 5} className="text-center py-8 text-muted-foreground">
                  No {title.toLowerCase()} found. Click "Refresh" to load data.
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
