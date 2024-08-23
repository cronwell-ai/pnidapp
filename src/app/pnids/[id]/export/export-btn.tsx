"use client"
import { Download, FlaskConical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn, noRing } from "@/lib/utils"
import { getNodesForExport } from "@/actions/db/nodes"
import { useState } from "react"
import { useDocument } from "@/lib/reactquery/useDocument"
import sentryHelper from "@/lib/sentry"

export function ExportButton({docId, setError}: {docId: string, setError: (error: string | null) => void}) {
  const [loading, setLoading] = useState(false)
  const { data, error: docError } = useDocument(docId)

  async function handleJSON() {
    setLoading(true);
    setError(null);
    try {
      const res = await getNodesForExport(docId);
      if (!res.success) {
        setError(res.error);
      } else {
        const data = res.data;
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        downloadFile(blob, "export.json");
      }
    } catch (err) {
      setError("An error occurred during export");
    } finally {
      setLoading(false);
    }
  }

  async function handleCSV() {
    setLoading(true);
    setError(null);
    try {
      const res = await getNodesForExport(docId);
      if (!res.success) {
        setError(res.error);
      } else {
        const data = res.data;
        const csvContent = convertToCSV(data);
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        downloadFile(blob, "export.csv");
      }
    } catch (err) {
      setError("An error occurred during export");
    } finally {
      setLoading(false);
    }
  }

  function convertToCSV(data: any[]): string {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((fieldName) => JSON.stringify(row[fieldName])).join(",")
      ),
    ];

    return csvRows.join("\n");
  }

  function downloadFile(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  const annotateNonExistantPDF = async (shapes: any) => {
    if (docError) {
      sentryHelper.logError(docError);
      throw docError
    } else if (!data || !data.fdata) {
      sentryHelper.logError(new Error('ERR] useDocument --> No data returned'));
      throw docError
    } else {
      const formData = new FormData();
      formData.append('file', data.fdata);
      formData.append('shapes', JSON.stringify(shapes));
      formData.append('ftype', data.ftype);

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_EXPORT_SERVER_ADDR}/annotate_pdf`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          sentryHelper.logError(new Error('Network response was not ok'));
          throw new Error('Network response was not ok');
        }

        const blob = await response.blob();
        // Here you can handle the returned PDF blob, e.g., save it or display it
        return blob;
      } catch (error: any) {
        sentryHelper.logError(error);
      }
    }
  };

  async function handlePDF() {
    setLoading(true)
    setError(null)
    try {
      const res = await getNodesForExport(docId)
      if (!res.success) {
        setError(res.error)
      } else {
        const data = res.data
        const blob = await annotateNonExistantPDF(data)
        if (blob) {
          downloadFile(blob, "export.pdf")
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('[ERR] An error occurred during export')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={cn("h-min w-min p-1 px-4 m-0 mt-1 rounded-sm bg-secondary", noRing)} disabled={loading}>
          <Download className="w-4 h-4 mr-2" />
          {loading ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleJSON}>JSON</DropdownMenuItem>
        <DropdownMenuItem onClick={handleCSV}>CSV</DropdownMenuItem>
        <DropdownMenuItem onClick={handlePDF}>
          PDF (Beta)
          <FlaskConical className="w-4 h-4 ml-2" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
