import { DataTable } from "@/components/certilys-ui/dashboard/data-table";
import tableData from "../data.json";

export default function LifecyclePage() {
  return (
    <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Base des recettes</h1>
        <p className="text-muted-foreground">
          Gérez votre base de recettes et suivez leur progression.
        </p>
      </div>

      <DataTable data={tableData} />
    </div>
  );
}
