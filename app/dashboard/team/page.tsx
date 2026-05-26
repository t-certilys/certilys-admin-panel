"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchFilter, type FilterField } from "@/components/ui/search-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const initialData = [
  {
    id: "1",
    team: "Equipe Alpha",
    role: "Development",
    status: "Active",
    members: 5,
    lead: "Sarah",
  },
  {
    id: "2",
    team: "Equipe Beta",
    role: "Design",
    status: "Review",
    members: 3,
    lead: "Mickael",
  },
  {
    id: "3",
    team: "Equipe Gamma",
    role: "Development",
    status: "Active",
    members: 7,
    lead: "Alex",
  },
  {
    id: "4",
    team: "Equipe Delta",
    role: "Testing",
    status: "Draft",
    members: 4,
    lead: "Julie",
  },
  {
    id: "5",
    team: "Equipe Epsilon",
    role: "Operations",
    status: "Pending",
    members: 6,
    lead: "David",
  },
  {
    id: "6",
    team: "Equipe Zeta",
    role: "Research",
    status: "Inactive",
    members: 2,
    lead: "Thomas",
  },
];

// ─── Composant ────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const [searchValue, setSearchValue] = React.useState("");
  const [filterValues, setFilterValues] = React.useState<
    Record<string, string>
  >({
    status: "",
    role: "",
  });

  // Filtres configurables pour le SearchFilter
  const filters: FilterField[] = [
    {
      id: "status",
      label: "Status",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-status" className="w-full">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Review">Review</SelectItem>
            <SelectItem value="Draft">Draft</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      id: "role",
      label: "Role",
      render: (value, onChange) => (
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger id="sf-filter-role" className="w-full">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Development">Development</SelectItem>
            <SelectItem value="Design">Design</SelectItem>
            <SelectItem value="Testing">Testing</SelectItem>
            <SelectItem value="Operations">Operations</SelectItem>
            <SelectItem value="Research">Research</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
  ];

  // Logique de filtrage (search + filters)
  const filteredData = initialData.filter((item) => {
    const matchesSearch =
      item.team.toLowerCase().includes(searchValue.toLowerCase()) ||
      item.lead.toLowerCase().includes(searchValue.toLowerCase());

    const matchesStatus =
      !filterValues.status || item.status === filterValues.status;
    const matchesRole =
      !filterValues.role || item.role === filterValues.role;

    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Equipes</h1>
        <p className="text-muted-foreground">
          Gérez vos équipes et suivez leur progression.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Intégration du composant SearchFilter */}
        <div className="flex items-center gap-3">
          <SearchFilter
            placeholder="Filtrer par équipe ou responsable..."
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            filters={filters}
            filterValues={filterValues}
            onFiltersApply={setFilterValues}
            onFiltersReset={() => setFilterValues({ status: "", role: "" })}
            className="w-full max-w-sm"
          />
        </div>

        {/* Tableau des données */}
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-1/4">Equipe</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Membres</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead className="text-right">ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.team}</TableCell>
                    <TableCell>{item.role}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          item.status === "Inactive"
                            ? "destructive"
                            : "secondary"
                        }
                        className="rounded-full px-2 py-0"
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.members}</TableCell>
                    <TableCell>{item.lead}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">
                      #{item.id}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Aucun résultat trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
