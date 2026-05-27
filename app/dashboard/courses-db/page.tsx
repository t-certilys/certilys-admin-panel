import { DataTable } from "@/components/certilys-ui/dashboard/data-table";
import tableData from "../data.json";

export default function CoursesPage() {
  return (
    <div className="flex flex-col gap-6 py-6 px-4 lg:px-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Base des formations</h1>
        <p className="text-muted-foreground">
          Gérez votre base de formations et suivez leur statut de validation.
        </p>
      </div>

      <DataTable data={tableData} />
    </div>
  );
}
